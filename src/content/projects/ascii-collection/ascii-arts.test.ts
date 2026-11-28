import { describe, expect, it } from 'vitest'
import { ASCII_ARTS, parseArts } from './ascii-arts'
import { textLength } from './core'

describe('parseArts', () => {
  it('делит файл на арты по строкам-разделителям', () => {
    const arts = parseArts('----8<---- first\nA\n----8<---- second\nB\nC\n')
    expect(arts).toHaveLength(2)
    expect(arts[0]).toEqual({ caption: 'first', lines: ['A'], width: 1, height: 1 })
    expect(arts[1]).toEqual({ caption: 'second', lines: ['B', 'C'], width: 1, height: 2 })
  })

  it('раскрывает табы и обрезает пустые строки по краям', () => {
    const arts = parseArts('----8<---- cat\n\n\tA\n\n')
    expect(arts).toHaveLength(1)
    expect(arts[0]).toEqual({ caption: 'cat', lines: ['        A'], width: 9, height: 1 })
  })

  it('пропускает блоки без строк', () => {
    expect(parseArts('----8<---- empty\n----8<---- art\nA\n')).toHaveLength(1)
  })

  it('нормализует CRLF', () => {
    expect(parseArts('----8<---- x\r\nA\r\n')).toEqual([
      { caption: 'x', lines: ['A'], width: 1, height: 1 },
    ])
  })
})

describe('ASCII_ARTS', () => {
  it('арты непустые, размеры совпадают со строками', () => {
    expect(ASCII_ARTS.length).toBeGreaterThan(0)
    for (const art of ASCII_ARTS) {
      expect(art.lines.length).toBeGreaterThan(0)
      expect(art.height).toBe(art.lines.length)
      expect(art.width).toBe(Math.max(0, ...art.lines.map(textLength)))
      expect(art.width).toBeGreaterThan(0)
    }
  })

  it('в строках нет табов и CRLF', () => {
    for (const art of ASCII_ARTS) {
      for (const line of art.lines) {
        expect(line.includes('\t')).toBe(false)
        expect(line.includes('\r')).toBe(false)
      }
    }
  })

  it('подпись — строка', () => {
    for (const art of ASCII_ARTS) {
      expect(typeof art.caption).toBe('string')
    }
  })
})
