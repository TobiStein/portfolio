/**
 * Tone mapping for the light theme: how temperatures become positions on the
 * heat scale (0 = coldest colour, 1 = hottest). The dark theme does not use it.
 *
 * On a dark page the plain linear mapping reads well: the hot colours are the
 * bright ones. The light scales have more distinct colours, and the same
 * mapping crowds the butterfly into a few of them, so the light theme does
 * what a thermal camera's automatic gain does:
 * - the butterfly is spread over the scale, every colour getting about the
 *   same share of it (`butterflyLevels`),
 * - the strong warmth of the pointer trail and of the plume is raised, so
 *   the middle of a trail reaches the warm end of the scale (`lightWarmth`).
 * The ambient field keeps its colours.
 */

const FLOOR = 0.25 // coolest level of the butterfly
const CEILING = 0.95 // the top of the scale stays for its hottest point
const PLATEAU = 0.04 // largest share of the scale for a single temperature
const RAISE_FROM = 0.08 // fainter warmth is kept as it is (edges of a trail)
const RAISE_TO = 0.66 // stronger warmth reaches the top of the scale

interface HeatTexture {
  width: number
  height: number
  material: Uint8Array
  heatLight: Uint8Array
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** The temperatures the ASCII grid actually shows: `heat` read on a grid of
 *  character cells, keeping in each cell the sample of highest material
 *  (veins and rims win over the membrane), as the renderer does. */
export function cellSamples(
  tex: Omit<HeatTexture, 'heatLight'>,
  heat: Uint8Array,
  cellWidth = 6,
  cellHeight = 12
): Uint8Array {
  const samples: number[] = []
  for (let y = cellHeight / 2; y < tex.height; y += cellHeight) {
    for (let x = cellWidth / 2; x < tex.width; x += cellWidth) {
      let best = 0
      let value = 0
      for (let k = -1; k <= 1; k++) {
        const ty = Math.round(y + k * 0.3 * cellHeight)
        if (ty < 0 || ty >= tex.height) continue
        const index = ty * tex.width + Math.floor(x)
        if (tex.material[index] > best) {
          best = tex.material[index]
          value = heat[index]
        }
      }
      if (best > 0) samples.push(value)
    }
  }
  return Uint8Array.from(samples)
}

/** Plateau histogram equalization (as in FLIR thermal cameras). For every
 *  temperature 0–255, a level between `floor` and `ceiling` such that each band
 *  of the scale gets about the same share of the samples: the colours are all
 *  used instead of crowding in the middle. `plateau` caps the share a single
 *  temperature may take (a large even area cannot take a whole band of colours
 *  on its own). The hottest temperature gets 1, the top of the scale. */
export function plateauEqualize(
  samples: Uint8Array,
  floor: number,
  ceiling: number,
  plateau: number
): Float32Array {
  const levels = new Float32Array(256)
  if (samples.length === 0) return levels.fill(1)
  const histogram = new Float64Array(256)
  for (const value of samples) histogram[value]++
  const cap = Math.max(1, samples.length * plateau)
  let total = 0
  for (let v = 0; v < 256; v++) {
    histogram[v] = Math.min(histogram[v], cap)
    total += histogram[v]
  }
  // Each temperature sits in the middle of its share of the cumulated histogram
  let below = 0
  let hottest = 0
  for (let v = 0; v < 256; v++) {
    const share = histogram[v] / total
    levels[v] = floor + (ceiling - floor) * (below + share / 2)
    below += share
    if (histogram[v] > 0) hottest = v
  }
  for (let v = hottest; v < 256; v++) levels[v] = 1
  return levels
}

/** Light theme: level of each temperature of the butterfly (`heatLight`). */
export function butterflyLevels(tex: HeatTexture): Float32Array {
  return plateauEqualize(cellSamples(tex, tex.heatLight), FLOOR, CEILING, PLATEAU)
}

/** Light theme: warmth of the heat layer (pointer trail, plume). Faint warmth
 *  is kept as it is, so the edges of a trail keep the colours of the field;
 *  strong warmth is raised, so the middle of a trail reaches the warm end of
 *  the scale (the pink of the fire palette). 0 stays 0, 1 stays 1. */
export function lightWarmth(warmth: number): number {
  return warmth + (1 - warmth) * smoothstep(RAISE_FROM, RAISE_TO, warmth)
}
