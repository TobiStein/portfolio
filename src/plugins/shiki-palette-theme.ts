/**
 * Code highlighting theme made of CSS variables: every color is a --code-*
 * token of src/assets/styles/tokens.css, so code blocks follow the palette
 * (fire / abyss) and the scheme (light / dark) without a second theme, and
 * their colors are edited in tokens.css like the rest of the site.
 * (Shiki keeps non-hex colors as they are in the generated HTML.)
 * The block background comes from global.css (--wash), not from the theme.
 */
import type { ThemeRegistration } from 'shiki'

const code = (name: string) => `var(--code-${name})`

export const paletteTheme: ThemeRegistration = {
  name: 'palette',
  colors: {
    'editor.background': 'transparent',
    'editor.foreground': code('fg')
  },
  fg: code('fg'),
  bg: 'transparent',
  tokenColors: [
    { settings: { foreground: code('fg') } },
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
      settings: { foreground: code('comment'), fontStyle: 'italic' }
    },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'keyword.control',
        'keyword.operator.new',
        'keyword.operator.expression',
        'keyword.operator.logical.python'
      ],
      settings: { foreground: code('keyword') }
    },
    {
      scope: ['string', 'string.quoted', 'string.template', 'markup.inline.raw'],
      settings: { foreground: code('string') }
    },
    {
      scope: [
        'constant.numeric',
        'constant.language',
        'constant.character',
        'constant.other',
        'support.constant',
        'variable.other.constant'
      ],
      settings: { foreground: code('number') }
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call',
        'variable.function'
      ],
      settings: { foreground: code('func') }
    },
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'support.type',
        'support.class',
        'entity.other.inherited-class',
        'storage.type.primitive'
      ],
      settings: { foreground: code('type') }
    },
    {
      scope: ['variable', 'variable.parameter', 'meta.definition.variable'],
      settings: { foreground: code('variable') }
    },
    {
      scope: ['variable.other.property', 'support.type.property-name', 'meta.object-literal.key'],
      settings: { foreground: code('property') }
    },
    {
      scope: ['punctuation', 'meta.brace', 'keyword.operator', 'punctuation.separator'],
      settings: { foreground: code('punctuation') }
    },
    {
      scope: ['entity.name.tag', 'punctuation.definition.tag'],
      settings: { foreground: code('tag') }
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: { foreground: code('attribute') }
    },
    {
      scope: ['markup.heading', 'entity.name.section'],
      settings: { foreground: code('keyword'), fontStyle: 'bold' }
    },
    { scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
    { scope: ['markup.inserted'], settings: { foreground: code('inserted') } },
    { scope: ['markup.deleted'], settings: { foreground: code('deleted') } }
  ]
}
