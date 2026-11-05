import type { TypographyOptions } from '@unocss/preset-typography'
import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWind3,
  transformerDirectives
} from 'unocss'

/**
 * Thermal design system (based on astro-theme-ink).
 * Hot = important: text and links sit at the hot end of the scale,
 * borders and secondary information at the cold end.
 *
 * Colors live in CSS custom properties (see src/assets/styles/tokens.css)
 * and are mapped into UnoCSS theme here, so utilities like
 * `bg-paper text-ink border-line` work everywhere.
 */

const ink = 'hsl(var(--ink) / var(--un-text-opacity, 1))'
const inkSoft = 'hsl(var(--ink-soft) / var(--un-text-opacity, 1))'
const accent = 'hsl(var(--accent) / var(--un-text-opacity, 1))'
const line = 'var(--un-default-border-color)'

/**
 * Article typography.
 * Note: preset-typography emits `:where(...)` selectors that are global unless
 * content is wrapped in `.not-prose`. All rules below are scoped to `.prose`,
 * and site chrome (header/footer/cards) carries the `not-prose` class.
 */
const typography: TypographyOptions = {
  selectorName: 'prose',
  colorScheme: {
    body: inkSoft,
    headings: ink,
    links: ink,
    bold: ink,
    counters: 'hsl(var(--ink-soft) / 0.7)',
    bullets: 'hsl(var(--ink-soft) / 0.5)',
    hr: 'hsl(var(--line) / 1)',
    quotes: inkSoft,
    'quote-borders': 'hsl(var(--accent-2) / 0.55)',
    kbd: ink,
    code: ink,
    'pre-code': inkSoft,
    'th-borders': line,
    'td-borders': line
  },
  cssExtend: {
    // Root typography lives in global.css: cssExtend targets descendants.
    // Headings — Mona Sans semibold (the pixel face is kept for page titles), balanced
    '.prose h1,.prose h2,.prose h3,.prose h4,.prose h5,.prose h6': {
      'font-family': 'var(--font-sans)',
      'font-weight': '650',
      'letter-spacing': '-0.012em',
      'line-height': '1.22',
      'text-wrap': 'balance',
      'scroll-margin-top': '5.5rem'
    },
    '.prose h2': { 'font-size': '1.5em', 'margin-top': '2.2em', 'margin-bottom': '0.75em' },
    '.prose h3': { 'font-size': '1.2em', 'margin-top': '1.9em', 'margin-bottom': '0.6em' },
    '.prose h4': { 'margin-top': '1.6em', 'margin-bottom': '0.5em' },
    // Paragraphs: justified, with hyphenation (see .text-justified in global.css)
    '.prose p': {
      'margin-block': '1.05em',
      'text-align': 'justify',
      '-webkit-hyphens': 'auto',
      hyphens: 'auto'
    },

    // Heading anchor links (appear on hover / focus)
    '.prose h1>a,.prose h2>a,.prose h3>a,.prose h4>a,.prose h5>a,.prose h6>a': {
      'margin-inline-start': '0.55rem',
      color: 'hsl(var(--meta) / 0.8)',
      'font-size': '0.85em',
      opacity: '0',
      transition: 'opacity 0.2s ease, color 0.2s ease',
      'text-decoration': 'none',
      'font-weight': '400',
      'user-select': 'none'
    },
    '.prose h1:hover>a,.prose h2:hover>a,.prose h3:hover>a,.prose h4:hover>a,.prose h5:hover>a,.prose h6:hover>a':
      { opacity: '1' },
    '.prose h1:focus-within>a,.prose h2:focus-within>a,.prose h3:focus-within>a,.prose h4:focus-within>a,.prose h5:focus-within>a,.prose h6:focus-within>a':
      { opacity: '1' },
    '.prose h1:target>a,.prose h2:target>a,.prose h3:target>a,.prose h4:target>a,.prose h5:target>a,.prose h6:target>a':
      { opacity: '1' },

    // Links remain recognizable on touch devices, with stronger emphasis on interaction.
    '.prose a': {
      'font-weight': '550',
      color: ink,
      'text-decoration': 'underline',
      'text-decoration-color': 'var(--link-underline)',
      'text-decoration-thickness': '1.5px',
      'text-underline-offset': '0.2em',
      transition: 'color 0.2s ease, text-decoration-color 0.2s ease',
      'word-break': 'break-word'
    },
    '.prose a:hover,.prose a:focus-visible': {
      color: accent,
      'text-decoration-color': 'hsl(var(--accent) / 1)'
    },
    '.prose :is(h1,h2,h3,h4,h5,h6)>a': { 'text-decoration': 'none' },

    // Inline code: little paper chips
    '.prose :not(pre) > code': {
      'font-family': 'var(--font-mono)',
      'font-size': '0.86em',
      padding: '0.18em 0.42em',
      'border-radius': '0.35em',
      'background-color': 'hsl(var(--wash) / 1)',
      border: '1px solid hsl(var(--line) / 1)',
      'box-shadow': 'inset 0 -1px 0 hsl(var(--line) / 0.6)',
      'white-space': 'pre-wrap',
      'word-break': 'break-all'
    },
    '.prose :not(pre) > code::before': { content: 'none' },
    '.prose :not(pre) > code::after': { content: 'none' },

    // Blockquote: a rule in the margin (fire: a heat bar, hot at the top; abyss: periwinkle)
    '.prose blockquote': {
      'font-family': 'var(--font-sans)',
      'font-style': 'normal',
      'font-weight': '400',
      'border-inline-start': '3px solid',
      'border-image': 'var(--quote-rule) 1',
      'border-radius': '0',
      'background-color': 'transparent',
      'box-shadow': 'none',
      'padding-block': '0.1rem',
      'padding-inline': '1.2rem'
    },

    // Lists: square "pixel" markers in the decor color
    '.prose ul': { 'list-style': 'none', 'padding-inline-start': '0.2rem' },
    '.prose ul > li': {
      position: 'relative',
      'padding-inline-start': '1.35em',
      'margin-block': '0.4em'
    },
    '.prose ul > li::before': {
      content: '""',
      position: 'absolute',
      'inset-inline-start': '0.15em',
      top: '0.7em',
      width: '0.36em',
      height: '0.36em',
      'border-radius': '1px',
      'background-color': 'hsl(var(--decor) / 0.9)'
    },
    '.prose ol': {
      'list-style': 'none',
      'padding-inline-start': '0.2rem',
      'counter-reset': 'ink-ol'
    },
    '.prose ol > li': {
      'counter-increment': 'ink-ol',
      position: 'relative',
      'padding-inline-start': '1.75em',
      'margin-block': '0.4em'
    },
    '.prose ol > li::before': {
      content: 'counter(ink-ol)',
      position: 'absolute',
      'inset-inline-start': '0',
      top: '0.1em',
      'font-family': 'var(--font-display)',
      'font-weight': '400',
      'font-size': '0.95em',
      'font-variant-numeric': 'tabular-nums',
      color: 'hsl(var(--accent-2) / 1)',
      'min-width': '1.5em',
      'text-align': 'end'
    },
    '.prose ul ul,.prose ol ul,.prose ul ol,.prose ol ol': {
      'padding-inline-start': '0.4em',
      'margin-block': '0.2em'
    },

    // Horizontal rule: fading hairline
    '.prose hr': {
      border: 'none',
      height: '1px',
      width: '65%',
      margin: '2.5em auto',
      background: 'linear-gradient(to right, transparent, hsl(var(--line) / 1), transparent)'
    },

    // Tables: hairline rows only, hover highlight
    '.prose table': {
      'font-size': '0.9em',
      display: 'block',
      'overflow-x': 'auto',
      'border-collapse': 'collapse'
    },
    '.prose thead th': {
      'font-weight': '600',
      color: ink,
      'background-color': 'hsl(var(--wash) / 0.6)',
      'white-space': 'nowrap'
    },
    '.prose td,.prose th': { border: 'none', padding: '0.55em 1em' },
    '.prose tbody tr': {
      'border-top': '1px solid hsl(var(--line) / 1)',
      transition: 'background-color 0.15s ease'
    },
    '.prose tbody tr:hover': { 'background-color': 'hsl(var(--wash) / 0.5)' },

    // Images & captions
    '.prose figure': { margin: '1.8em auto' },
    '.prose figure > img,.prose figure > .lb-trigger': { margin: '0 auto' },
    '.prose img': {
      'border-radius': 'calc(var(--radius) * 1.25)',
      margin: '1.5em auto',
      'box-shadow': '0 1px 2px hsl(var(--ink) / 0.05), 0 18px 40px -22px hsl(var(--decor) / 0.35)'
    },
    '.prose figcaption': {
      'text-align': 'center',
      'font-size': '0.85em',
      'line-height': '1.5',
      color: 'hsl(var(--ink-soft) / 1)',
      'margin-top': '0.4em'
    },

    // Strong & emphasized
    '.prose strong': { 'font-weight': '650', color: ink },
    '.prose em': { 'font-style': 'italic' },

    // Keyboard keys
    '.prose kbd': {
      'font-family': 'var(--font-mono)',
      'border-radius': '0.3em',
      'border-color': line,
      'box-shadow': '0 2px 0 hsl(var(--line) / 1)',
      padding: '0.15em 0.45em'
    },

    // Footnote refs
    '.prose sup a': { 'scroll-margin-top': '5rem' }
  }
}

export default defineConfig({
  presets: [
    presetWind3(),
    presetTypography(typography),
    presetIcons({
      collections: {
        lucide: () =>
          import('@iconify-json/lucide/icons.json').then((m) => (m.default || m) as never)
      },
      scale: 1.1,
      warn: true
    })
  ],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      // Surface & text
      paper: 'hsl(var(--paper) / <alpha-value>)',
      ink: 'hsl(var(--ink) / <alpha-value>)',
      'ink-soft': 'hsl(var(--ink-soft) / <alpha-value>)',
      // Muted surface
      wash: 'hsl(var(--wash) / <alpha-value>)',
      card: 'hsl(var(--card) / <alpha-value>)',
      // Base colors of the palette: accent (10 %, rose / gold / blue-green),
      // accent-2 (indigo / peach / periwinkle), accent-vivid (decor only),
      // accent-fg (text on a solid accent), glow (selection, <mark>)
      accent: 'hsl(var(--accent) / <alpha-value>)',
      'accent-vivid': 'hsl(var(--accent-vivid) / <alpha-value>)',
      'accent-fg': 'hsl(var(--accent-fg) / <alpha-value>)',
      'accent-2': 'hsl(var(--accent-2) / <alpha-value>)',
      glow: 'hsl(var(--glow) / <alpha-value>)',
      ring: 'hsl(var(--ring) / <alpha-value>)',
      // Roles, mapped to base colors by each palette (tokens.css): tags and active
      // items, small information, decor (never text), text of hovered buttons
      secondary: 'hsl(var(--secondary) / <alpha-value>)',
      meta: 'hsl(var(--meta) / <alpha-value>)',
      decor: 'hsl(var(--decor) / <alpha-value>)',
      'hover-ink': 'hsl(var(--hover-ink) / <alpha-value>)',
      // Borders
      line: 'hsl(var(--line) / <alpha-value>)'
    },
    fontFamily: {
      display: 'var(--font-display)',
      serif: 'var(--font-serif)',
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)'
    }
  },
  shortcuts: {
    // Article lists use open rows; other card-based components keep their own surfaces.
    'post-row': 'border-b border-line/70 py-6 last:border-b-0 sm:py-7',
    'tag-link':
      'inline-flex min-h-6 items-center gap-1 text-xs text-ink-soft underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline focus-visible:text-accent focus-visible:underline',
    // Card surface: cold at rest, border and glow in the decor color on hover
    'paper-card':
      'rounded-xl border border-line bg-card/70 transition-[border-color,box-shadow] duration-300 hover:border-decor/50 hover:shadow-[0_0_0_1px_hsl(var(--decor)/0.1),0_12px_32px_-14px_hsl(var(--decor)/0.4)]',
    // Tag label: the secondary role and no hover, so it reads as information
    'tag-pill':
      'inline-flex items-center rounded-md border border-secondary/22 bg-secondary/8 px-2 py-0.5 text-xs text-secondary',
    // Pill chip (secondary actions: back links, source code…), secondary role
    chip: 'inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/8 px-3 py-1 text-xs font-medium text-secondary transition-colors duration-200 hover:border-secondary/60 hover:bg-secondary/15',
    // Text link: underline in the palette's link color, accent on hover
    'link-ink':
      'underline [text-decoration-color:var(--link-underline)] decoration-1.5 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent',
    // Icon-only link (add a size utility, e.g. `size-8`)
    'icon-link':
      'inline-flex items-center justify-center rounded-lg text-ink-soft transition-colors duration-200 hover:bg-wash hover:text-accent',
    // Main call to action, the accent (10 %): rose in light, gold in dark; ink on hover
    'btn-hot':
      'inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-[0.95rem] font-semibold text-accent-fg transition-[background-color,color,box-shadow] duration-200 hover:bg-ink hover:text-paper hover:shadow-[0_14px_34px_-12px_hsl(var(--accent)/0.6)]'
  },
  // Classes referenced only through config lookups (SOCIAL_ICONS in
  // src/utils/index.ts) are invisible to the scanners — generate them explicitly.
  safelist: [
    'i-lucide-github',
    'i-lucide-gitlab',
    'i-lucide-linkedin',
    'i-lucide-mail',
    'i-lucide-twitter',
    'i-lucide-instagram',
    'i-lucide-rss',
    'i-lucide-globe',
    'i-lucide-link'
  ]
})
