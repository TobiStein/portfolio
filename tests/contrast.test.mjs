// Contrast of every text color of the site, in every palette and scheme (WCAG AA:
// 4.5:1 for text, 3:1 for the focus ring). The colors are read from tokens.css,
// so editing a token that makes a text hard to read fails the tests.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { PALETTES, resolveTokens } from '../src/utils/theme.ts'

const css = readFileSync(new URL('../src/assets/styles/tokens.css', import.meta.url), 'utf8')

/** Replaces var(--x) with the token values, recursively. */
function substitute(value, tokens, depth = 0) {
  if (depth > 20) throw new Error(`var() loop in ${value}`)
  return value.replace(/var\((--[\w-]+)\)/g, (_, name) => {
    if (!tokens.has(name)) throw new Error(`${name} is not declared`)
    return substitute(tokens.get(name), tokens, depth + 1)
  })
}

/** Top-level arguments of a CSS function. */
function args(text) {
  const out = ['']
  let depth = 0
  for (const char of text) {
    if (char === '(') depth++
    if (char === ')') depth--
    if (char === ',' && depth === 0) out.push('')
    else out[out.length - 1] += char
  }
  return out.map((part) => part.trim())
}

/** `#hex`, `hsl(h s% l% / a)` or `color-mix(in srgb, a p%, b)` → [r, g, b, alpha]. */
function rgba(color) {
  const value = color.trim()
  const hex = value.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i)
  if (hex) {
    const channels = [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16))
    return [...channels, hex[2] ? parseInt(hex[2], 16) / 255 : 1]
  }
  const hsl = value.match(/^hsl\(\s*([-\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*(?:\/\s*([\d.]+))?\s*\)$/)
  if (hsl) {
    const [h, s, l] = [Number(hsl[1]) % 360, Number(hsl[2]) / 100, Number(hsl[3]) / 100]
    const a = s * Math.min(l, 1 - l)
    const channel = (n) => {
      const k = (n + h / 30) % 12
      return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))
    }
    return [channel(0), channel(8), channel(4), hsl[4] === undefined ? 1 : Number(hsl[4])]
  }
  const mix = value.match(/^color-mix\(\s*in srgb\s*,(.*)\)$/)
  if (mix) {
    const [first, second] = args(mix[1]).map((part) => {
      const weighted = part.match(/^(.*?)\s+([\d.]+)%$/)
      return weighted ? [weighted[1], Number(weighted[2]) / 100] : [part, undefined]
    })
    const p = first[1] ?? (second[1] === undefined ? 0.5 : 1 - second[1])
    const [a, b] = [rgba(first[0]), rgba(second[0])]
    return a.map((channel, i) => channel * p + b[i] * (1 - p))
  }
  throw new Error(`Unsupported color: ${value}`)
}

/** `top over … over bottom`: alpha compositing, as painted on the page. */
function paint(layers, tokens) {
  const colors = layers.split(' over ').map((layer) => rgba(substitute(layer, tokens)))
  return colors.reduceRight((below, [r, g, b, a]) => [
    r * a + below[0] * (1 - a),
    g * a + below[1] * (1 - a),
    b * a + below[2] * (1 - a),
    1
  ])
}

function contrast(a, b) {
  const luminance = ([r, g, b]) => {
    const linear = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  }
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const PAPER = 'hsl(var(--paper))'
const TEXT = [
  // [what, text color, background (layers, top first)]
  ['titles and strong text', 'hsl(var(--ink))', PAPER],
  ['body text', 'hsl(var(--ink-soft))', PAPER],
  ['text in cards', 'hsl(var(--ink-soft))', `hsl(var(--card) / 0.7) over ${PAPER}`],
  ['text on the wash', 'hsl(var(--ink-soft))', 'hsl(var(--wash))'],
  ['hovered links and titles', 'hsl(var(--accent))', PAPER],
  ['hovered buttons', 'hsl(var(--hover-ink))', 'hsl(var(--wash))'],
  ['main button', 'hsl(var(--accent-fg))', 'hsl(var(--accent))'],
  ['tags', 'hsl(var(--secondary))', `hsl(var(--secondary) / 0.08) over ${PAPER}`],
  ['selected tag filter', 'hsl(var(--paper))', 'hsl(var(--secondary))'],
  ['tagline, dates, counts', 'hsl(var(--meta))', PAPER],
  ['ordered list numbers', 'hsl(var(--accent-2))', PAPER],
  ['highlighted text', 'hsl(var(--ink))', `hsl(var(--glow) / 0.35) over ${PAPER}`],
  ['selected text', 'hsl(var(--ink))', `var(--selection) over ${PAPER}`],
  [
    'image viewer caption',
    'hsl(var(--overlay-fg) / 0.85) over hsl(var(--overlay))',
    'hsl(var(--overlay))'
  ]
]
const CODE = [
  ...['fg', 'comment', 'keyword', 'string', 'number', 'func', 'type', 'variable'],
  ...['property', 'punctuation', 'tag', 'attribute', 'inserted', 'deleted']
]

for (const palette of PALETTES) {
  for (const scheme of ['light', 'dark']) {
    const tokens = resolveTokens(css, palette, scheme)

    test(`${palette} (${scheme}): text colors reach 4.5:1`, () => {
      for (const [what, color, background] of TEXT) {
        const ratio = contrast(paint(color, tokens), paint(background, tokens))
        assert.ok(ratio >= 4.5, `${what}: ${ratio.toFixed(2)}:1`)
      }
    })

    test(`${palette} (${scheme}): code colors reach 4.5:1 on the code block`, () => {
      const block = paint('hsl(var(--wash))', tokens)
      for (const name of CODE) {
        const ratio = contrast(paint(`var(--code-${name})`, tokens), block)
        assert.ok(ratio >= 4.5, `--code-${name}: ${ratio.toFixed(2)}:1`)
      }
    })

    test(`${palette} (${scheme}): the focus ring reaches 3:1`, () => {
      const ring = paint(`hsl(var(--ring) / 0.85) over ${PAPER}`, tokens)
      assert.ok(contrast(ring, paint(PAPER, tokens)) >= 3)
    })

    test(`${palette} (${scheme}): diagram borders and arrows reach 3:1`, () => {
      for (const name of ['--diagram-border', '--diagram-line']) {
        const ratio = contrast(paint(`var(${name})`, tokens), paint(PAPER, tokens))
        assert.ok(ratio >= 3, `${name}: ${ratio.toFixed(2)}:1`)
      }
    })
  }
}

test('the contrast helpers match known values', () => {
  const tokens = new Map([
    ['--a', '0 0% 0%'],
    ['--b', '0 0% 100%']
  ])
  assert.equal(Math.round(contrast(paint('hsl(var(--a))', tokens), paint('#ffffff', tokens))), 21)
  assert.deepEqual(
    rgba('color-mix(in srgb, #000000 25%, #ffffff)').map(Math.round),
    [191, 191, 191, 1]
  )
  // 50 % black over white is mid grey
  assert.equal(Math.round(paint('hsl(0 0% 0% / 0.5) over #ffffff', tokens)[0]), 128)
})
