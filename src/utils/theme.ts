/**
 * Palettes and theme modes. The colors themselves live only in
 * src/assets/styles/tokens.css: this module reads them from the text of that
 * file (at build time, and in the tests), so nothing is duplicated here.
 */

/** Color palettes, in the order of the header button. The first one is the fallback. */
export const PALETTES = ['fire', 'abyss'] as const
export type Palette = (typeof PALETTES)[number]

/** Theme modes, in the order of the header button. */
export const MODES = ['system', 'light', 'dark'] as const
export type Mode = (typeof MODES)[number]

export type Scheme = 'light' | 'dark'
const SCHEMES: readonly Scheme[] = ['light', 'dark']

/** Selector of each palette and scheme block in tokens.css. */
export const PALETTE_SELECTORS: Record<Palette, Record<Scheme, string>> = {
  fire: { light: ":root, [data-palette='fire']", dark: '.dark' },
  abyss: { light: "[data-palette='abyss']", dark: "[data-palette='abyss'].dark" }
}

const normalizeSelector = (selector: string) => selector.replace(/\s+/g, '').replace(/"/g, "'")

/** Custom properties declared by each rule of a stylesheet, keyed by selector. */
export function readTokenBlocks(css: string): Map<string, Map<string, string>> {
  const blocks = new Map<string, Map<string, string>>()
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const [, selector, body] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const key = normalizeSelector(selector)
    const tokens = blocks.get(key) ?? new Map<string, string>()
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens.set(name, value.trim())
    }
    blocks.set(key, tokens)
  }
  return blocks
}

/** Tokens of one palette and scheme (empty when the block is missing). */
export function paletteTokens(css: string, palette: Palette, scheme: Scheme) {
  const blocks = readTokenBlocks(css)
  return blocks.get(normalizeSelector(PALETTE_SELECTORS[palette][scheme])) ?? new Map()
}

/** Every token of a palette and scheme, as the browser resolves them: the default
 *  palette's blocks first, then the palette's own blocks (cascade order of tokens.css). */
export function resolveTokens(css: string, palette: Palette, scheme: Scheme) {
  const blocks = readTokenBlocks(css)
  const block = (selector: string) =>
    blocks.get(normalizeSelector(selector)) ?? new Map<string, string>()
  const fallback = PALETTES[0]
  const layers = [block(':root'), block(PALETTE_SELECTORS[fallback].light)]
  if (scheme === 'dark') layers.push(block(PALETTE_SELECTORS[fallback].dark))
  if (palette !== fallback) {
    layers.push(block(PALETTE_SELECTORS[palette].light))
    if (scheme === 'dark') layers.push(block(PALETTE_SELECTORS[palette].dark))
  }
  return new Map(layers.flatMap((layer) => [...layer]))
}

/** An HSL triplet token (`225 67% 98%`) → `#rrggbb`. */
export function hslToHex(triplet: string): string {
  const match = triplet.trim().match(/^(-?[\d.]+)(?:deg)?\s+([\d.]+)%\s+([\d.]+)%$/)
  if (!match) throw new Error(`tokens.css: "${triplet}" is not an HSL triplet (H S% L%)`)
  const hue = ((Number(match[1]) % 360) + 360) % 360
  const saturation = Number(match[2]) / 100
  const lightness = Number(match[3]) / 100
  const a = saturation * Math.min(lightness, 1 - lightness)
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12
    const value = lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

/** Page color (`--paper`) of every palette and scheme, as hex: painted before the
 *  stylesheet loads, and used as the browser chrome color (meta, web manifest). */
export function pageColors(css: string): Record<Palette, Record<Scheme, string>> {
  const colors = {} as Record<Palette, Record<Scheme, string>>
  for (const palette of PALETTES) {
    colors[palette] = {} as Record<Scheme, string>
    for (const scheme of SCHEMES) {
      const paper = paletteTokens(css, palette, scheme).get('--paper')
      if (!paper) throw new Error(`tokens.css: --paper is missing for ${palette} (${scheme})`)
      colors[palette][scheme] = hslToHex(paper)
    }
  }
  return colors
}

/** `<html>` attributes read by src/scripts/theme.js: the page color of each palette
 *  and scheme (painted before the CSS loads, and used as the browser chrome color). */
export function themeAttributes(css: string): Record<string, string> {
  const colors = pageColors(css)
  return Object.fromEntries(
    PALETTES.flatMap((palette) =>
      SCHEMES.map((scheme) => [`data-bg-${palette}-${scheme}`, colors[palette][scheme]])
    )
  )
}
