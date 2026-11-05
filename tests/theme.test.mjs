import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import { PALETTES, pageColors, themeAttributes } from '../src/utils/theme.ts'

const source = readFileSync(new URL('../src/scripts/theme.js', import.meta.url), 'utf8')
const tokensCss = readFileSync(new URL('../src/assets/styles/tokens.css', import.meta.url), 'utf8')
// What BaseLayout puts on <html>: data-bg-<palette>-<scheme>, read from tokens.css
const attributes = themeAttributes(tokensCss)
const colors = pageColors(tokensCss)

function page({
  stored = {},
  defaultTheme = 'system',
  defaultPalette = 'fire',
  dark = false,
  blockedStorage = false
} = {}) {
  const classes = new Set()
  const root = {
    dataset: { defaultTheme, defaultPalette, palette: defaultPalette },
    style: {},
    classList: {
      toggle(name, enabled) {
        enabled ? classes.add(name) : classes.delete(name)
      },
      add(name) {
        classes.add(name)
      },
      remove(name) {
        classes.delete(name)
      }
    },
    getAttribute(name) {
      return attributes[name] ?? null
    }
  }
  const handlers = {}
  const media = {
    matches: dark,
    addEventListener(name, callback) {
      handlers[name] = callback
    }
  }
  const meta = {
    setAttribute(name, value) {
      this[name] = value
    }
  }
  class Element {
    constructor(id) {
      this.id = id
    }
    closest(selector) {
      return selector === `#${this.id}` ? this : null
    }
  }
  vm.runInNewContext(source, {
    document: {
      documentElement: root,
      querySelector: () => meta,
      addEventListener(name, callback) {
        handlers[name] = callback
      }
    },
    matchMedia: () => media,
    localStorage: {
      getItem(key) {
        if (blockedStorage) throw Error('Unavailable')
        return stored[key] ?? null
      },
      setItem(key, value) {
        if (blockedStorage) throw Error('Unavailable')
        stored[key] = value
      }
    },
    Element,
    setTimeout: () => 1,
    clearTimeout: () => {}
  })
  return {
    root,
    meta,
    classes,
    click(id) {
      handlers.click({ target: new Element(id) })
    },
    changeOS(dark) {
      media.matches = dark
      handlers.change()
    }
  }
}

function expectPaint(p, palette, dark) {
  assert.equal(p.root.dataset.palette, palette)
  assert.equal(p.classes.has('dark'), dark)
  assert.equal(p.root.style.backgroundColor, colors[palette][dark ? 'dark' : 'light'])
  assert.equal(p.meta.content, p.root.style.backgroundColor)
}

test('the theme script knows the same palettes as src/utils/theme.ts', () => {
  const list = source.match(/const palettes = \[([^\]]*)\]/)
  assert.ok(list, 'palettes list not found in theme.js')
  assert.deepEqual(
    list[1].split(',').map((name) => name.trim().replace(/'/g, '')),
    [...PALETTES]
  )
})

test('page colors come from --paper in tokens.css, one per palette and scheme', () => {
  for (const palette of PALETTES) {
    for (const scheme of ['light', 'dark']) {
      assert.match(colors[palette][scheme], /^#[0-9a-f]{6}$/)
      assert.equal(attributes[`data-bg-${palette}-${scheme}`], colors[palette][scheme])
    }
    assert.notEqual(colors[palette].light, colors[palette].dark)
  }
  assert.notEqual(colors.fire.light, colors.abyss.light)
  assert.notEqual(colors.fire.dark, colors.abyss.dark)
})

test('first paint respects every saved palette and theme mode', () => {
  for (const palette of PALETTES) {
    for (const theme of ['system', 'light', 'dark']) {
      for (const osDark of [false, true]) {
        const p = page({ stored: { 'ink-palette': palette, 'ink-theme': theme }, dark: osDark })
        assert.equal(p.root.dataset.theme, theme)
        expectPaint(p, palette, theme === 'dark' || (theme === 'system' && osDark))
      }
    }
  }
})

test('OS changes repaint only in system mode; switches update background and chrome together', () => {
  const p = page()
  p.changeOS(true)
  expectPaint(p, 'fire', true)
  p.click('theme-toggle') // system -> light
  p.changeOS(false)
  p.changeOS(true)
  expectPaint(p, 'fire', false)
  p.click('palette-toggle') // fire -> abyss
  expectPaint(p, 'abyss', false)
  p.click('theme-toggle') // light -> dark
  expectPaint(p, 'abyss', true)
  p.changeOS(false)
  expectPaint(p, 'abyss', true)
  p.click('theme-toggle') // dark -> system, follows the current OS
  expectPaint(p, 'abyss', false)
  p.click('palette-toggle') // abyss -> fire
  expectPaint(p, 'fire', false)
})

test('controls remain usable without localStorage and honor the configured defaults', () => {
  const p = page({ defaultTheme: 'dark', defaultPalette: 'abyss', blockedStorage: true })
  expectPaint(p, 'abyss', true)
  p.click('theme-toggle')
  assert.equal(p.root.dataset.theme, 'system')
  expectPaint(p, 'abyss', false)
  p.click('palette-toggle')
  expectPaint(p, 'fire', false)
})

test('saved preferences survive reload and invalid stored values use defaults', () => {
  const stored = {}
  const p = page({ stored })
  p.click('palette-toggle') // fire -> abyss
  p.click('theme-toggle') // system -> light
  expectPaint(page({ stored, dark: true }), 'abyss', false)
  const invalid = page({ stored: { 'ink-theme': 'invalid', 'ink-palette': 'invalid' }, dark: true })
  assert.equal(invalid.root.dataset.theme, 'system')
  expectPaint(invalid, 'fire', true)
  // Palettes saved by earlier versions of the site fall back to the default
  for (const old of ['ink', 'fresh', 'abysse']) {
    expectPaint(page({ stored: { 'ink-palette': old } }), 'fire', false)
  }
})
