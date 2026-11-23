import { describe, expect, it } from 'vitest'
import { parseImageAlt } from './parseImageAlt'

describe('parseImageAlt', () => {
  it('текст|300 → ширина', () => {
    expect(parseImageAlt('текст|300')).toEqual({ alt: 'текст', width: 300, height: undefined })
  })

  it('текст|300x200 → ширина и высота', () => {
    expect(parseImageAlt('текст|300x200')).toEqual({ alt: 'текст', width: 300, height: 200 })
  })

  it('без размера', () => {
    expect(parseImageAlt('просто текст')).toEqual({ alt: 'просто текст', width: undefined, height: undefined })
  })

  it('| без числа игнорируется', () => {
    expect(parseImageAlt('текст|ширина')).toEqual({
      alt: 'текст|ширина',
      width: undefined,
      height: undefined,
    })
  })
})
