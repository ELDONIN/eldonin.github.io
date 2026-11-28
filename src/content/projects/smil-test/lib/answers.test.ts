import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  answeredCount,
  chainFromCodes,
  chainToCodes,
  currentAnswer,
  exportFileName,
  loadAnswers,
  loadTab,
  mergeAnswers,
  nextUnanswered,
  parseAnswersFile,
  saveAnswers,
  saveTab,
  serializeAnswers,
  setAnswer,
  STORAGE_KEY,
  unknownCount,
  type Answers,
} from './answers'

function fakeStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => {
      data.clear()
    },
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => {
      data.delete(key)
    },
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ответы СМИЛ', () => {
  it('хранит цепочку нажатий и последний ответ', () => {
    const first = setAnswer({}, 1, 'yes')
    const second = setAnswer(first, 1, 'no')
    expect(chainToCodes(second[1] ?? [])).toBe('DN')
    expect(currentAnswer(second[1])).toBe('no')
    expect(currentAnswer(second[2])).toBeUndefined()
  })

  it('не меняет состояние при повторном том же ответе', () => {
    const state: Answers = { 1: ['yes'] }
    expect(setAnswer(state, 1, 'yes')).toBe(state)
    expect(setAnswer(state, 0, 'yes')).toBe(state)
    expect(setAnswer(state, 567, 'yes')).toBe(state)
  })

  it('считает отвеченные и «Не знаю»', () => {
    const state: Answers = { 1: ['yes'], 2: ['unknown'], 3: ['no', 'unknown'] }
    expect(answeredCount(state)).toBe(3)
    expect(unknownCount(state)).toBe(2)
  })

  it('находит следующий вопрос без ответа по кругу', () => {
    expect(nextUnanswered({})).toBe(1)
    expect(nextUnanswered({}, 566)).toBe(1)
    const state: Record<number, ['yes']> = {}
    for (let n = 1; n <= 566; n++) if (n !== 1 && n !== 566) state[n] = ['yes']
    expect(nextUnanswered(state, 100)).toBe(566)
    expect(nextUnanswered(state, 566)).toBe(1)
    expect(nextUnanswered({ ...state, 1: ['yes'], 566: ['yes'] })).toBe(0)
  })

  it('строит цепочки из кодов', () => {
    expect(chainFromCodes('DNZ')).toEqual(['yes', 'no', 'unknown'])
    expect(chainFromCodes('DxN')).toEqual(['yes', 'no'])
    expect(chainToCodes(['unknown', 'yes'])).toBe('ZD')
  })

  it('сериализует и разбирает экспорт без потерь', () => {
    const state: Answers = { 1: ['yes'], 7: ['yes', 'no'], 9: ['unknown'] }
    const text = serializeAnswers(state)
    expect(text).not.toBeNull()
    if (!text) return
    expect(text).toContain('1: Да')
    expect(text).toContain('7: Да > Нет')
    expect(text).toContain('9: Не знаю')
    const parsed = parseAnswersFile(text)
    expect(parsed.errors).toEqual([])
    expect(parsed.count).toBe(3)
    expect(parsed.answers).toEqual(state)
  })

  it('возвращает null при экспорте пустого набора', () => {
    expect(serializeAnswers({})).toBeNull()
  })

  it('разбирает комментарии, BOM и разные разделители', () => {
    const parsed = parseAnswersFile(
      '\uFEFF# заголовок\r\n1: Да\r\n2 = Нет, Не знаю\r\n3: да;нет\r\n4: Незнаю # комментарий',
    )
    expect(parsed.errors).toEqual([])
    expect(parsed.count).toBe(4)
    expect(chainToCodes(parsed.answers[2] ?? [])).toBe('NZ')
    expect(chainToCodes(parsed.answers[3] ?? [])).toBe('DN')
    expect(chainToCodes(parsed.answers[4] ?? [])).toBe('Z')
  })

  it('сообщает об ошибочных строках и пропускает их', () => {
    const parsed = parseAnswersFile('0: Да\n567: Нет\n2: Может быть\n3: Да')
    expect(parsed.count).toBe(1)
    expect(parsed.errors).toHaveLength(3)
    expect(parsed.answers[3]).toEqual(['yes'])
  })

  it('объединяет ответы при импорте', () => {
    expect(mergeAnswers({ 1: ['yes'] }, { 1: ['no'], 2: ['unknown'] })).toEqual({
      1: ['no'],
      2: ['unknown'],
    })
  })

  it('сохраняет и загружает ответы в localStorage в формате legacy', () => {
    const store = fakeStorage()
    vi.stubGlobal('localStorage', store)
    saveAnswers({ 1: ['yes', 'no'], 2: ['unknown'] })
    expect(store.getItem(STORAGE_KEY)).toBe('{"1":"DN","2":"Z"}')
    expect(loadAnswers()).toEqual({ 1: ['yes', 'no'], 2: ['unknown'] })
  })

  it('игнорирует мусор в localStorage', () => {
    const store = fakeStorage()
    vi.stubGlobal('localStorage', store)
    store.setItem(STORAGE_KEY, '{"1":"DN","999":"D","2":"X","3":5}')
    expect(loadAnswers()).toEqual({ 1: ['yes', 'no'] })
    store.setItem(STORAGE_KEY, 'not json')
    expect(loadAnswers()).toEqual({})
  })

  it('хранит вкладку', () => {
    const store = fakeStorage()
    vi.stubGlobal('localStorage', store)
    expect(loadTab()).toBe('questions')
    saveTab('results')
    expect(loadTab()).toBe('results')
    saveTab('reg')
    expect(loadTab()).toBe('reg')
    saveTab('questions')
    expect(store.getItem('smil_tab')).toBe('questions')
  })

  it('формирует имя файла экспорта как legacy', () => {
    const name = exportFileName(new Date(2026, 10, 28, 9, 5))
    expect(name).toBe('smil_answers_20261128_0905.txt')
  })
})
