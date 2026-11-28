'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { parseTagsQuery, tagsQuery } from './lib/collection'

interface BackLinkProps {
  basePath: string
  className?: string
}

/** Ссылка «← Back» с сохранением выбранных тегов (раздел 7). */
export function BackLink({ basePath, className }: BackLinkProps) {
  const searchParams = useSearchParams()
  const tags = parseTagsQuery(searchParams.get('tags'))
  const href = `${basePath}/${tagsQuery(tags)}`
  return (
    <Link href={href} className={className} lang="en">
      ← Back
    </Link>
  )
}
