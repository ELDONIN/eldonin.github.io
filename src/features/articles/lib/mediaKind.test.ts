import { describe, expect, it } from 'vitest'
import { mediaKind } from './mediaKind'

describe('mediaKind', () => {
  it('mp4/webm → video', () => {
    expect(mediaKind('/media_articles/a.mp4')).toBe('video')
    expect(mediaKind('/media_articles/a.webm')).toBe('video')
  })

  it('mp3 → audio', () => {
    expect(mediaKind('/media_articles/a.mp3')).toBe('audio')
  })

  it('png → image', () => {
    expect(mediaKind('/media_articles/a.png')).toBe('image')
  })

  it('без расширения → image', () => {
    expect(mediaKind('/media_articles/a')).toBe('image')
  })
})
