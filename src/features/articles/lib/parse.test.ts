import { describe, expect, it } from 'vitest'
import { parseArticle } from './parse'

const options = {
  file: 'test.md',
  mediaDir: '/tmp/nonexistent-media',
  projectSlugs: ['a', 'b'],
}

describe('parseArticle: правила статей', () => {
  it('h1 запрещён', () => {
    expect(() => parseArticle('# Заголовок', options)).toThrow(/заголовок первого уровня/)
  })

  it('HTML запрещён', () => {
    expect(() => parseArticle('<div>x</div>', options)).toThrow(/HTML/)
  })

  it('wikilinks запрещены', () => {
    expect(() => parseArticle('текст [[link]]', options)).toThrow(/wikilinks/)
  })

  it('frontmatter запрещён', () => {
    expect(() => parseArticle('---\na: b\n---\n', options)).toThrow(/frontmatter/)
  })

  it('project: неизвестный slug', () => {
    expect(() => parseArticle('```project slug=zzz\n```', options)).toThrow(/неизвестный проект/)
  })

  it('project: height вне диапазона', () => {
    expect(() => parseArticle('```project slug=a height=50\n```', options)).toThrow(/height/)
  })

  it('project: корректный блок не роняет сборку', () => {
    expect(() => parseArticle('```project slug=a height=500\n```', options)).not.toThrow()
  })
})
