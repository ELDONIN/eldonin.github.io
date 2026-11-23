import { describe, expect, it } from 'vitest'
import { normalizeUrl } from '@/features/links/lib/normalizeUrl'
import { articles } from './articles.meta'
import { links } from './links'
import { projects } from './projects'
import { entryMetaSchema, linkEntrySchema } from './schema'

describe('манифесты контента', () => {
  it('списки непустые', () => {
    expect(projects.length).toBeGreaterThan(0)
    expect(articles.length).toBeGreaterThan(0)
    expect(links.length).toBeGreaterThan(0)
  })

  it('проекты проходят схему', () => {
    for (const p of projects) {
      const result = entryMetaSchema.safeParse(p.meta)
      expect(result.success, JSON.stringify(result.error?.issues)).toBe(true)
    }
  })

  it('статьи проходят схему', () => {
    for (const a of articles) {
      const result = entryMetaSchema.safeParse(a)
      expect(result.success, JSON.stringify(result.error?.issues)).toBe(true)
    }
  })

  it('ссылки проходят схему', () => {
    for (const l of links) {
      const result = linkEntrySchema.safeParse(l)
      expect(result.success, JSON.stringify(result.error?.issues)).toBe(true)
    }
  })

  it('title уникален среди проектов (без учёта регистра и пробелов)', () => {
    const seen = new Set<string>()
    for (const p of projects) {
      const key = p.meta.title.trim().toLowerCase()
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })

  it('title уникален среди статей', () => {
    const seen = new Set(articles.map((a) => a.title.trim().toLowerCase()))
    expect(seen.size).toBe(articles.length)
  })

  it('slug уникален среди проектов', () => {
    const seen = new Set(projects.map((p) => p.meta.slug))
    expect(seen.size).toBe(projects.length)
  })

  it('slug уникален среди статей', () => {
    const seen = new Set(articles.map((a) => a.slug))
    expect(seen.size).toBe(articles.length)
  })

  it('url ссылок уникален после нормализации', () => {
    const seen = new Set<string>()
    for (const l of links) {
      const key = normalizeUrl(l.url)
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })
})
