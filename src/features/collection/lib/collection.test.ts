import { describe, expect, it } from 'vitest'
import type { EntryMeta } from '../model'
import {
  collectTags,
  filterByTags,
  findEntryBySlug,
  keepKnownTags,
  parseTagsQuery,
} from './collection'

const entries = [
  { slug: 'a', title: 'A', description: '', createDate: '2026-01-01', updateDate: '2026-01-01', tags: ['x', 'y'] },
  { slug: 'b', title: 'B', description: '', createDate: '2026-01-01', updateDate: '2026-01-01', tags: ['x'] },
  { slug: 'c', title: 'C', description: '', createDate: '2026-01-01', updateDate: '2026-01-01', tags: ['z'] },
] as const satisfies readonly EntryMeta[]

describe('collectTags', () => {
  it('возвращает теги в порядке первого появления', () => {
    expect(collectTags(entries)).toEqual(['x', 'y', 'z'])
  })
})

describe('filterByTags', () => {
  it('пустой выбор = все записи', () => {
    expect(filterByTags(entries, [])).toHaveLength(3)
  })

  it('AND: остаются записи со всеми выбранными тегами', () => {
    expect(filterByTags(entries, ['x', 'y']).map((e) => e.slug)).toEqual(['a'])
  })

  it('сохраняет порядок', () => {
    expect(filterByTags(entries, ['x']).map((e) => e.slug)).toEqual(['a', 'b'])
  })

  it('нет совпадений = пустой список', () => {
    expect(filterByTags(entries, ['nope'])).toEqual([])
  })
})

describe('parseTagsQuery', () => {
  it('разбивает по запятой, отбрасывает пустые и дубликаты', () => {
    expect(parseTagsQuery('a,b,,a,')).toEqual(['a', 'b'])
  })

  it('null → пустой список', () => {
    expect(parseTagsQuery(null)).toEqual([])
  })
})

describe('keepKnownTags', () => {
  it('отбрасывает неизвестные теги', () => {
    expect(keepKnownTags(['a', 'zzz'], ['a', 'b'])).toEqual(['a'])
  })
})

describe('findEntryBySlug', () => {
  it('находит запись', () => {
    expect(findEntryBySlug(entries, 'b')?.slug).toBe('b')
  })

  it('undefined, если записи нет', () => {
    expect(findEntryBySlug(entries, 'zzz')).toBeUndefined()
  })
})
