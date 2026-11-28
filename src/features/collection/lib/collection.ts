import type { EntryMeta } from '@/features/collection/model'

/** Теги от всех записей в порядке первого появления. Не зависит от фильтра. */
export function collectTags(entries: readonly EntryMeta[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const entry of entries) {
    for (const tag of entry.tags) {
      if (!seen.has(tag)) {
        seen.add(tag)
        result.push(tag)
      }
    }
  }
  return result
}

/** AND-фильтр: остаются записи, у которых есть все выбранные теги. Порядок сохраняется. */
export function filterByTags(
  entries: readonly EntryMeta[],
  selected: readonly string[],
): EntryMeta[] {
  if (selected.length === 0) return [...entries]
  return entries.filter((entry) => selected.every((tag) => entry.tags.includes(tag)))
}

/** Разбор `?tags=a,b`: дубликаты и пустые значения отбрасываются. */
export function parseTagsQuery(raw: string | null | undefined): string[] {
  if (!raw) return []
  const seen = new Set<string>()
  const result: string[] = []
  for (const part of raw.split(',')) {
    const tag = part.trim()
    if (tag === '' || seen.has(tag)) continue
    seen.add(tag)
    result.push(tag)
  }
  return result
}

/** Отбрасывает неизвестные теги (нет в списке всех тегов раздела). */
export function keepKnownTags(selected: readonly string[], known: readonly string[]): string[] {
  const knownSet = new Set(known)
  return selected.filter((tag) => knownSet.has(tag))
}

export function findEntryBySlug(
  entries: readonly EntryMeta[],
  slug: string,
): EntryMeta | undefined {
  return entries.find((entry) => entry.slug === slug)
}

/** Сериализует выбранные теги в `?tags=a,b` (пустой выбор → нет параметра). */
export function serializeTags(tags: readonly string[]): string {
  return tags.join(',')
}

/** Суффикс адреса с выбранными тегами: `?tags=a,b` либо пустая строка. */
export function tagsQuery(selected: readonly string[]): string {
  const serialized = serializeTags(selected)
  return serialized === '' ? '' : `?tags=${serialized}`
}

/** Адрес записи с сохранением выбранных тегов: при переходе фильтр не сбрасывается. */
export function entryHref(basePath: string, slug: string, selected: readonly string[]): string {
  return `${basePath}/${slug}/${tagsQuery(selected)}`
}
