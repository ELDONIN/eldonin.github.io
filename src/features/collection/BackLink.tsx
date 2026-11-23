'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface BackLinkProps {
  basePath: string
  className?: string
}

/** Ссылка «← Back» с сохранением выбранных тегов (раздел 14.4). */
export function BackLink({ basePath, className }: BackLinkProps) {
  const searchParams = useSearchParams()
  const tags = searchParams.get('tags')
  const href = tags ? `${basePath}/?tags=${tags}` : `${basePath}/`
  return (
    <Link href={href} className={className} lang="en">
      ← Back
    </Link>
  )
}
