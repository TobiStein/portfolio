/**
 * A procedural butterfly (monarch-like silhouette), painted once with Canvas 2D
 * into small textures, then sampled every frame by the ASCII renderer.
 *
 * Three layers are stored per texture pixel:
 * - `heat` (0–1): how warm the point is. Like a basking butterfly, the thorax is
 *   the hottest, the wings cool down towards their tips, veins and the dark rim
 *   stay warmer than the membrane.
 * - `heatLight`: the same for the light theme, except the dark rim: instead of
 *   one even band, it follows the wing's gradient, a little warmer than the
 *   membrane, so it shows more colours of the scale (see tone.ts).
 * - `material`: what the point is made of, to pick a fitting ASCII glyph.
 *
 * Coordinates: wings fully open, seen from above, thorax at (cx, cy).
 */

export const MAT = {
  none: 0,
  membrane: 1,
  vein: 2,
  band: 3,
  spot: 4,
  body: 5,
  antenna: 6
} as const

export interface ButterflyTexture {
  width: number
  height: number
  cx: number
  cy: number
  heat: Uint8Array
  heatLight: Uint8Array
  material: Uint8Array
  /** Random points inside the wings (texture coords), to spawn sparks from */
  wingPoints: Float32Array
}

type Point = [number, number]
type Segment = { c1: Point; c2: Point; to: Point }
type Wing = { side: 1 | -1; path: Path2D; edge: Path2D; root: Point }

const WIDTH = 480
const HEIGHT = 400
const CX = 240
const CY = 190

/* Right wings, relative to the thorax centre; the left side is mirrored. */
const FOREWING: { start: Point; segments: Segment[]; outer: number[] } = {
  start: [6, -14],
  segments: [
    { c1: [60, -70], c2: [140, -140], to: [218, -150] }, // leading edge
    { c1: [232, -152], c2: [238, -142], to: [232, -126] }, // rounded apex
    { c1: [222, -70], c2: [200, -20], to: [172, 16] }, // outer margin
    { c1: [120, 22], c2: [60, 18], to: [8, 6] } // inner margin, back to the body
  ],
  outer: [1, 2] // segments along the outer edge (spots)
}

const HINDWING: { start: Point; segments: Segment[]; outer: number[] } = {
  start: [8, 10],
  segments: [
    { c1: [58, 10], c2: [124, 18], to: [166, 40] },
    { c1: [200, 78], c2: [190, 134], to: [140, 164] },
    { c1: [104, 192], c2: [52, 188], to: [24, 142] },
    { c1: [10, 110], c2: [6, 60], to: [8, 10] }
  ],
  outer: [1, 2]
}

/* Veins: quadratic curves from the wing root to the margin */
const FORE_ROOT: Point = [10, -4]
const HIND_ROOT: Point = [12, 14]
const FORE_VEINS: [Point, Point][] = [
  [
    [90, -92],
    [214, -144]
  ],
  [
    [120, -86],
    [228, -116]
  ],
  [
    [132, -60],
    [220, -78]
  ],
  [
    [132, -34],
    [204, -38]
  ],
  [
    [120, -8],
    [186, -4]
  ],
  [
    [88, 10],
    [150, 16]
  ]
]
const HIND_VEINS: [Point, Point][] = [
  [
    [80, 16],
    [172, 34]
  ],
  [
    [92, 40],
    [192, 82]
  ],
  [
    [92, 62],
    [176, 128]
  ],
  [
    [80, 82],
    [138, 160]
  ],
  [
    [58, 94],
    [94, 180]
  ],
  [
    [34, 104],
    [48, 170]
  ]
]
/* Short cross-veins closing the "cell" of each wing */
const CROSS_VEINS: [Point, Point][] = [
  [
    [104, -64],
    [118, -16]
  ],
  [
    [70, 34],
    [76, 78]
  ]
]

function bezier(a: Point, s: Segment, t: number): Point {
  const u = 1 - t
  return [
    u * u * u * a[0] + 3 * u * u * t * s.c1[0] + 3 * u * t * t * s.c2[0] + t * t * t * s.to[0],
    u * u * u * a[1] + 3 * u * u * t * s.c1[1] + 3 * u * t * t * s.c2[1] + t * t * t * s.to[1]
  ]
}

function wingPath(wing: typeof FOREWING, side: 1 | -1): Path2D {
  const path = new Path2D()
  const x = (p: Point) => CX + side * p[0]
  const y = (p: Point) => CY + p[1]
  path.moveTo(x(wing.start), y(wing.start))
  for (const s of wing.segments) {
    path.bezierCurveTo(x(s.c1), y(s.c1), x(s.c2), y(s.c2), x(s.to), y(s.to))
  }
  path.closePath()
  return path
}

/** Open path along some segments of a wing outline (the dark rim follows the outer edges only). */
function edgePath(wing: typeof FOREWING, side: 1 | -1, indexes: number[]): Path2D {
  const path = new Path2D()
  const x = (p: Point) => CX + side * p[0]
  const y = (p: Point) => CY + p[1]
  let previous = wing.start
  wing.segments.forEach((s, index) => {
    if (indexes.includes(index)) {
      path.moveTo(x(previous), y(previous))
      path.bezierCurveTo(x(s.c1), y(s.c1), x(s.c2), y(s.c2), x(s.to), y(s.to))
    }
    previous = s.to
  })
  return path
}

function veinPath(root: Point, veins: [Point, Point][], side: 1 | -1): Path2D {
  const path = new Path2D()
  for (const [control, end] of veins) {
    path.moveTo(CX + side * root[0], CY + root[1])
    path.quadraticCurveTo(CX + side * control[0], CY + control[1], CX + side * end[0], CY + end[1])
  }
  return path
}

/** Spots along the outer margin, every `gap` pixels, `inset` pixels inside the wing. */
function marginSpots(wing: typeof FOREWING, inset: number, gap: number): Point[] {
  const centroid: Point = [110, wing === FOREWING ? -60 : 90]
  const spots: Point[] = []
  let previous = wing.start
  wing.segments.forEach((segment, index) => {
    const start = previous
    previous = segment.to
    if (!wing.outer.includes(index)) return
    let travelled = gap / 2
    let last = bezier(start, segment, 0)
    for (let i = 1; i <= 60; i++) {
      const point = bezier(start, segment, i / 60)
      travelled += Math.hypot(point[0] - last[0], point[1] - last[1])
      last = point
      if (travelled < gap) continue
      travelled = 0
      const dx = centroid[0] - point[0]
      const dy = centroid[1] - point[1]
      const length = Math.hypot(dx, dy) || 1
      spots.push([point[0] + (dx / length) * inset, point[1] + (dy / length) * inset])
    }
  })
  return spots
}

function canvas2d(): CanvasRenderingContext2D {
  const element = document.createElement('canvas')
  element.width = WIDTH
  element.height = HEIGHT
  const ctx = element.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas 2D unavailable')
  return ctx
}

const gray = (value: number) => {
  const v = Math.round(Math.min(1, Math.max(0, value)) * 255)
  return `rgb(${v} ${v} ${v})`
}

export function createButterfly(): ButterflyTexture {
  const sides: (1 | -1)[] = [1, -1]
  const wings: Wing[] = sides.flatMap((side) => [
    {
      side,
      path: wingPath(FOREWING, side),
      edge: edgePath(FOREWING, side, [0, 1, 2]),
      root: FORE_ROOT
    },
    {
      side,
      path: wingPath(HINDWING, side),
      edge: edgePath(HINDWING, side, [1, 2]),
      root: HIND_ROOT
    }
  ])
  const allWings = new Path2D()
  wings.forEach((wing) => allWings.addPath(wing.path))
  const veins = new Path2D()
  sides.forEach((side) => {
    veins.addPath(veinPath(FORE_ROOT, FORE_VEINS, side))
    veins.addPath(veinPath(HIND_ROOT, HIND_VEINS, side))
    for (const [a, b] of CROSS_VEINS) {
      veins.moveTo(CX + side * a[0], CY + a[1])
      veins.lineTo(CX + side * b[0], CY + b[1])
    }
  })
  const spots: Point[] = sides.flatMap((side) =>
    [
      ...marginSpots(FOREWING, 8, 17),
      ...marginSpots(HINDWING, 8, 17),
      // pale patches near the forewing apex
      [196, -118] as Point,
      [206, -100] as Point,
      [184, -104] as Point
    ].map(([x, y]) => [CX + side * x, CY + y] as Point)
  )

  const body = new Path2D()
  body.ellipse(CX, CY - 8, 9, 22, 0, 0, Math.PI * 2) // thorax
  body.ellipse(CX, CY + 56, 7, 48, 0, 0, Math.PI * 2) // abdomen
  body.moveTo(CX + 8, CY - 34)
  body.arc(CX, CY - 34, 8, 0, Math.PI * 2) // head
  const antennae = new Path2D()
  sides.forEach((side) => {
    antennae.moveTo(CX + side * 3, CY - 40)
    antennae.quadraticCurveTo(CX + side * 12, CY - 92, CX + side * 36, CY - 120)
  })

  /* ---- Heat ---- */
  // Warm at the wing root, cooling towards the tips (+ offset: a warmer copy)
  const wingGradient = (ctx: CanvasRenderingContext2D, wing: Wing, offset: number) => {
    const rx = CX + wing.side * wing.root[0]
    const ry = CY + wing.root[1]
    const gradient = ctx.createRadialGradient(rx, ry, 0, rx, ry, 240)
    gradient.addColorStop(0, gray(0.8 + offset))
    gradient.addColorStop(0.3, gray(0.56 + offset))
    gradient.addColorStop(0.7, gray(0.32 + offset))
    gradient.addColorStop(1, gray(0.2 + offset))
    return gradient
  }
  // The dark rim: one even band, or following the wing's gradient a little
  // warmer than the membrane
  const paintHeat = (rim: 'even' | 'graded') => {
    const heat = canvas2d()
    for (const wing of wings) {
      heat.fillStyle = wingGradient(heat, wing, 0)
      heat.fill(wing.path)
    }
    heat.save()
    heat.clip(allWings)
    heat.globalCompositeOperation = 'lighter'
    heat.strokeStyle = gray(0.16)
    heat.lineWidth = 6
    heat.lineCap = 'round'
    heat.stroke(veins)
    heat.globalCompositeOperation = 'source-over'
    heat.lineWidth = 26
    heat.lineCap = 'round'
    for (const wing of wings) {
      heat.strokeStyle = rim === 'even' ? gray(0.68) : wingGradient(heat, wing, 0.2)
      heat.stroke(wing.edge)
    }
    heat.fillStyle = gray(0.46)
    spots.forEach(([x, y]) => {
      heat.beginPath()
      heat.arc(x, y, 4.6, 0, Math.PI * 2)
      heat.fill()
    })
    heat.restore()
    const abdomen = heat.createLinearGradient(0, CY, 0, CY + 104)
    abdomen.addColorStop(0, gray(0.96))
    abdomen.addColorStop(1, gray(0.78))
    heat.fillStyle = abdomen
    heat.fill(body)
    heat.fillStyle = gray(1)
    heat.beginPath()
    heat.ellipse(CX, CY - 8, 9, 22, 0, 0, Math.PI * 2)
    heat.fill()
    heat.strokeStyle = gray(0.76)
    heat.lineWidth = 4
    heat.lineCap = 'round'
    heat.stroke(antennae)
    return heat.getImageData(0, 0, WIDTH, HEIGHT).data
  }

  /* ---- Materials: two RGB canvases, one mask per channel ---- */
  const m1 = canvas2d()
  m1.globalCompositeOperation = 'lighter'
  m1.fillStyle = 'rgb(255 0 0)'
  m1.fill(allWings)
  m1.save()
  m1.clip(allWings)
  m1.strokeStyle = 'rgb(0 255 0)'
  m1.lineWidth = 7
  m1.lineCap = 'round'
  m1.stroke(veins)
  m1.strokeStyle = 'rgb(0 0 255)'
  m1.lineWidth = 26
  wings.forEach((wing) => m1.stroke(wing.edge))
  m1.restore()

  const m2 = canvas2d()
  m2.globalCompositeOperation = 'lighter'
  m2.fillStyle = 'rgb(255 0 0)'
  spots.forEach(([x, y]) => {
    m2.beginPath()
    m2.arc(x, y, 4.6, 0, Math.PI * 2)
    m2.fill()
  })
  m2.fillStyle = 'rgb(0 255 0)'
  m2.fill(body)
  m2.strokeStyle = 'rgb(0 0 255)'
  m2.lineWidth = 5
  m2.lineCap = 'round'
  m2.stroke(antennae)
  m2.fillStyle = 'rgb(0 0 255)'
  sides.forEach((side) => {
    m2.beginPath()
    m2.ellipse(CX + side * 38, CY - 123, 5, 6, 0, 0, Math.PI * 2)
    m2.fill()
  })

  const h = paintHeat('even')
  const hl = paintHeat('graded')
  const a = m1.getImageData(0, 0, WIDTH, HEIGHT).data
  const b = m2.getImageData(0, 0, WIDTH, HEIGHT).data
  const size = WIDTH * HEIGHT
  const heatOut = new Uint8Array(size)
  const heatLight = new Uint8Array(size)
  const material = new Uint8Array(size)
  const T = 110
  const wingIndexes: number[] = []
  for (let i = 0, p = 0; i < size; i++, p += 4) {
    heatOut[i] = h[p]
    heatLight[i] = hl[p]
    let m: number = MAT.none
    if (b[p + 2] > T) m = MAT.antenna
    else if (b[p + 1] > T) m = MAT.body
    else if (b[p] > T) m = MAT.spot
    else if (a[p + 2] > T) m = MAT.band
    else if (a[p + 1] > T) m = MAT.vein
    else if (a[p] > T) m = MAT.membrane
    material[i] = m
    if (m === MAT.membrane && Math.random() < 0.012) wingIndexes.push(i)
  }
  const wingPoints = new Float32Array(wingIndexes.length * 2)
  wingIndexes.forEach((index, k) => {
    wingPoints[k * 2] = index % WIDTH
    wingPoints[k * 2 + 1] = Math.floor(index / WIDTH)
  })

  return {
    width: WIDTH,
    height: HEIGHT,
    cx: CX,
    cy: CY,
    heat: heatOut,
    heatLight,
    material,
    wingPoints
  }
}

/** Wing root (texture coords) used to orient vein glyphs. */
export function wingRoot(tex: ButterflyTexture, x: number, y: number): Point {
  const side = x >= tex.cx ? 1 : -1
  const root = y < tex.cy + 6 ? FORE_ROOT : HIND_ROOT
  return [tex.cx + side * root[0], tex.cy + root[1]]
}

/** Head centre (texture coords) used to orient antenna glyphs. */
export function headCentre(tex: ButterflyTexture): Point {
  return [tex.cx, tex.cy - 34]
}
