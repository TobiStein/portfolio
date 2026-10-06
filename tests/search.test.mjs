import assert from 'node:assert/strict'
import test from 'node:test'
import { searchEntries } from '../src/utils/search.ts'

const entry = (id, fields = {}) => ({
  id,
  title: 'An entry',
  description: '',
  content: '',
  tags: [],
  date: '2026-01-01',
  ...fields
})

test('title relevance wins over newer matches, followed by tags, descriptions and full text', () => {
  const items = [
    entry('body', { content: 'Astro', date: '2026-09-01' }),
    entry('description', { description: 'Astro' }),
    entry('tags', { tags: ['astro'] }),
    entry('title', { title: 'Astro guide' })
  ]
  assert.deepEqual(
    searchEntries(items, ' ASTRO ').map((e) => e.id),
    ['title', 'tags', 'description', 'body']
  )
  assert.equal(items[0].id, 'body') // ranking does not reorder the original list
})

test('matching ignores case and accents', () => {
  const items = [entry('cv', { title: 'Mon résumé' }), entry('other')]
  assert.deepEqual(
    searchEntries(items, 'RESUME').map((e) => e.id),
    ['cv']
  )
  assert.deepEqual(
    searchEntries([entry('accented', { content: 'Données' })], 'donnees').map((e) => e.id),
    ['accented']
  )
})

test('an empty query lists every entry, newest first; unknown words find nothing', () => {
  const items = [entry('old'), entry('new', { date: '2026-02-01' })]
  assert.deepEqual(
    searchEntries(items, '   ').map((e) => e.id),
    ['new', 'old']
  )
  assert.deepEqual(searchEntries(items, 'not present'), [])
})

test('selected tags keep only entries carrying all of them, combined with the query', () => {
  const items = [
    entry('web', { tags: ['web', 'astro'], title: 'Site' }),
    entry('data', { tags: ['python', 'data'], title: 'Pipeline' }),
    entry('both', { tags: ['web', 'python'], title: 'Site and pipeline', date: '2026-03-01' })
  ]
  assert.deepEqual(
    searchEntries(items, '', ['web']).map((e) => e.id),
    ['both', 'web']
  )
  assert.deepEqual(
    searchEntries(items, '', ['web', 'python']).map((e) => e.id),
    ['both']
  )
  assert.deepEqual(
    searchEntries(items, 'pipeline', ['web']).map((e) => e.id),
    ['both']
  )
  assert.deepEqual(searchEntries(items, '', ['unknown']), [])
})

test('equally relevant matches are ordered newest first', () => {
  const items = [entry('old', { title: 'Guide' }), entry('new', { title: 'Guide', date: '2026-02-01' })]
  assert.deepEqual(
    searchEntries(items, 'guide').map((e) => e.id),
    ['new', 'old']
  )
})
