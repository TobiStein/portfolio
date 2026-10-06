import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import { THEME_COLORS } from '../src/utils/theme.ts'

const source = readFileSync(new URL('../src/scripts/theme.js', import.meta.url), 'utf8')

function page({ stored = {}, defaultTheme = 'system', dark = false, blockedStorage = false } = {}) {
  const classes = new Set()
  const root = {
    dataset: { defaultTheme },
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
      // data-bg-light / data-bg-dark
      return THEME_COLORS[name.split('-')[2]]
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

function expectPaint(p, dark) {
  assert.equal(p.root.style.backgroundColor, THEME_COLORS[dark ? 'dark' : 'light'])
  assert.equal(p.meta.content, p.root.style.backgroundColor)
  assert.equal(p.classes.has('dark'), dark)
}

test('first paint respects every saved theme mode', () => {
  for (const theme of ['system', 'light', 'dark']) {
    for (const osDark of [false, true]) {
      const p = page({ stored: { 'ink-theme': theme }, dark: osDark })
      assert.equal(p.root.dataset.theme, theme)
      expectPaint(p, theme === 'dark' || (theme === 'system' && osDark))
    }
  }
})

test('OS changes repaint only in system mode; switches update background and chrome together', () => {
  const p = page()
  p.changeOS(true)
  expectPaint(p, true)
  p.click('theme-toggle') // system -> light
  p.changeOS(false)
  p.changeOS(true)
  expectPaint(p, false)
  p.click('theme-toggle') // light -> dark
  expectPaint(p, true)
  p.changeOS(false)
  expectPaint(p, true)
  p.click('theme-toggle') // dark -> system, follows the current OS
  expectPaint(p, false)
})

test('controls remain usable without localStorage and honor configured starting mode', () => {
  const p = page({ defaultTheme: 'dark', blockedStorage: true })
  expectPaint(p, true)
  p.click('theme-toggle')
  assert.equal(p.root.dataset.theme, 'system')
  expectPaint(p, false)
})

test('saved preferences survive reload and invalid stored values use defaults', () => {
  const stored = {}
  const p = page({ stored })
  p.click('theme-toggle') // system -> light
  expectPaint(page({ stored, dark: true }), false)
  const invalid = page({ stored: { 'ink-theme': 'invalid' }, dark: true })
  assert.equal(invalid.root.dataset.theme, 'system')
  expectPaint(invalid, true)
})
