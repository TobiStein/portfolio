/**
 * Thermal ASCII field.
 *
 * A fixed canvas behind the page, drawn as a grid of monospace glyphs coloured
 * with the heat scale (--thermal-0 … --thermal-10):
 * - a cold ambient field (slow drifting "clouds"),
 * - a heat layer that diffuses, rises and cools: the pointer warms it, the
 *   butterfly's thorax feeds a faint plume,
 * - a butterfly sampled from a procedural texture, anchored to a
 *   `[data-butterfly]` element (size and position come from CSS),
 * - a few sparks.
 * Elements marked `[data-thermal-shield]` (text blocks) cool the field behind
 * them so reading is never disturbed; `data-thermal-shield="fixed"` is for
 * sticky or fixed elements (measured in viewport coordinates).
 *
 * Only cells whose glyph or colour changed are redrawn, from a pre-rendered
 * glyph atlas. With `prefers-reduced-motion`, a single still frame is drawn.
 */
import { MAT, createButterfly, headCentre, wingRoot, type ButterflyTexture } from './butterfly'
import { buildRamp, readThermalStops } from './color'
import { butterflyLevels, lightWarmth } from './tone'

// Glyph 0 (space) means "nothing drawn"
const CHARS = [...' .:-=+*#%@|/\\o\'",`~;^x&']
const G = Object.fromEntries(CHARS.map((char, index) => [char, index])) as Record<string, number>
const STEPS = 40 // colours in the heat scale
// Frame budget: 30 fps while something happens, less when the scene is calm
const FRAME_ACTIVE = 1000 / 30
const FRAME_BUTTERFLY = 1000 / 24
const FRAME_IDLE = 1000 / 12
const SHIELD_CAP = 0.11 // hottest field value allowed behind text
const SHIELD_PAD = 30 // soft edge around shielded blocks, in CSS px
// Light theme: warmest colour of the field, the last but one (the pink of the
// fire scale); the last one stays for the butterfly
const LIGHT_FIELD_MAX = 0.9

/** Field glyphs by temperature (cold dots → hot @), a few interchangeable
 *  glyphs per level so the texture never lines up into stripes. */
const FIELD_LEVELS: { limit: number; glyphs: number[] }[] = [
  [0.04, ' '],
  [0.09, '..`,'],
  [0.14, ":.',"],
  [0.19, '-:;~'],
  [0.25, '=-~+'],
  [0.32, '+=*^'],
  [0.4, '*+x#'],
  [0.5, '#*%'],
  [0.62, '%#&'],
  [Infinity, '@%#&']
].map(([limit, glyphs]) => ({
  limit: limit as number,
  glyphs: [...(glyphs as string)].map((glyph) => G[glyph])
}))

/** Wing membrane glyphs, coolest → warmest */
const MEMBRANE = [".:'.", ':-~:', '-=~:', '=+-~', '+*=x'].map((set) =>
  [...set].map((glyph) => G[glyph])
)

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
}

interface Shield {
  el: Element
  top: number
  left: number
  width: number
  height: number
  /** `data-thermal-shield="fixed"`: viewport coordinates (sticky or fixed elements) */
  fixed: boolean
}

function hash2(x: number, y: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Line glyph matching a direction (screen pixels, y down). */
function lineGlyph(dx: number, dy: number): number {
  let angle = Math.atan2(dy, dx)
  if (angle < 0) angle += Math.PI
  const deg = (angle * 180) / Math.PI
  if (deg < 30 || deg >= 150) return G['-']
  if (deg < 76) return G['\\']
  if (deg < 104) return G['|']
  return G['/']
}

export class ThermalScene {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly root = document.documentElement
  private readonly butterfly: ButterflyTexture

  // Grid
  private dpr = 1
  private fontPx = 12
  private cellW = 7
  private cellH = 14
  private cw = 14
  private ch = 28
  private cols = 0
  private rows = 0
  private height = 0
  private codes = new Int32Array(0)
  private ambient = new Float32Array(0)
  private heat = new Float32Array(0)
  private heatNext = new Float32Array(0)
  private mask = new Float32Array(0)
  private grain = new Float32Array(0)
  private overlay = new Int32Array(0)
  private overlayTouched: number[] = []

  // Colour
  private atlas: HTMLCanvasElement | null = null
  private previousAtlas: HTMLCanvasElement | null = null
  /** Palette and scheme the atlas was built for, e.g. "fire dark" */
  private themeKey = ''
  /** Light theme: its own tone mapping for the butterfly and the warmth (tone.ts) */
  private light = true
  private lightLevels: Float32Array = new Float32Array(256)
  /** Glyph font: the --font-mono token (tokens.css) */
  private fontFamily = 'monospace'
  private fontReady = false

  // Time & motion
  private motion = true
  private raf = 0
  private lastFrame = 0
  private time = 0
  private frame = 0
  private sweep: { start: number; duration: number; boot: boolean } | null = null
  private sweepRow = Infinity
  private boot = false

  // Pointer
  private pointer = { x: -1e4, y: -1e4, lastX: -1e4, lastY: -1e4, moved: -1e4, inside: false }
  private bursts: { x: number; y: number }[] = []

  // Butterfly state
  private anchor: HTMLElement | null = null
  private warm = 1
  private warmStart = 0
  private flapPhase = 0
  private burst = 0
  private nextBurst = 4
  private startle = 0
  private offset = { x: 0, y: 0, vx: 0, vy: 0 }
  private sparks: Spark[] = []
  private sparkClock = 0

  private butterflyVisible = false

  // Shields & scroll
  private shields: Shield[] = []
  private maskDirty = true
  private lastScroll = -1

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')
    this.canvas = canvas
    this.ctx = ctx
    this.butterfly = createButterfly()
    this.lightLevels = butterflyLevels(this.butterfly)

    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    this.motion = !reduced.matches
    reduced.addEventListener('change', () => {
      this.motion = !reduced.matches
      this.restart()
    })

    this.themeKey = this.currentTheme()
    this.light = !this.root.classList.contains('dark')
    this.fontFamily =
      getComputedStyle(this.root).getPropertyValue('--font-mono').trim() || 'monospace'
    this.boot = this.root.dataset.thermalBoot === '1' && this.motion
    this.anchor = document.querySelector<HTMLElement>('[data-butterfly]')
    if (this.boot && this.anchor) this.warm = 0

    this.resize()
    this.collectShields()
    this.bindEvents()

    // Wait (briefly) for the monospace font so glyphs never change shape mid-way
    const ready = document.fonts
      ? Promise.race([
          document.fonts.load(`${this.fontPx}px ${this.fontFamily}`),
          new Promise((resolve) => setTimeout(resolve, 1500))
        ])
      : Promise.resolve()
    ready
      .catch(() => undefined)
      .then(() => {
        this.fontReady = true
        this.resize()
        this.collectShields()
        // The opening scan only plays if it can start promptly
        if (this.boot && performance.now() < 2200) {
          this.sweep = { start: 0, duration: 0.95, boot: true }
          this.sweepRow = -1
          this.warmStart = 0.35
          this.revealText(0.95)
        } else {
          this.boot = false
          this.warm = 1
        }
        this.restart()
      })
  }

  /* ------------------------------------------------------------------ */
  /* Setup                                                                */
  /* ------------------------------------------------------------------ */

  /** Current palette and scheme: the heat scale is rebuilt when it changes */
  private currentTheme() {
    const scheme = this.root.classList.contains('dark') ? 'dark' : 'light'
    return `${this.root.dataset.palette ?? ''} ${scheme}`
  }

  private bindEvents() {
    let resizeQueued = false
    const queueResize = () => {
      if (resizeQueued) return
      resizeQueued = true
      requestAnimationFrame(() => {
        resizeQueued = false
        this.resize()
        this.collectShields()
        if (!this.motion) this.renderStill()
      })
    }
    window.addEventListener('resize', queueResize, { passive: true })
    new ResizeObserver(() => {
      this.collectShields()
      if (!this.motion) this.queueStill()
    }).observe(document.body)

    // Still mode: the butterfly and the shields move with the page
    window.addEventListener(
      'scroll',
      () => {
        if (!this.motion) this.queueStill()
      },
      { passive: true }
    )

    window.addEventListener(
      'pointermove',
      (event) => {
        this.pointer.x = event.clientX
        this.pointer.y = event.clientY
        this.pointer.moved = this.time
        this.pointer.inside = true
      },
      { passive: true }
    )
    window.addEventListener(
      'pointerdown',
      (event) => {
        if (!this.motion) return
        this.bursts.push({ x: event.clientX, y: event.clientY })
      },
      { passive: true }
    )
    document.documentElement.addEventListener('pointerleave', () => {
      this.pointer.inside = false
    })

    // Theme or palette switch: html.dark and html[data-palette], set by the theme controller
    new MutationObserver(() => {
      const theme = this.currentTheme()
      if (theme === this.themeKey) return
      this.themeKey = theme
      this.light = !this.root.classList.contains('dark')
      this.previousAtlas = this.atlas
      this.atlas = this.buildAtlas()
      if (this.motion && this.previousAtlas && this.raf) {
        this.sweep = { start: this.time, duration: 0.55, boot: false }
        this.sweepRow = -1
      } else {
        this.previousAtlas = null
        this.codes.fill(-2)
        this.renderStill()
      }
    }).observe(this.root, { attributes: true, attributeFilter: ['class', 'data-palette'] })

    document.addEventListener('visibilitychange', () => this.restart())
  }

  private resize() {
    const width = this.canvas.clientWidth || window.innerWidth
    const height = this.canvas.clientHeight || window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (width * height * dpr * dpr > 9e6) dpr = Math.max(1, Math.sqrt(9e6 / (width * height)))
    this.fontPx = width < 640 ? 11 : 12
    this.ctx.font = `${this.fontPx}px ${this.fontFamily}`
    const advance = this.ctx.measureText('M').width || this.fontPx * 0.6
    this.cw = Math.max(2, Math.round(advance * dpr))
    this.ch = Math.max(2, Math.round(this.fontPx * 1.2 * dpr))
    this.cellW = this.cw / dpr
    this.cellH = this.ch / dpr
    this.dpr = dpr
    this.height = height
    this.canvas.width = Math.ceil(width * dpr)
    this.canvas.height = Math.ceil(height * dpr)
    this.cols = Math.ceil(width / this.cellW) + 1
    this.rows = Math.ceil(height / this.cellH) + 1
    const size = this.cols * this.rows
    this.codes = new Int32Array(size).fill(-2)
    this.ambient = new Float32Array(size)
    this.heat = new Float32Array(size)
    this.heatNext = new Float32Array(size)
    this.mask = new Float32Array(size)
    this.grain = new Float32Array(size)
    for (let i = 0; i < size; i++) this.grain[i] = hash2(i % this.cols, (i / this.cols) | 0)
    this.overlay = new Int32Array(size).fill(-2)
    this.overlayTouched = []
    this.maskDirty = true
    this.atlas = this.buildAtlas()
    this.previousAtlas = null
    this.updateAmbient()
  }

  private buildAtlas(): HTMLCanvasElement {
    const ramp = buildRamp(readThermalStops(this.root), STEPS)
    const atlas = document.createElement('canvas')
    atlas.width = CHARS.length * this.cw
    atlas.height = STEPS * this.ch
    const g = atlas.getContext('2d')
    if (!g) return atlas
    g.font = `${this.fontPx * this.dpr}px ${this.fontFamily}`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    for (let color = 0; color < STEPS; color++) {
      g.fillStyle = ramp[color]
      for (let glyph = 1; glyph < CHARS.length; glyph++) {
        g.fillText(
          CHARS[glyph],
          glyph * this.cw + this.cw / 2,
          color * this.ch + this.ch / 2 + this.dpr * 0.5
        )
      }
    }
    return atlas
  }

  private collectShields() {
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    this.shields = Array.from(document.querySelectorAll('[data-thermal-shield]')).map((el) => {
      const rect = el.getBoundingClientRect()
      const fixed = el.getAttribute('data-thermal-shield') === 'fixed'
      return {
        el,
        top: rect.top + (fixed ? 0 : scrollY),
        left: rect.left + (fixed ? 0 : scrollX),
        width: rect.width,
        height: rect.height,
        fixed
      }
    })
    this.maskDirty = true
  }

  /* ------------------------------------------------------------------ */
  /* Loop                                                                 */
  /* ------------------------------------------------------------------ */

  private restart() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    if (!this.fontReady || document.hidden) return
    if (!this.motion) {
      this.warm = 1
      this.sweep = null
      this.sweepRow = Infinity
      this.previousAtlas = null
      this.heat.fill(0)
      this.sparks = []
      this.codes.fill(-2)
      this.renderStill()
      return
    }
    this.lastFrame = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  private tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick)
    const elapsed = now - this.lastFrame
    if (elapsed < this.frameBudget() - 2) return
    this.lastFrame = now
    const dt = Math.min(0.1, elapsed / 1000)
    this.time += dt
    this.frame++
    this.step(dt)
    this.render()
    if (this.boot && !this.sweep && this.warm >= 1) {
      this.boot = false
      try {
        sessionStorage.setItem('thermal-booted', '1')
      } catch {
        // Storage unavailable: the boot simply plays again next time.
      }
    }
  }

  /** Milliseconds between frames for the current state of the scene. */
  private frameBudget() {
    const busy =
      this.sweep !== null ||
      this.time - this.pointer.moved < 1.2 ||
      (this.butterflyVisible && (this.startle > 0.05 || this.burst > 0 || this.warm < 1)) ||
      (this.sparks.length > 0 && !this.butterflyVisible)
    if (busy) return FRAME_ACTIVE
    return this.butterflyVisible ? FRAME_BUTTERFLY : FRAME_IDLE
  }

  private renderStill() {
    if (!this.fontReady) return
    this.render()
  }

  private stillQueued = false
  private queueStill() {
    if (this.stillQueued) return
    this.stillQueued = true
    requestAnimationFrame(() => {
      this.stillQueued = false
      this.renderStill()
    })
  }

  /** Blocks marked [data-reveal] appear exactly when the scan line reaches them. */
  private revealText(duration: number) {
    const speed = ((this.rows + 2) * this.cellH) / duration // px per second
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      el.getAnimations().forEach((animation) => animation.cancel())
      const rect = el.getBoundingClientRect()
      el.animate(
        [
          { clipPath: 'inset(-2rem -100vw 100% -100vw)', opacity: 0.35 },
          { clipPath: 'inset(-2rem -100vw -2rem -100vw)', opacity: 1 }
        ],
        {
          delay: (Math.max(0, rect.top) / speed) * 1000,
          duration: Math.max(120, (rect.height / speed) * 1000),
          easing: 'linear',
          fill: 'backwards'
        }
      )
    })
  }

  /* ------------------------------------------------------------------ */
  /* Simulation                                                           */
  /* ------------------------------------------------------------------ */

  private updateAmbient() {
    const { cols, rows, cellW, cellH, time } = this
    const drift = this.motion ? time : 0
    for (let r = 0; r < rows; r++) {
      const y = (r * cellH) / 170 - drift * 0.03
      for (let c = 0; c < cols; c++) {
        const x = (c * cellW) / 250 + drift * 0.012
        const n = 0.62 * valueNoise(x, y) + 0.38 * valueNoise(x * 2.3 + 7.1, y * 2.3 - 3.7)
        this.ambient[r * cols + c] = 0.05 + 0.28 * smoothstep(0.28, 0.88, n)
      }
    }
  }

  private inject(x: number, y: number, radius: number, amount: number) {
    const { cols, rows, cellW, cellH } = this
    const cx = x / cellW
    const cy = y / cellH
    const rx = radius / cellW
    const ry = radius / cellH
    const c0 = Math.max(0, Math.floor(cx - rx * 2))
    const c1 = Math.min(cols - 1, Math.ceil(cx + rx * 2))
    const r0 = Math.max(0, Math.floor(cy - ry * 2))
    const r1 = Math.min(rows - 1, Math.ceil(cy + ry * 2))
    for (let r = r0; r <= r1; r++) {
      const dy = (r + 0.5 - cy) / ry
      for (let c = c0; c <= c1; c++) {
        const dx = (c + 0.5 - cx) / rx
        const falloff = Math.exp(-(dx * dx + dy * dy) * 1.4)
        if (falloff < 0.02) continue
        const i = r * cols + c
        this.heat[i] = Math.min(1, this.heat[i] + amount * falloff)
      }
    }
  }

  private step(dt: number) {
    if (this.frame % 3 === 0) this.updateAmbient()

    // Pointer: a warm hand leaves a trail while it moves
    const p = this.pointer
    if (p.inside && this.time - p.moved < 0.5) {
      const distance = Math.hypot(p.x - p.lastX, p.y - p.lastY)
      const amount = Math.min(0.32, 0.07 + distance * 0.004)
      const steps = Math.min(12, Math.max(1, Math.ceil(distance / 14)))
      for (let s = 1; s <= steps; s++) {
        const t = s / steps
        const x = p.lastX < -1e3 ? p.x : p.lastX + (p.x - p.lastX) * t
        const y = p.lastY < -1e3 ? p.y : p.lastY + (p.y - p.lastY) * t
        this.inject(x, y, 38, amount / Math.sqrt(steps))
      }
    }
    p.lastX = p.x
    p.lastY = p.y
    for (const burst of this.bursts) {
      this.inject(burst.x, burst.y, 70, 0.85)
      for (let k = 0; k < 14; k++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 40 + Math.random() * 90
        this.sparks.push({
          x: burst.x,
          y: burst.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 30,
          life: 0,
          max: 0.7 + Math.random() * 0.8
        })
      }
    }
    this.bursts = []

    this.stepButterfly(dt)
    this.diffuse(dt)
    this.stepSparks(dt)
  }

  private diffuse(dt: number) {
    const { cols, rows, heat, heatNext } = this
    const decay = Math.exp(-dt / 1.25)
    const rise = Math.min(0.5, 5.5 * dt)
    const spread = 0.3
    let active = false
    for (let r = 0; r < rows; r++) {
      const below = r < rows - 1 ? cols : 0
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        const h = heat[i]
        const l = c > 0 ? heat[i - 1] : h
        const rr = c < cols - 1 ? heat[i + 1] : h
        const u = r > 0 ? heat[i - cols] : h
        const d = heat[i + below]
        let v = h + spread * ((l + rr + u + d) * 0.25 - h)
        v += (d - v) * rise * 0.5
        v *= decay
        heatNext[i] = v < 0.003 ? 0 : v
        if (v > 0.003) active = true
      }
    }
    this.heat = heatNext
    this.heatNext = heat
    if (!active) this.heat.fill(0)
  }

  private butterflyFrame() {
    const anchor = this.anchor
    if (!anchor || !anchor.isConnected) return null
    const rect = anchor.getBoundingClientRect()
    if (rect.width < 40) return null
    const tex = this.butterfly
    const scale = rect.width / tex.width
    const bob = this.motion ? Math.sin(this.time * 1.1) * 3 : 0
    const x = rect.left + rect.width / 2 + this.offset.x
    const y = rect.top + tex.cy * scale + this.offset.y + bob
    const angle = this.motion
      ? 0.045 * Math.sin(this.time * 0.37) + this.startle * 0.07 * Math.sin(this.time * 9)
      : 0
    return { x, y, scale, angle, wingspan: rect.width }
  }

  private stepButterfly(dt: number) {
    const frame = this.butterflyFrame()
    if (!frame) return
    // Warm-up (first visit): the hottest parts appear first
    if (this.warm < 1 && this.time > this.warmStart) {
      this.warm = Math.min(1, this.warm + dt / 1.5)
    }

    // Startle: the pointer gets close → it flutters away, then settles back
    const p = this.pointer
    const dx = p.x - frame.x
    const dy = p.y - frame.y
    const distance = Math.hypot(dx, dy) || 1
    const radius = frame.wingspan * 0.5
    if (p.inside && this.time - p.moved < 0.35 && distance < radius) {
      const force = 1 - distance / radius
      this.startle = Math.min(1, this.startle + force * dt * 5)
      this.offset.vx -= (dx / distance) * force * 1400 * dt
      this.offset.vy -= (dy / distance) * force * 1000 * dt
    }
    this.startle *= Math.exp(-dt / 1.4)
    const o = this.offset
    o.vx += -o.x * 7 * dt
    o.vy += -o.y * 7 * dt
    o.vx *= Math.exp(-dt * 2.6)
    o.vy *= Math.exp(-dt * 2.6)
    o.x += o.vx * dt
    o.y += o.vy * dt
    const limit = frame.wingspan * 0.22
    const length = Math.hypot(o.x, o.y)
    if (length > limit) {
      o.x *= limit / length
      o.y *= limit / length
    }

    // Wing beats: slow basking, a burst of flaps every few seconds
    if (this.time > this.nextBurst) {
      this.burst = 1
      this.nextBurst = this.time + 6 + Math.random() * 5
    }
    this.burst = Math.max(0, this.burst - dt / 1.8)
    const activity = Math.max(Math.sin(Math.PI * this.burst), this.startle)
    this.flapPhase += (0.22 + activity * 2.6) * dt

    // Faint plume of warm air above the thorax
    const plume = this.warm * (0.035 + activity * 0.05)
    this.inject(frame.x, frame.y - 20 * frame.scale, 18 * frame.scale + 6, plume)

    // Sparks shed by the wings (only while the butterfly is on screen)
    if (!this.butterflyVisible) this.sparkClock = 0
    else this.sparkClock += dt * this.warm * (1.1 + activity * 7)
    const tex = this.butterfly
    while (this.sparkClock > 1 && tex.wingPoints.length > 0) {
      this.sparkClock -= 1
      const k = Math.floor(Math.random() * (tex.wingPoints.length / 2)) * 2
      const flap = this.flaps().fore
      const sx = frame.x + (tex.wingPoints[k] - tex.cx) * frame.scale * flap
      const sy = frame.y + (tex.wingPoints[k + 1] - tex.cy) * frame.scale
      this.sparks.push({
        x: sx,
        y: sy,
        vx: (Math.random() - 0.5) * 24,
        vy: -18 - Math.random() * 26,
        life: 0,
        max: 1.2 + Math.random() * 1.4
      })
    }
  }

  /** Horizontal opening of the fore- and hindwings (1 = fully open). */
  private flaps() {
    if (!this.motion) return { fore: 1, hind: 1 }
    const activity = Math.max(Math.sin(Math.PI * this.burst), this.startle)
    const depth = 0.1 + activity * 0.72
    const wave = (phase: number) => 0.5 - 0.5 * Math.cos(phase * Math.PI * 2)
    return {
      fore: Math.max(0.16, 1 - depth * wave(this.flapPhase)),
      hind: Math.max(0.16, 1 - depth * wave(this.flapPhase - 0.07))
    }
  }

  private stepSparks(dt: number) {
    const alive: Spark[] = []
    for (const spark of this.sparks) {
      spark.life += dt
      if (spark.life >= spark.max) continue
      spark.vx += Math.sin(this.time * 3 + spark.y * 0.05) * 6 * dt
      spark.vy -= 4 * dt
      spark.x += spark.vx * dt
      spark.y += spark.vy * dt
      alive.push(spark)
    }
    this.sparks = alive.slice(-80)
  }

  /* ------------------------------------------------------------------ */
  /* Rendering                                                            */
  /* ------------------------------------------------------------------ */

  private updateMask() {
    const scroll = window.scrollY
    if (!this.maskDirty && scroll === this.lastScroll) return
    this.maskDirty = false
    this.lastScroll = scroll
    const { cols, rows, cellW, cellH, mask } = this
    mask.fill(0)
    const scrollX = window.scrollX
    for (const shield of this.shields) {
      const top = shield.fixed ? shield.top : shield.top - scroll
      const left = shield.fixed ? shield.left : shield.left - scrollX
      const bottom = top + shield.height
      const right = left + shield.width
      if (bottom < -SHIELD_PAD || top > this.height + SHIELD_PAD) continue
      const r0 = Math.max(0, Math.floor((top - SHIELD_PAD) / cellH))
      const r1 = Math.min(rows - 1, Math.ceil((bottom + SHIELD_PAD) / cellH))
      const c0 = Math.max(0, Math.floor((left - SHIELD_PAD) / cellW))
      const c1 = Math.min(cols - 1, Math.ceil((right + SHIELD_PAD) / cellW))
      for (let r = r0; r <= r1; r++) {
        const py = (r + 0.5) * cellH
        const dy = Math.max(top - py, 0, py - bottom)
        for (let c = c0; c <= c1; c++) {
          const px = (c + 0.5) * cellW
          const dx = Math.max(left - px, 0, px - right)
          const d = dx === 0 && dy === 0 ? 0 : Math.hypot(dx, dy)
          const v = d === 0 ? 1 : Math.max(0, 1 - d / SHIELD_PAD)
          const i = r * cols + c
          if (v > mask[i]) mask[i] = v
        }
      }
    }
  }

  private colorIndex(t: number) {
    return Math.max(0, Math.min(STEPS - 1, Math.round(t * (STEPS - 1))))
  }

  /** Field glyph for a cell: its level, then one of the level's variants. The
   *  variant slowly changes over time, like the grain of a thermal sensor. */
  private fieldGlyph(t: number, i: number) {
    let level = FIELD_LEVELS[FIELD_LEVELS.length - 1]
    for (const candidate of FIELD_LEVELS) {
      if (t < candidate.limit) {
        level = candidate
        break
      }
    }
    const glyphs = level.glyphs
    if (glyphs.length === 1) return glyphs[0]
    const grain = this.grain[i]
    const epoch = this.motion ? Math.floor(this.time * 0.35 + grain * 9) : 0
    const pick = hash2(i, epoch)
    return glyphs[Math.floor(pick * glyphs.length)]
  }

  private paintSparks() {
    const { cols, rows, cellW, cellH, overlay } = this
    for (const index of this.overlayTouched) overlay[index] = -2
    this.overlayTouched = []
    for (const spark of this.sparks) {
      const c = Math.floor(spark.x / cellW)
      const r = Math.floor(spark.y / cellH)
      if (c < 0 || r < 0 || c >= cols || r >= rows) continue
      const f = 1 - spark.life / spark.max
      const glyph = f > 0.72 ? G['*'] : f > 0.48 ? G['+'] : f > 0.24 ? G["'"] : G['.']
      const i = r * cols + c
      overlay[i] = glyph * STEPS + this.colorIndex(0.5 + 0.45 * f)
      this.overlayTouched.push(i)
    }
  }

  private render() {
    if (!this.atlas) return
    this.updateMask()
    this.paintSparks()
    const { cols, rows, cellW, cellH, cw, ch, ctx, codes, ambient, heat, mask, overlay, light } =
      this

    // Sensor sweep (first visit, theme switch): a bright line scans the screen
    let scanRow = -10
    if (this.sweep) {
      const progress = (this.time - this.sweep.start) / this.sweep.duration
      if (progress >= 1) {
        this.sweep = null
        this.sweepRow = Infinity
        this.previousAtlas = null
        codes.fill(-2)
      } else {
        const row = Math.floor(progress * (rows + 2))
        if (row !== this.sweepRow) {
          // rows the line just crossed switch to the new palette
          for (
            let r = Math.max(0, Math.min(this.sweepRow, rows));
            r <= Math.min(row, rows - 1);
            r++
          ) {
            codes.fill(-2, r * cols, (r + 1) * cols)
          }
        }
        this.sweepRow = row
        scanRow = row
      }
    }
    const bootHide = this.sweep?.boot ?? false

    // Butterfly placement for this frame
    const frame = this.butterflyFrame()
    const tex = this.butterfly
    const flaps = this.flaps()
    let bc0 = 1
    let bc1 = 0
    let br0 = 1
    let br1 = 0
    let cos = 1
    let sin = 0
    this.butterflyVisible = false
    if (frame && this.warm > 0) {
      const pad = 1.12
      bc0 = Math.max(0, Math.floor((frame.x - tex.cx * frame.scale * pad) / cellW))
      bc1 = Math.min(
        cols - 1,
        Math.ceil((frame.x + (tex.width - tex.cx) * frame.scale * pad) / cellW)
      )
      br0 = Math.max(0, Math.floor((frame.y - tex.cy * frame.scale * pad) / cellH))
      br1 = Math.min(
        rows - 1,
        Math.ceil((frame.y + (tex.height - tex.cy) * frame.scale * pad) / cellH)
      )
      cos = Math.cos(frame.angle)
      sin = Math.sin(frame.angle)
      this.butterflyVisible = bc0 <= bc1 && br0 <= br1
    }

    // The subject stands out: the field around the butterfly is cooler
    let haloX = 0
    let haloY = 0
    let haloRx = 1
    let haloRy = 1
    const halo = Boolean(frame && this.warm > 0)
    if (frame && halo) {
      haloX = frame.x / cellW
      haloY = (frame.y + (tex.height / 2 - tex.cy) * frame.scale) / cellH
      haloRx = ((tex.width / 2) * frame.scale) / cellW
      haloRy = ((tex.height / 2) * frame.scale) / cellH
    }

    for (let r = 0; r < rows; r++) {
      const atlas = r > this.sweepRow && this.previousAtlas ? this.previousAtlas : this.atlas
      const hidden = bootHide && r > this.sweepRow
      const scan = r === scanRow || r === scanRow - 1 ? (r === scanRow ? 0.32 : 0.14) : 0
      const inButterflyRows = r >= br0 && r <= br1
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        let code = -1
        if (!hidden) {
          let base = ambient[i]
          if (halo) {
            const hx = (c - haloX) / haloRx
            const hy = (r - haloY) / haloRy
            const q = hx * hx + hy * hy
            if (q < 1.8) base *= 0.4 + 0.6 * smoothstep(0.55, 1.8, q)
          }
          // Light theme: the middle of a trail reaches the warm colours (tone.ts)
          const warmth = heat[i]
          const field = base + (light && warmth > 0 ? lightWarmth(warmth) : warmth)
          const m = mask[i]
          let t = m > 0 ? field + (Math.min(field, SHIELD_CAP) - field) * m : field
          t += scan
          let glyph = this.fieldGlyph(t, i)
          let level = 0.06 + t * 0.86
          if (light) level = Math.min(level, LIGHT_FIELD_MAX)
          if (frame && inButterflyRows && c >= bc0 && c <= bc1) {
            const sample = this.sampleButterfly(c, r, frame, flaps, cos, sin)
            if (sample >= 0) {
              glyph = sample >> 8
              level = ((sample & 255) / 255) * (1 - 0.55 * m) + scan * 0.5
            }
          }
          code = glyph === 0 ? -1 : glyph * STEPS + this.colorIndex(level)
          const spark = overlay[i]
          if (spark >= 0 && m < 0.6) code = spark
        }
        if (code === codes[i]) continue
        codes[i] = code
        const x = c * cw
        const y = r * ch
        ctx.clearRect(x, y, cw, ch)
        if (code >= 0) {
          const glyph = (code / STEPS) | 0
          const color = code - glyph * STEPS
          ctx.drawImage(atlas, glyph * cw, color * ch, cw, ch, x, y, cw, ch)
        }
      }
    }
  }

  /** Glyph (high byte) and heat 0–255 (low byte) of the butterfly in a cell, or -1. */
  private sampleButterfly(
    c: number,
    r: number,
    frame: { x: number; y: number; scale: number },
    flaps: { fore: number; hind: number },
    cos: number,
    sin: number
  ): number {
    const tex = this.butterfly
    const px = (c + 0.5) * this.cellW - frame.x
    let best = 0
    let bestIndex = -1
    let bestX = 0
    let bestY = 0
    let bestFlap = 1
    for (let k = -1; k <= 1; k++) {
      const py = (r + 0.5 + k * 0.3) * this.cellH - frame.y
      const rx = px * cos + py * sin
      const ry = -px * sin + py * cos
      const ty = tex.cy + ry / frame.scale
      if (ty < 0 || ty >= tex.height) continue
      const yi = ty | 0
      // Body and antennae are never squeezed by the wing beat
      let tx = tex.cx + rx / frame.scale
      let index = tx >= 0 && tx < tex.width ? yi * tex.width + (tx | 0) : -1
      let material = index >= 0 ? tex.material[index] : 0
      let flap = 1
      if (material !== MAT.body && material !== MAT.antenna) {
        flap = ty < tex.cy + 6 ? flaps.fore : flaps.hind
        tx = tex.cx + rx / (frame.scale * flap)
        index = tx >= 0 && tx < tex.width ? yi * tex.width + (tx | 0) : -1
        material = index >= 0 ? tex.material[index] : 0
        if (material === MAT.body || material === MAT.antenna) material = 0
      }
      if (material > best) {
        best = material
        bestIndex = index
        bestX = tx
        bestY = ty
        bestFlap = flap
      }
    }
    if (best === 0 || bestIndex < 0) return -1
    const heat = tex.heat[bestIndex] / 255
    // Warm-up: hottest parts become visible first
    if (heat < 1 - this.warm * 1.25) return -1
    // Dark theme: linear. Light theme: spread over the whole scale (tone.ts)
    const tone = this.light
      ? this.lightLevels[tex.heatLight[bestIndex]]
      : Math.min(1, 0.2 + 0.8 * heat)
    const level = tone * (0.6 + 0.4 * this.warm)

    let glyph: number
    const grain = hash2(bestX / 5, bestY / 9)
    switch (best) {
      case MAT.antenna:
        if (bestY < tex.cy - 114) glyph = G['o']
        else {
          const [hx, hy] = headCentre(tex)
          glyph = lineGlyph(bestX - hx, bestY - hy)
        }
        break
      case MAT.body:
        if (bestY < tex.cy - 26) glyph = G['@']
        else if (bestY < tex.cy + 12) glyph = G['#']
        else glyph = Math.floor((bestY - tex.cy) / 9) % 2 === 0 ? G['='] : G['#']
        break
      case MAT.spot:
        glyph = G['o']
        break
      case MAT.band:
        glyph = grain < 0.18 ? G['%'] : G['#']
        break
      case MAT.vein: {
        const [vx, vy] = wingRoot(tex, bestX, bestY)
        glyph = lineGlyph((bestX - vx) * bestFlap, bestY - vy)
        break
      }
      default: {
        // Wing membrane: scale-like texture, denser where it is warmer
        const set =
          heat < 0.34
            ? MEMBRANE[0]
            : heat < 0.46
              ? MEMBRANE[1]
              : heat < 0.58
                ? MEMBRANE[2]
                : heat < 0.7
                  ? MEMBRANE[3]
                  : MEMBRANE[4]
        glyph = set[Math.floor(grain * set.length)]
      }
    }
    return (glyph << 8) | Math.round(level * 255)
  }
}
