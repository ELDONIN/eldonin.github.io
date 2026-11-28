import { describe, expect, it } from 'vitest'
import { LEGACY_FIXTURES } from '../data/legacyFixtures'
import { MAIN_SCALES } from '../data/mainScales'
import type { Answer, AnswerChain, Answers } from './answers'
import { affectedMainScales, mainT, scoreAnswers } from './score'

const CODE: Readonly<Record<string, Answer>> = { D: 'yes', N: 'no', Z: 'unknown' }

function answersFromString(answers: string): Answers {
  const result: Record<number, AnswerChain> = {}
  for (const [index, code] of Array.from(answers).entries()) {
    const answer = CODE[code]
    if (answer) result[index + 1] = [answer]
  }
  return result
}

describe('подсчёт СМИЛ', () => {
  it('совпадает с legacy на эталонных наборах', () => {
    expect(LEGACY_FIXTURES.length).toBeGreaterThan(5)
    for (const fixture of LEGACY_FIXTURES) {
      const score = scoreAnswers(answersFromString(fixture.answers))
      expect(score.main.map((item) => item.raw), `${fixture.name}: сырые базовые`).toEqual([
        ...fixture.mainRaw,
      ])
      expect(score.main.map((item) => item.t), `${fixture.name}: T базовые`).toEqual([
        ...fixture.mainT,
      ])
      expect(score.extra.map((item) => item.raw), `${fixture.name}: сырые доп.`).toEqual([
        ...fixture.extraRaw,
      ])
      expect(score.extra.map((item) => item.t), `${fixture.name}: T доп.`).toEqual([
        ...fixture.extraT,
      ])
    }
  })

  it('считает отвеченные и «Не знаю»', () => {
    const score = scoreAnswers({ 1: ['yes'], 2: ['unknown'], 3: ['no', 'unknown'] })
    expect(score.answered).toBe(3)
    expect(score.unknown).toBe(2)
  })

  it('не учитывает «Не знаю» в сырых баллах', () => {
    const score = scoreAnswers({ 1: ['unknown'] })
    for (const item of score.main) expect(item.raw).toBe(0)
    for (const item of score.extra) expect(item.raw).toBe(0)
    expect(score.rawK).toBe(0)
  })

  it('L набирается только ответами «Нет» (как в legacy)', () => {
    const allYes = scoreAnswers(answersFromString('D'.repeat(566)))
    const allNo = scoreAnswers(answersFromString('N'.repeat(566)))
    const l = (score: ReturnType<typeof scoreAnswers>) =>
      score.main.find((item) => item.scale.id === 'L')?.raw
    expect(l(allYes)).toBe(0)
    expect(l(allNo)).toBe(15)
  })

  it('при смене ответа пересчитывает шкалу по ключам', () => {
    const scale = MAIN_SCALES.find((item) => item.id === 'F')
    expect(scale).toBeDefined()
    if (!scale) return
    const question = 14
    const before = scoreAnswers({ [question]: ['yes'] })
    const after = scoreAnswers({ [question]: ['yes', 'no'] })
    const fBefore = before.main.find((item) => item.scale.id === 'F')
    const fAfter = after.main.find((item) => item.scale.id === 'F')
    expect(fBefore?.raw).toBe(1)
    expect(fAfter?.raw).toBe(0)
    expect(fAfter?.t).toBe(mainT(scale, 0, before.rawK))
  })

  it('K-коррекция входит в T-балл первой шкалы', () => {
    const scale1 = MAIN_SCALES.find((scale) => scale.id === '1')
    expect(scale1).toBeDefined()
    if (!scale1) return
    const withK = mainT(scale1, 0, 5)
    const withoutK = mainT(scale1, 0, 0)
    expect(withK - withoutK).toBeCloseTo((10 * 0.5 * 5) / scale1.sd, 2)
  })

  it('показывает, какие базовые шкалы изменились после ответа', () => {
    const previous = scoreAnswers({})
    const next = scoreAnswers({ 14: ['yes'] })
    const affected = affectedMainScales(previous, next)
    expect(affected).toEqual([{ id: 'F', title: 'F: Достоверности', delta: 1 }])
    expect(affectedMainScales(next, next)).toEqual([])
  })
})
