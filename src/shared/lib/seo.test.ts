import { describe, expect, it } from 'vitest'
import { pageMetadata, toCanonicalPath } from './seo'

describe('toCanonicalPath', () => {
  it('добавляет завершающий слеш', () => {
    expect(toCanonicalPath('/playground')).toBe('/playground/')
  })

  it('сохраняет завершающий слеш', () => {
    expect(toCanonicalPath('/playground/')).toBe('/playground/')
  })

  it('отбрасывает query и фрагмент', () => {
    expect(toCanonicalPath('/articles/a?tags=x#y')).toBe('/articles/a/')
  })

  it('корень остаётся /', () => {
    expect(toCanonicalPath('/')).toBe('/')
  })
})

describe('pageMetadata', () => {
  it('canonical — абсолютный адрес со слешем, без query', () => {
    const md = pageMetadata({ title: 'T', description: 'D', path: '/articles/a?tags=x' })
    expect(md.alternates?.canonical).toBe('https://eldonin.github.io/articles/a/')
  })

  it('у статьи type=article', () => {
    const md = pageMetadata({
      title: 'T',
      description: 'D',
      path: '/articles/a/',
      type: 'article',
      publishedTime: '2026-01-01',
      modifiedTime: '2026-01-02',
    })
    const og = md.openGraph as { type?: string; publishedTime?: string } | null | undefined
    expect(og?.type).toBe('article')
    expect(og?.publishedTime).toBe('2026-01-01')
  })
})
