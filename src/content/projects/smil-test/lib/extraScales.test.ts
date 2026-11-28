import { describe, expect, it } from 'vitest'
import { EXTRA_SCALES } from '../data/extraScales'
import { filterAndSortExtra } from './extraScales'
import type { ExtraScore } from './score'

const rawValues = [10, 5, 20, 1]
const tValues = [90, 20, 60, 50]

const scores: readonly ExtraScore[] = EXTRA_SCALES.slice(0, 4).map((scale, index) => ({
  scale,
  raw: rawValues[index] ?? 0,
  t: tValues[index] ?? 50,
}))

describe('дополнительные шкалы: фильтр и сортировка', () => {
  it('по умолчанию идёт по номеру шкалы', () => {
    expect(filterAndSortExtra(scores).items.map((item) => item.scale.index)).toEqual([
      1, 2, 3, 4,
    ])
  })

  it('сортирует по отклонению от 50', () => {
    expect(
      filterAndSortExtra(scores, { sort: 'dev' }).items.map((item) => item.scale.index),
    ).toEqual([1, 2, 3, 4])
  })

  it('сортирует по T и сырым баллам', () => {
    expect(
      filterAndSortExtra(scores, { sort: 't_desc' }).items.map((item) => item.t),
    ).toEqual([90, 60, 50, 20])
    expect(filterAndSortExtra(scores, { sort: 't_asc' }).items.map((item) => item.t)).toEqual([
      20, 50, 60, 90,
    ])
    expect(
      filterAndSortExtra(scores, { sort: 'raw' }).items.map((item) => item.raw),
    ).toEqual([20, 10, 5, 1])
  })

  it('фильтрует по названию', () => {
    const first = EXTRA_SCALES[0]
    const needle = first.title.slice(0, 5).toLowerCase()
    const result = filterAndSortExtra(scores, { query: needle })
    expect(result.items.map((item) => item.scale.index)).toEqual([1])
  })

  it('оставляет только шкалы вне нормы и считает статистику', () => {
    const result = filterAndSortExtra(scores, { onlyOutOfRange: true })
    expect(result.items.map((item) => item.t)).toEqual([90, 20])
    expect(result.total).toBe(4)
    expect(result.shown).toBe(2)
    expect(result.outside).toBe(2)
  })
})
