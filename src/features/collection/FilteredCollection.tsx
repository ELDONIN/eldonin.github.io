'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { EntryMeta } from '@/features/collection/model'
import { CollectionList } from './CollectionList'
import {
  collectTags,
  filterByTags,
  keepKnownTags,
  parseTagsQuery,
  serializeTags,
} from './lib/collection'

interface FilteredCollectionProps {
  entries: readonly EntryMeta[]
  basePath: string
  selectedSlug: string | null
}

export function FilteredCollection({ entries, basePath, selectedSlug }: FilteredCollectionProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const allTags = useMemo(() => collectTags(entries), [entries])
  const selectedTags = useMemo(
    () => keepKnownTags(parseTagsQuery(searchParams.get('tags')), allTags),
    [searchParams, allTags],
  )
  const filtered = useMemo(() => filterByTags(entries, selectedTags), [entries, selectedTags])

  function toggleTag(tag: string) {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    const query = next.length > 0 ? `?tags=${serializeTags(next)}` : ''
    router.replace(`${pathname}${query}`, { scroll: false })
  }

  return (
    <CollectionList
      entries={filtered}
      basePath={basePath}
      selectedSlug={selectedSlug}
      allTags={allTags}
      selectedTags={selectedTags}
      onTagToggle={toggleTag}
    />
  )
}
