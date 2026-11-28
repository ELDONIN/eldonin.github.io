import { describe, expect, it } from 'vitest'
import { EXTRA_SCALES } from './extraScales'
import { MAIN_SCALES } from './mainScales'
import { QUESTIONS, TOTAL_QUESTIONS } from './questions'

function keyedNumbers(): number[] {
  const result: number[] = []
  for (const scale of MAIN_SCALES) result.push(...scale.yes, ...scale.no)
  for (const scale of EXTRA_SCALES) result.push(...scale.yes, ...scale.no)
  return result
}

describe('данные СМИЛ', () => {
  it('содержит 566 непустых вопросов', () => {
    expect(QUESTIONS).toHaveLength(566)
    expect(TOTAL_QUESTIONS).toBe(566)
    for (const question of QUESTIONS) expect(question.trim().length).toBeGreaterThan(0)
  })

  it('содержит 13 базовых шкал в исходном порядке', () => {
    expect(MAIN_SCALES.map((scale) => scale.id)).toEqual([
      'L',
      'F',
      'K',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '0',
    ])
    for (const scale of MAIN_SCALES) {
      expect(scale.title.length).toBeGreaterThan(0)
      expect(scale.yes.length + scale.no.length).toBeGreaterThan(0)
      expect(scale.sd).toBeGreaterThan(0)
    }
  })

  it('содержит 108 дополнительных шкал с непустыми названиями и коэффициентами', () => {
    expect(EXTRA_SCALES).toHaveLength(108)
    expect(EXTRA_SCALES.map((scale) => scale.index)).toEqual(
      Array.from({ length: 108 }, (_, i) => i + 1),
    )
    for (const scale of EXTRA_SCALES) {
      expect(scale.title.length).toBeGreaterThan(0)
      expect(scale.yes.length + scale.no.length).toBeGreaterThan(0)
      expect(scale.sd).toBeGreaterThan(0)
    }
  })

  it('все номера ключей в диапазоне 1..566', () => {
    for (const n of keyedNumbers()) {
      expect(Number.isInteger(n)).toBe(true)
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(TOTAL_QUESTIONS)
    }
  })

  it('внутри шкалы нет повторов ключей', () => {
    for (const scale of [...MAIN_SCALES, ...EXTRA_SCALES]) {
      expect(new Set(scale.yes).size).toBe(scale.yes.length)
      expect(new Set(scale.no).size).toBe(scale.no.length)
    }
  })

  it('пересечения «Да»/«Нет» совпадают с legacy (4 и 88)', () => {
    const overlaps: { id: string; overlap: number[] }[] = []
    for (const scale of MAIN_SCALES) {
      const no: readonly number[] = scale.no
      const overlap = scale.yes.filter((n) => no.includes(n))
      if (overlap.length) overlaps.push({ id: `main-${scale.id}`, overlap })
    }
    for (const scale of EXTRA_SCALES) {
      const no: readonly number[] = scale.no
      const overlap = scale.yes.filter((n) => no.includes(n))
      if (overlap.length) overlaps.push({ id: `extra-${String(scale.index)}`, overlap })
    }
    expect(overlaps).toEqual([
      { id: 'extra-4', overlap: [437, 465, 533] },
      { id: 'extra-88', overlap: [437] },
    ])
  })
})
