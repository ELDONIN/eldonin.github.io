import type { MetadataRoute } from 'next'
import { articles } from '@/content/articles.meta'
import { projects } from '@/content/projects'
import { SITE_URL } from '@/shared/config/site'
import { toCanonicalPath } from '@/shared/lib/seo'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const sections = ['/playground', '/articles', '/links'].map((path) => ({
    url: `${SITE_URL}${toCanonicalPath(path)}`,
  }))
  const projectEntries = projects.map((p) => ({
    url: `${SITE_URL}${toCanonicalPath(`/playground/${p.meta.slug}`)}`,
    lastModified: p.meta.updateDate,
  }))
  const articleEntries = articles.map((a) => ({
    url: `${SITE_URL}${toCanonicalPath(`/articles/${a.slug}`)}`,
    lastModified: a.updateDate,
  }))
  return [...sections, ...projectEntries, ...articleEntries]
}
