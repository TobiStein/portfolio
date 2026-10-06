import { getCollection } from 'astro:content'
import type { CollectionEntry } from 'astro:content'

import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from '@/i18n'

import { readingTime, stripMarkdown } from './index'

export type EntryCollection = 'blog' | 'projects'
export type Post = CollectionEntry<'blog'>
export type Project = CollectionEntry<'projects'>
export type Entry = Post | Project

/** Language of an entry, from its folder: `fr/my-post` → `fr`. */
export function entryLocale(entry: Entry): Locale | undefined {
  const first = entry.id.split('/')[0]
  return isLocale(first) ? first : undefined
}

/** URL slug of an entry, without its language folder. Folder-based entries
 *  (`fr/mailserver/index.md`) keep the folder name: `mailserver`. */
export function entrySlug(entry: Entry): string {
  return entry.id.replace(/^[^/]+\//, '').replace(/\/index$/, '')
}

/** Public, language-prefixed URL of an entry, e.g. `/fr/blog/my-post`. */
export function entryUrl(entry: Entry): string {
  return localePath(entryLocale(entry) ?? DEFAULT_LOCALE, `/${entry.collection}/${entrySlug(entry)}`)
}

/** Id unique across collections, shared by the search page and its index. */
export function searchId(entry: Entry): string {
  return `${entry.collection}/${entry.id}`
}

/** Estimated reading time in minutes, from the entry's raw markdown body. */
export function getReadingTime(entry: Entry): number {
  return readingTime(stripMarkdown(entry.body ?? ''))
}

/** Newest first. */
export function sortByDate<T extends Entry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
}

/** Published blog posts of one language, newest first (drafts excluded). */
export async function getPosts(lang: Locale): Promise<Post[]> {
  return sortByDate(
    await getCollection('blog', (post) => !post.data.draft && entryLocale(post) === lang)
  )
}

/** Published projects of one language, newest first (drafts excluded). */
export async function getProjects(lang: Locale): Promise<Project[]> {
  return sortByDate(
    await getCollection('projects', (p) => !p.data.draft && entryLocale(p) === lang)
  )
}

/** Every entry of a collection in a language folder, drafts included
 *  (drafts are built so they stay reachable by URL). */
export async function getAllEntries(collection: EntryCollection): Promise<Entry[]> {
  const entries: Entry[] = await getCollection(collection)
  return entries.filter((entry) => {
    if (entryLocale(entry) !== undefined) return true
    warnOnce(
      `[content] "${collection}/${entry.id}" is skipped: its id has no fr/ or en/ prefix ` +
        '(keep the file in a language folder and do not set `slug:` in its frontmatter).'
    )
    return false
  })
}

const warned = new Set<string>()
function warnOnce(message: string) {
  if (warned.has(message)) return
  warned.add(message)
  console.warn(message)
}

/** URL of the same entry in another language, if a translation exists
 *  (a draft translation only counts when the entry itself is a draft). */
export async function getTranslationUrl(entry: Entry, target: Locale): Promise<string | undefined> {
  const slug = entrySlug(entry)
  const translation = (await getAllEntries(entry.collection)).find(
    (other) =>
      entryLocale(other) === target &&
      entrySlug(other) === slug &&
      (!other.data.draft || entry.data.draft)
  )
  return translation && entryUrl(translation)
}
