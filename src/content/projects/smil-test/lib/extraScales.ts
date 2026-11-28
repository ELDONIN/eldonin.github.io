import type { ExtraScore } from './score'
import { isOutOfRange } from './score'

export type ExtraSort = 'n' | 'dev' | 't_desc' | 't_asc' | 'raw'

export interface ExtraFilter {
  readonly query?: string
  readonly sort?: ExtraSort
  readonly onlyOutOfRange?: boolean
}

export interface ExtraList {
  readonly items: readonly ExtraScore[]
  readonly shown: number
  readonly outside: number
  readonly total: number
}

function compare(a: ExtraScore, b: ExtraScore, sort: ExtraSort): number {
  switch (sort) {
    case 'dev':
      return Math.abs(b.t - 50) - Math.abs(a.t - 50) || a.scale.index - b.scale.index
    case 't_desc':
      return b.t - a.t || a.scale.index - b.scale.index
    case 't_asc':
      return a.t - b.t || a.scale.index - b.scale.index
    case 'raw':
      return b.raw - a.raw || a.scale.index - b.scale.index
    default:
      return a.scale.index - b.scale.index
  }
}

export function filterAndSortExtra(
  scores: readonly ExtraScore[],
  { query = '', sort = 'n', onlyOutOfRange = false }: ExtraFilter = {},
): ExtraList {
  const needle = query.trim().toLowerCase()
  const outside = scores.reduce((count, score) => (isOutOfRange(score.t) ? count + 1 : count), 0)
  const items = scores
    .filter((score) => {
      if (needle && !score.scale.title.toLowerCase().includes(needle)) return false
      if (onlyOutOfRange && !isOutOfRange(score.t)) return false
      return true
    })
    .slice()
    .sort((a, b) => compare(a, b, sort))
  return { items, shown: items.length, outside, total: scores.length }
}
