/**
 * Colour helpers for the heat scale: read the --thermal-* tokens and
 * interpolate them in OKLab, so the gradient stays even to the eye.
 */
export type RGB = [number, number, number]
type Lab = [number, number, number]

/** `#rgb` / `#rrggbb` → [r, g, b] (0–255), or null for anything else. */
export function parseHex(value: string): RGB | null {
  const hex = value.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return [0, 1, 2].map((i) => parseInt(hex[i] + hex[i], 16)) as RGB
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB
  }
  return null
}

const toLinear = (channel: number) => {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const toChannel = (linear: number) => {
  const c = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, c)) * 255)
}

function toOklab([r, g, b]: RGB): Lab {
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ]
}

function fromOklab([L, a, b]: Lab): RGB {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    toChannel(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toChannel(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toChannel(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  ]
}

/** `steps` CSS colours evenly spread along the stops (cold → hot). */
export function buildRamp(stops: RGB[], steps: number): string[] {
  const labs = stops.map(toOklab)
  const ramp: string[] = []
  for (let i = 0; i < steps; i++) {
    const position = (i / (steps - 1)) * (labs.length - 1)
    const index = Math.min(labs.length - 2, Math.floor(position))
    const t = position - index
    const [a, b] = [labs[index], labs[index + 1]]
    const [r, g, bl] = fromOklab([
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t
    ])
    ramp.push(`rgb(${r} ${g} ${bl})`)
  }
  return ramp
}

let probe: CanvasRenderingContext2D | null | undefined

/** Any CSS colour (`#hex`, `rgb()`, `hsl()`, `oklch()`…) → [r, g, b] in sRGB,
 *  or null when the value is not a colour. Non-hex values are painted on a
 *  1 × 1 canvas and read back, so the tokens can use any colour syntax. */
export function parseColor(value: string): RGB | null {
  const color = value.trim()
  const hex = parseHex(color)
  if (hex || !color || !CSS.supports('color', color)) return hex
  probe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!probe) return null
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = color
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

/** The --thermal-0 … --thermal-10 tokens of the current palette (tokens.css). */
export function readThermalStops(root: HTMLElement): RGB[] {
  const style = getComputedStyle(root)
  return Array.from({ length: 11 }, (_, step) => {
    const name = `--thermal-${step}`
    const color = parseColor(style.getPropertyValue(name))
    if (!color) throw new Error(`${name} is missing or not a colour (src/assets/styles/tokens.css)`)
    return color
  })
}
