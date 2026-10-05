import rss from '@astrojs/rss'
import type { APIContext, GetStaticPaths } from 'astro'

import { LOCALE_META, localePath, localeStaticPaths, pick, type Locale } from '@/i18n'
import { config } from '@/site-config'
import { entryUrl, getPosts } from '@/utils/server'

// One feed per language: /fr/rss.xml, /en/rss.xml
export const getStaticPaths = (() => localeStaticPaths()) satisfies GetStaticPaths

export async function GET({ props, site }: APIContext) {
  const lang = props.lang as Locale
  const siteUrl = site ?? 'https://example.com'
  const posts = await getPosts(lang)

  return rss({
    title: config.site.title,
    description: pick(config.site.description, lang),
    // Channel link: the home page of this language (base-aware)
    site: new URL(localePath(lang), siteUrl).href,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      // entryUrl already contains the base: make it absolute here so it is never prefixed twice
      link: new URL(entryUrl(post), siteUrl).href,
      categories: post.data.tags,
      // Full post as HTML so subscribers get the whole article
      content: post.rendered?.html ?? ''
    })),
    customData: `<language>${LOCALE_META[lang].intl}</language>`
  })
}
