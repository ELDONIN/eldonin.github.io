import { EXTRA_SCALES, type ExtraScale } from '../data/extraScales'
import { MAIN_SCALES, type MainScale, type MainScaleId } from '../data/mainScales'
import { TOTAL_QUESTIONS } from '../data/questions'
import { currentAnswer, type Answer, type Answers } from './answers'

export interface MainScore {
  readonly scale: MainScale
  readonly raw: number
  readonly t: number
}

export interface ExtraScore {
  readonly scale: ExtraScale
  readonly raw: number
  readonly t: number
}

export interface Score {
  readonly answered: number
  readonly unknown: number
  readonly rawK: number
  readonly main: readonly MainScore[]
  readonly extra: readonly ExtraScore[]
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function currentAnswers(answers: Answers): readonly (Answer | undefined)[] {
  const current: (Answer | undefined)[] = new Array<Answer | undefined>(TOTAL_QUESTIONS + 1)
  for (let n = 1; n <= TOTAL_QUESTIONS; n++) current[n] = currentAnswer(answers[n])
  return current
}

function countKeys(current: readonly (Answer | undefined)[], yes: readonly number[], no: readonly number[]): number {
  let raw = 0
  for (const n of yes) if (current[n] === 'yes') raw++
  for (const n of no) if (current[n] === 'no') raw++
  return raw
}

/** T-балл базовой шкалы; сырой балл K входит с коэффициентом kFactor. */
export function mainT(scale: MainScale, raw: number, rawK: number): number {
  return round2(50 + (10 * (raw + scale.kFactor * rawK - scale.mean)) / scale.sd)
}

/** T-балл дополнительной шкалы. */
export function extraT(scale: ExtraScale, raw: number): number {
  return round2(50 + (10 * (raw - scale.mean)) / scale.sd)
}

export function scoreAnswers(answers: Answers): Score {
  const current = currentAnswers(answers)
  let answered = 0
  let unknown = 0
  for (let n = 1; n <= TOTAL_QUESTIONS; n++) {
    const answer = current[n]
    if (answer !== undefined) answered++
    if (answer === 'unknown') unknown++
  }

  const rawK = (() => {
    const kScale = MAIN_SCALES.find((scale) => scale.id === 'K')
    return kScale ? countKeys(current, kScale.yes, kScale.no) : 0
  })()

  const main = MAIN_SCALES.map((scale) => {
    const raw = countKeys(current, scale.yes, scale.no)
    return { scale, raw, t: mainT(scale, raw, rawK) }
  })

  const extra = EXTRA_SCALES.map((scale) => {
    const raw = countKeys(current, scale.yes, scale.no)
    return { scale, raw, t: extraT(scale, raw) }
  })

  return { answered, unknown, rawK, main, extra }
}

export function isOutOfRange(t: number): boolean {
  return t < 30 || t > 70
}

export interface MainScaleDelta {
  readonly id: MainScaleId
  readonly title: string
  readonly delta: number
}

/** Какие базовые шкалы изменились после последнего ответа (для подсветки). */
export function affectedMainScales(previous: Score, next: Score): readonly MainScaleDelta[] {
  const result: MainScaleDelta[] = []
  for (const [index, score] of next.main.entries()) {
    const before = previous.main[index]?.raw ?? score.raw
    const delta = score.raw - before
    if (delta !== 0) result.push({ id: score.scale.id, title: score.scale.title, delta })
  }
  return result
}
