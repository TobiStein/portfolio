import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_LOCALE,
  LOCALES,
  getLocaleFromPath,
  isLocale,
  localePath,
  localeStaticPaths,
  otherLocale,
  pick,
  switchLocalePath,
  useTranslations
} from '../src/i18n/index.ts'
import { ui } from '../src/i18n/ui.ts'

// import.meta.env is absent in Node, so every URL is built with the base `/`.

test('localePath prefixes paths with the language', () => {
  assert.equal(localePath('fr'), '/fr/')
  assert.equal(localePath('en', '/'), '/en/')
  // Pages get the trailing slash of their folder URL; files keep their name
  assert.equal(localePath('en', '/blog'), '/en/blog/')
  assert.equal(localePath('en', '/blog/'), '/en/blog/')
  assert.equal(localePath('fr', 'projects/project-alpha'), '/fr/projects/project-alpha/')
  assert.equal(localePath('fr', '/rss.xml'), '/fr/rss.xml')
})

test('switchLocalePath swaps the language and keeps the rest of the path', () => {
  assert.equal(switchLocalePath('/fr/blog/x', 'en'), '/en/blog/x/')
  assert.equal(switchLocalePath('/en/', 'fr'), '/fr/')
  assert.equal(switchLocalePath('/fr', 'en'), '/en/')
  assert.equal(switchLocalePath('/fr/about/', 'en'), '/en/about/')
  assert.equal(switchLocalePath('/en/about', 'fr'), '/fr/about/')
  assert.equal(switchLocalePath('/fr/blog/2/', 'en'), '/en/blog/2/')
  assert.equal(switchLocalePath('/blog', 'en'), '/en/blog/')
  assert.equal(switchLocalePath('/', 'en'), '/en/')
  assert.equal(switchLocalePath('/fr/rss.xml', 'en'), '/en/rss.xml')
})

test('getLocaleFromPath reads the first segment and falls back to the default', () => {
  assert.equal(getLocaleFromPath('/en/about'), 'en')
  assert.equal(getLocaleFromPath('/fr/blog/x'), 'fr')
  assert.equal(getLocaleFromPath('/'), 'fr')
  assert.equal(getLocaleFromPath('/xx/y'), 'fr')
  assert.equal(DEFAULT_LOCALE, 'fr')
})

test('locale helpers', () => {
  assert.deepEqual([...LOCALES], ['fr', 'en'])
  assert.equal(otherLocale('fr'), 'en')
  assert.equal(otherLocale('en'), 'fr')
  assert.equal(isLocale('fr'), true)
  assert.equal(isLocale('en'), true)
  assert.equal(isLocale('de'), false)
  assert.equal(isLocale(undefined), false)
  assert.deepEqual(localeStaticPaths(), [
    { params: { lang: 'fr' }, props: { lang: 'fr' } },
    { params: { lang: 'en' }, props: { lang: 'en' } }
  ])
})

test('pick returns the page language and falls back to the default language', () => {
  const value = { fr: 'Bonjour', en: 'Hello' }
  assert.equal(pick(value, 'fr'), 'Bonjour')
  assert.equal(pick(value, 'en'), 'Hello')
  assert.equal(pick({ fr: 'Seulement en français' }, 'en'), 'Seulement en français')
  assert.deepEqual(pick({ fr: ['a'], en: ['b'] }, 'en'), ['b'])
})

test('t fills placeholders in the page language', () => {
  const fr = useTranslations('fr')
  const en = useTranslations('en')
  assert.equal(fr.lang, 'fr')
  assert.equal(fr.t('blog.title'), ui.fr['blog.title'])
  assert.equal(en.t('projects.title'), ui.en['projects.title'])
  assert.equal(fr.t('entry.readingTime', { minutes: 3 }), '3 min de lecture')
  assert.equal(en.t('entry.readingTime', { minutes: 3 }), '3 min read')
  assert.equal(en.t('pagination.page', { page: 2, total: 5 }), 'page 2 of 5')
  // Unknown placeholders are left untouched
  assert.equal(en.t('entry.readingTime'), '{minutes} min read')
  assert.equal(fr.pick({ fr: 'Projets', en: 'Projects' }), 'Projets')
  assert.equal(en.pick({ fr: 'Projets', en: 'Projects' }), 'Projects')
})

test('tn follows each language’s plural rules', () => {
  const fr = useTranslations('fr')
  const en = useTranslations('en')
  // French: 0 and 1 are singular
  assert.equal(fr.tn('blog.count', 0), '0 article')
  assert.equal(fr.tn('blog.count', 1), '1 article')
  assert.equal(fr.tn('blog.count', 2), '2 articles')
  assert.equal(fr.tn('projects.count', 1), '1 projet')
  // English: only 1 is singular
  assert.equal(en.tn('blog.count', 0), '0 posts')
  assert.equal(en.tn('blog.count', 1), '1 post')
  assert.equal(en.tn('blog.count', 2), '2 posts')
  assert.equal(en.tn('projects.count', 3), '3 projects')
})

test('date formats in the page language', () => {
  // Like frontmatter dates: UTC midnight, the same day whatever the build machine's time zone
  const d = new Date('2026-10-05')
  assert.equal(useTranslations('fr').date(d), '5 octobre 2026')
  assert.equal(useTranslations('en').date(d), 'October 5, 2026')
})

test('French and English dictionaries have the same keys, placeholders and no empty strings', () => {
  assert.deepEqual(Object.keys(ui.fr).sort(), Object.keys(ui.en).sort())
  const placeholders = (s) => (s.match(/\{\w+\}/g) ?? []).sort()
  for (const lang of LOCALES) {
    for (const [key, value] of Object.entries(ui[lang])) {
      assert.equal(typeof value, 'string', `${lang}:${key}`)
      assert.notEqual(value.trim(), '', `${lang}:${key} is empty`)
      assert.deepEqual(placeholders(value), placeholders(ui.fr[key]), `${lang}:${key} placeholders`)
    }
  }
  // Every plural key has both forms
  for (const key of Object.keys(ui.fr)) {
    if (key.endsWith('.one')) assert.ok(`${key.slice(0, -4)}.other` in ui.fr, key)
    if (key.endsWith('.other')) assert.ok(`${key.slice(0, -6)}.one` in ui.fr, key)
  }
})
