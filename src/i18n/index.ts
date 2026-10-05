/**
 * Bilingual (French / English) helpers.
 *
 * Every page lives under a language prefix: `/fr/blog`, `/en/blog`…
 * The root `/` redirects to the visitor's language (see src/pages/index.astro).
 * Content entries live in `src/content/<collection>/<lang>/<slug>.md`; two files
 * sharing the same slug in `fr/` and `en/` are translations of each other.
 */
// Relative imports with extensions keep this module importable by the Node tests.
import { formatDate, withBase } from '../utils/index.ts'

import { ui, type UIKey } from './ui.ts'

export type { UIKey } from './ui.ts'

/** Site languages. The first one is the default language. */
export const LOCALES = ['fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

/** localStorage key remembering the language chosen with the header toggle. */
export const LOCALE_STORAGE_KEY = 'ink-lang'

export const LOCALE_META: Record<
  Locale,
  {
    /** Short label shown on the language toggle */
    label: string
    /** BCP 47 tag for Intl (dates, plurals) and hreflang */
    intl: string
    /** Open Graph locale */
    og: string
  }
> = {
  fr: { label: 'FR', intl: 'fr-FR', og: 'fr_FR' },
  en: { label: 'EN', intl: 'en-US', og: 'en_US' }
}

/** A value written once per language, e.g. `{ fr: 'Bonjour', en: 'Hello' }`. */
export type Localized<T = string> = Record<Locale, T>

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** The language the header toggle switches to. */
export function otherLocale(lang: Locale): Locale {
  return LOCALES.find((l) => l !== lang) ?? DEFAULT_LOCALE
}

/** `[{ params: { lang: 'fr' }, props: { lang: 'fr' } }, …]` for getStaticPaths. */
export function localeStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang }, props: { lang } }))
}

/** Remove the Astro base (e.g. `/my-repo`) from a pathname. */
function stripBase(pathname: string): string {
  const base = (import.meta.env?.BASE_URL ?? '/').replace(/\/+$/, '')
  if (!base) return pathname
  if (pathname === base) return '/'
  return pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname
}

/** Language-prefixed, base-aware URL of a site path.
 *  `localePath('fr')` → `/fr/` · `localePath('en', '/blog')` → `/en/blog/`
 *  Pages are built as folders (`/en/blog/index.html`), so they get a trailing slash
 *  (the canonical form, no redirect on static hosts); files like `/rss.xml` keep theirs. */
export function localePath(lang: Locale, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  const page = clean.endsWith('/') || /\.\w+$/.test(clean) ? clean : `${clean}/`
  return withBase(`/${lang}${page}`)
}

/** Language of a URL pathname (base-aware); the default language if none. */
export function getLocaleFromPath(pathname: string): Locale {
  const first = stripBase(pathname).split('/')[1]
  return isLocale(first) ? first : DEFAULT_LOCALE
}

/** The same page in another language: `/fr/blog/x` → `/en/blog/x` (base-aware). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = stripBase(pathname).split('/').filter(Boolean)
  if (isLocale(segments[0])) segments.shift()
  return localePath(target, `/${segments.join('/')}`)
}

/** Pick the current language's value from a `Localized` object. */
export function pick<T>(value: Localized<T>, lang: Locale): T {
  return value[lang] ?? value[DEFAULT_LOCALE]
}

type Vars = Record<string, string | number>
/** Plural keys without their `.one` / `.other` suffix, e.g. `blog.count`. */
export type PluralKey = { [K in UIKey]: K extends `${infer B}.one` ? B : never }[UIKey]

function format(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  )
}

/**
 * Translation helpers bound to one language:
 * - `t('blog.title')` · `t('entry.readingTime', { minutes: 3 })` — interface strings
 * - `tn('blog.count', 2)` — plural-aware strings (`{count}` is filled in)
 * - `pick(config.site.description)` — values from site-config written per language
 * - `date(d)` — a date in the page language, e.g. "5 octobre 2026"
 */
export function useTranslations(lang: Locale) {
  const dict: Record<UIKey, string> = ui[lang]
  const fallback: Record<UIKey, string> = ui[DEFAULT_LOCALE]
  const plural = new Intl.PluralRules(LOCALE_META[lang].intl)

  const t = (key: UIKey, vars?: Vars): string => format(dict[key] ?? fallback[key] ?? key, vars)
  const tn = (key: PluralKey, count: number, vars?: Vars): string =>
    t(`${key}.${plural.select(count) === 'one' ? 'one' : 'other'}` as UIKey, { count, ...vars })

  return {
    lang,
    t,
    tn,
    pick: <T>(value: Localized<T>): T => pick(value, lang),
    date: (d: Date): string => formatDate(d, LOCALE_META[lang].intl)
  }
}
