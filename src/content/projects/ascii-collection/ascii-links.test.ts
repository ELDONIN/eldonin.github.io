import { describe, expect, it } from 'vitest'
import { ASCII_LINKS } from './ascii-links'

describe('ASCII_LINKS', () => {
  it('у каждой ссылки есть имя и http(s)-адрес', () => {
    expect(ASCII_LINKS.length).toBeGreaterThan(0)
    for (const link of ASCII_LINKS) {
      expect(link.name.trim()).not.toBe('')
      expect(link.url).toMatch(/^https?:\/\//)
    }
  })

  it('адреса не повторяются', () => {
    const urls = ASCII_LINKS.map((link) => link.url)
    expect(new Set(urls).size).toBe(urls.length)
  })
})
