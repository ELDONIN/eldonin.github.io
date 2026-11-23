import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/shared/config/site'

export interface PageMetadataInput {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  /** Использовать title как есть, без шаблона «%s · Gnozila» (страницы разделов). */
  absoluteTitle?: boolean
}

/** Приводит путь к канонической форме: слеш на конце, без query и фрагмента. */
export function toCanonicalPath(path: string): string {
  const cleaned = path.split(/[?#]/)[0] ?? '/'
  if (cleaned === '' || cleaned === '/') return '/'
  return cleaned.endsWith('/') ? cleaned : `${cleaned}/`
}

/** Единая сборка метаданных страницы (раздел 19). */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const canonicalPath = toCanonicalPath(input.path)
  const url = `${SITE_URL}${canonicalPath}`
  const type = input.type ?? 'website'

  const baseOg = {
    title: input.title,
    description: input.description,
    url,
    siteName: SITE_NAME,
    locale: 'ru_RU',
    images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630 }],
  }

  const openGraph: NonNullable<Metadata['openGraph']> =
    type === 'article'
      ? {
          ...baseOg,
          type: 'article',
          publishedTime: input.publishedTime,
          modifiedTime: input.modifiedTime,
        }
      : { ...baseOg, type: 'website' }

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630 }],
    },
  }
}
