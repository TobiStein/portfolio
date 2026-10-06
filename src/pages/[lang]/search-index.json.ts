import type { APIContext, GetStaticPaths } from 'astro'

import { localeStaticPaths, type Locale } from '@/i18n'
import { stripMarkdown } from '@/utils'
import { getPosts, getProjects, searchId } from '@/utils/server'

/**
 * Full text of every published entry, keyed by search id: `/fr/search-index.json`.
 * Loaded by the search page the first time someone types, so the page itself stays
 * light; titles, descriptions and tags are already in the page.
 */
export const getStaticPaths = (() => localeStaticPaths()) satisfies GetStaticPaths

export async function GET({ props }: APIContext) {
  const lang = props.lang as Locale
  const entries = [...(await getProjects(lang)), ...(await getPosts(lang))]
  const index = Object.fromEntries(
    entries.map((entry) => [searchId(entry), stripMarkdown(entry.body ?? '')])
  )
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  })
}
