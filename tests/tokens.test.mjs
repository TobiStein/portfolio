// Design tokens: src/assets/styles/tokens.css is the only place where colors and
// fonts are written. Everything else reads them through var(--…).
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { PALETTES, paletteTokens, readTokenBlocks } from '../src/utils/theme.ts'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const TOKENS = 'src/assets/styles/tokens.css'
const tokensCss = readFileSync(join(ROOT, TOKENS), 'utf8')

/** Files that may contain color-like values, with the reason. */
const ALLOWED = {
  // Mask channels of the procedural butterfly texture (data, never displayed)
  'src/scripts/thermal/butterfly.ts': /rgb\(\s*(0|255) (0|255) (0|255)\s*\)/g
}

function sourceFiles(dir) {
  return readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return path === 'src/content' ? [] : sourceFiles(path)
    return /\.(astro|css|ts|js|mjs)$/.test(entry.name) ? [path] : []
  })
}

const files = [...sourceFiles('src'), 'uno.config.ts', 'astro.config.ts']
  .filter((path) => path !== TOKENS)
  .map((path) => {
    const text = readFileSync(join(ROOT, path), 'utf8')
      // Comments may name colors and fonts
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/(^|[^:'"`\w])\/\/.*$/gm, '$1')
    return { path, text: ALLOWED[path] ? text.replace(ALLOWED[path], '') : text }
  })

const RAW_COLOR = [
  // #rgb, #rrggbb, #rrggbbaa
  /(?<=[\s:(,'"`=])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi,
  // Color functions with literal values: rgb(0 0 0), hsl(220 50% 50%)…
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(\s*-?[\d.]/gi,
  // Named and system colors in a declaration
  /\b(?:color|background(?:-color)?|border(?:-\w+)?|outline|fill|stroke|(?:box|text)-shadow)['"]?\s*:[^;{}\n]*?\b(?:white|black|red|green|blue|gr[ae]y|silver|orange|yellow|purple|pink|navy|teal|Canvas|CanvasText)\b(?!-)/g
]
const RAW_FONT = [
  // CSS declaration (or UnoCSS rule) without a token
  /font-family['"]?\s*:\s*['"`]?(?![\s'"`]|var\(|inherit|initial|unset)[^;{}'"`\n]+/g,
  // JavaScript string (canvas, Mermaid…)
  /fontFamily\s*:\s*['"`]/g,
  // A font name written out
  /['"`](?:Mona Sans|Monaspace|Geist Pixel|system-ui|ui-monospace|ui-sans-serif)/g
]

const VIVID_TEXT = [
  /\btext-(?:accent-vivid|decor)\b/g,
  /(?<![-\w])color['"]?\s*:\s*['"`]?hsl\(var\(--(?:accent-vivid|decor)\)/g
]

function findAll(patterns) {
  return files.flatMap(({ path, text }) =>
    patterns.flatMap((pattern) => [...text.matchAll(pattern)].map((m) => `${path}: ${m[0]}`))
  )
}

test('every palette declares the same tokens; a dark block, what changes in dark', () => {
  const block = (palette, scheme) => paletteTokens(tokensCss, palette, scheme)
  const names = (palette, scheme) => [...block(palette, scheme).keys()].sort()
  const [reference, ...others] = PALETTES
  assert.ok(names(reference, 'light').length > 0, `${reference} (light) not found`)
  for (const palette of others) {
    assert.deepEqual(names(palette, 'light'), names(reference, 'light'), `${palette} (light)`)
  }
  for (const palette of PALETTES) {
    const light = block(palette, 'light')
    const dark = block(palette, 'dark')
    assert.ok(dark.size > 0, `${palette} (dark) not found`)
    // A dark block only overrides tokens that its light block defines
    for (const name of dark.keys()) {
      assert.ok(light.has(name), `${palette} (dark): ${name} has no light value`)
    }
    // What the default dark block changes must change here too, unless the light
    // value is written with var(): it then follows the scheme by itself
    for (const name of block(reference, 'dark').keys()) {
      assert.ok(
        dark.has(name) || light.get(name).includes('var('),
        `${palette} (dark): ${name} would keep its light value`
      )
    }
  }
})

test('every token read by the site is declared in tokens.css', () => {
  const declared = new Set([...readTokenBlocks(tokensCss).values()].flatMap((t) => [...t.keys()]))
  const missing = files.flatMap(({ path, text }) => {
    const local = new Set([...text.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))
    const used = [...text.matchAll(/var\((--[\w-]+)[,)]/g)].map((m) => m[1])
    // The code theme builds its names: code('keyword') -> var(--code-keyword)
    used.push(...[...text.matchAll(/\bcode\('([\w-]+)'\)/g)].map((m) => `--code-${m[1]}`))
    return used
      .filter((name) => !/^--(un|waline)-/.test(name) && !local.has(name) && !declared.has(name))
      .map((name) => `${path}: ${name}`)
  })
  assert.deepEqual(missing, [])
})

test('colors are only written in tokens.css', () => {
  assert.deepEqual(findAll(RAW_COLOR), [])
})

test('fonts are only written in tokens.css', () => {
  assert.deepEqual(findAll(RAW_FONT), [])
})

test('vivid colors are only decor, never text', () => {
  // --accent-vivid (and the --decor role, vivid in abyss) is too light for text
  assert.deepEqual(findAll(VIVID_TEXT), [])
})

test('the audit itself catches raw values', () => {
  const sample = [
    'a { color: #fff; background: rgb(0 0 0 / 50%); border: 1px solid white; }',
    "b { font-family: system-ui, sans-serif; } const f = { fontFamily: 'Mona Sans' }"
  ].join('\n')
  const scan = (patterns) => patterns.flatMap((p) => [...sample.matchAll(p)].map((m) => m[0]))
  assert.equal(scan(RAW_COLOR).length, 3)
  assert.equal(scan(RAW_FONT).length, 3)
  const vivid =
    "c { color: hsl(var(--decor) / 1); border-color: hsl(var(--decor) / 1) } <a class='text-accent-vivid'>"
  assert.equal(VIVID_TEXT.flatMap((p) => [...vivid.matchAll(p)]).length, 2)
})
