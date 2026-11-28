import { TOTAL_QUESTIONS } from '../data/questions'

export type Answer = 'yes' | 'no' | 'unknown'
export type AnswerChain = readonly Answer[]
export type Answers = Readonly<Record<number, AnswerChain>>

/** Как в legacy io.js: цепочка нажатий, последний ответ — текущий. */
export const STORAGE_KEY = 'smil_answers_v1'
export const TAB_KEY = 'smil_tab'

const CODE_TO_ANSWER: Readonly<Record<string, Answer>> = {
  D: 'yes',
  N: 'no',
  Z: 'unknown',
}

const ANSWER_TO_CODE: Readonly<Record<Answer, string>> = {
  yes: 'D',
  no: 'N',
  unknown: 'Z',
}

const ANSWER_TO_WORD: Readonly<Record<Answer, string>> = {
  yes: 'Да',
  no: 'Нет',
  unknown: 'Не знаю',
}

export function currentAnswer(chain: AnswerChain | undefined): Answer | undefined {
  return chain?.at(-1)
}

export function answerToWord(answer: Answer): string {
  return ANSWER_TO_WORD[answer]
}

/** 'DNZ' → ['yes', 'no', 'unknown']; неверные символы отбрасываются. */
export function chainFromCodes(codes: string): AnswerChain {
  const chain: Answer[] = []
  for (const code of codes) {
    const answer = CODE_TO_ANSWER[code]
    if (answer) chain.push(answer)
  }
  return chain
}

export function chainToCodes(chain: AnswerChain): string {
  return chain.map((answer) => ANSWER_TO_CODE[answer]).join('')
}

export function setAnswer(answers: Answers, question: number, answer: Answer): Answers {
  if (!Number.isInteger(question) || question < 1 || question > TOTAL_QUESTIONS) return answers
  const chain = answers[question] ?? []
  if (chain.at(-1) === answer) return answers
  return { ...answers, [question]: [...chain, answer] }
}

export function clearAnswers(): Answers {
  return {}
}

export function answeredCount(answers: Answers): number {
  let count = 0
  for (let n = 1; n <= TOTAL_QUESTIONS; n++) {
    if (currentAnswer(answers[n]) !== undefined) count++
  }
  return count
}

export function unknownCount(answers: Answers): number {
  let count = 0
  for (let n = 1; n <= TOTAL_QUESTIONS; n++) {
    if (currentAnswer(answers[n]) === 'unknown') count++
  }
  return count
}

/** Следующий вопрос без ответа (по кругу), 0 — если таких нет. */
export function nextUnanswered(answers: Answers, from = 0): number {
  const start = Math.min(Math.max(Math.trunc(from), 0), TOTAL_QUESTIONS)
  for (let offset = 1; offset <= TOTAL_QUESTIONS; offset++) {
    const n = ((start + offset - 1) % TOTAL_QUESTIONS) + 1
    if (currentAnswer(answers[n]) === undefined) return n
  }
  return 0
}

const WORD_TO_ANSWER: Readonly<Record<string, Answer>> = {
  да: 'yes',
  нет: 'no',
  'не знаю': 'unknown',
  незнаю: 'unknown',
  не_знаю: 'unknown',
}

export interface ParsedAnswers {
  readonly answers: Answers
  readonly errors: readonly string[]
  readonly count: number
}

/** Разбор экспортированного файла. Формат — как в legacy io.js. */
export function parseAnswersFile(text: string): ParsedAnswers {
  const answers: Record<number, AnswerChain> = {}
  const errors: string[] = []
  let count = 0

  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  for (const [index, raw] of lines.entries()) {
    const line = raw.replace(/#.*/, '').trim()
    if (!line) continue
    const match = /^(\d+)\s*[:=]\s*(.+)$/.exec(line)
    if (!match) {
      errors.push(`строка ${String(index + 1)}: «${raw.trim()}»`)
      continue
    }
    const question = Number(match[1])
    const chain: Answer[] = []
    let valid = question >= 1 && question <= TOTAL_QUESTIONS
    for (const word of (match[2] ?? '').split(/\s*[>,;]\s*/)) {
      const answer = WORD_TO_ANSWER[word.trim().toLowerCase().replace(/\s+/g, ' ')]
      if (answer) chain.push(answer)
      else valid = false
    }
    if (!valid || chain.length === 0) {
      errors.push(`строка ${String(index + 1)}: «${raw.trim()}»`)
      continue
    }
    if (answers[question] === undefined) count++
    answers[question] = chain
  }

  return { answers, errors, count }
}

export function mergeAnswers(base: Answers, patch: Answers): Answers {
  return { ...base, ...patch }
}

/** Текст файла экспорта; null — если ответов нет. */
export function serializeAnswers(answers: Answers): string | null {
  const lines = [
    '# СМИЛ: ответы',
    '# формат: <номер вопроса>: <ответ>[ > <следующий ответ> ...]  (Да / Нет / Не знаю)',
  ]
  let count = 0
  for (let n = 1; n <= TOTAL_QUESTIONS; n++) {
    const chain = answers[n]
    if (!chain || chain.length === 0) continue
    lines.push(`${String(n)}: ${chain.map(answerToWord).join(' > ')}`)
    count++
  }
  if (count === 0) return null
  return `${lines.join('\r\n')}\r\n`
}

export function exportFileName(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return [
    'smil_answers_',
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '_',
    pad(date.getHours()),
    pad(date.getMinutes()),
    '.txt',
  ].join('')
}

// ---------- localStorage ----------

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null
  }
}

export function loadAnswers(): Answers {
  const store = storage()
  if (!store) return {}
  try {
    const raw = store.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const answers: Record<number, AnswerChain> = {}
    for (const [key, value] of Object.entries(parsed)) {
      const question = Number(key)
      if (!Number.isInteger(question) || question < 1 || question > TOTAL_QUESTIONS) continue
      if (typeof value !== 'string' || !/^[DNZ]+$/.test(value)) continue
      answers[question] = chainFromCodes(value)
    }
    return answers
  } catch {
    return {}
  }
}

export function saveAnswers(answers: Answers): void {
  const store = storage()
  if (!store) return
  try {
    const data: Record<string, string> = {}
    for (let n = 1; n <= TOTAL_QUESTIONS; n++) {
      const chain = answers[n]
      if (chain && chain.length > 0) data[n] = chainToCodes(chain)
    }
    store.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* хранилище недоступно — молча продолжаем */
  }
}

export type Tab = 'questions' | 'results' | 'reg'

export function loadTab(): Tab {
  try {
    const value = storage()?.getItem(TAB_KEY)
    return value === 'results' || value === 'reg' ? value : 'questions'
  } catch {
    return 'questions'
  }
}

export function saveTab(tab: Tab): void {
  try {
    storage()?.setItem(TAB_KEY, tab)
  } catch {
    /* ignore */
  }
}
