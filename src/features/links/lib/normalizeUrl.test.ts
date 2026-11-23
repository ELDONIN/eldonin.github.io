import { describe, expect, it } from 'vitest'
import { normalizeUrl } from './normalizeUrl'

describe('normalizeUrl', () => {
  it('приводит схему и хост к нижнему регистру', () => {
    expect(normalizeUrl('HTTPS://Example.COM/path')).toBe('https://example.com/path')
  })

  it('отбрасывает завершающий слеш', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com')
  })

  it('отбрасывает фрагмент', () => {
    expect(normalizeUrl('https://example.com/page#anchor')).toBe('https://example.com/page')
  })

  it('сохраняет query', () => {
    expect(normalizeUrl('https://example.com/?ref=x')).toBe('https://example.com/?ref=x')
  })
})
