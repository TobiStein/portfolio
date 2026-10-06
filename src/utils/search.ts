/** One searchable entry (blog post or project) of the search page. */
export interface SearchItem {
  id: string
  title: string
  description: string
  tags: string[]
  /** ISO date: equally relevant results are ordered newest first */
  date: string
  /** Full text; empty until the content index has loaded */
  content: string
}

/** Lowercase and accent-free, so "resume" finds "Résumé". */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

/**
 * Entries carrying every selected tag, then ranked by the text query:
 * title > tags > description > full text, newest first on ties.
 * An empty query keeps every (tag-filtered) entry, newest first.
 */
export function searchEntries(items: SearchItem[], value: string, tags: string[] = []): SearchItem[] {
  const query = normalize(value.trim())
  return items
    .filter((item) => tags.every((tag) => item.tags.includes(tag)))
    .map((item) => {
      const score = !query
        ? 1
        : normalize(item.title).includes(query)
          ? 4
          : item.tags.some((tag) => normalize(tag).includes(query))
            ? 3
            : normalize(item.description).includes(query)
              ? 2
              : normalize(item.content).includes(query)
                ? 1
                : 0
      return { item, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Date.parse(b.item.date) - Date.parse(a.item.date))
    .map(({ item }) => item)
}
