'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TOTAL_QUESTIONS } from './data/questions'
import {
  answeredCount,
  clearAnswers,
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
  type Answer,
  type Answers,
  type ParsedAnswers,
  type Tab,
} from './lib/answers'
import { affectedMainScales, scoreAnswers, type MainScaleDelta } from './lib/score'
import styles from './index.module.css'
import { QuestionsPane } from './ui/QuestionsPane'
import { RegistrationSheet } from './ui/RegistrationSheet'
import { ResultsPane } from './ui/ResultsPane'
import { ScaleQuestionsDialog } from './ui/ScaleQuestionsDialog'
import type { ScaleRef } from './ui/types'

const TABS: readonly { readonly id: Tab; readonly label: string }[] = [
  { id: 'questions', label: 'Вопросы' },
  { id: 'results', label: 'Результаты' },
  { id: 'reg', label: 'Регистрационный лист' },
]

function cx(...classes: readonly (string | false | undefined)[]): string {
  return classes.filter((value): value is string => Boolean(value)).join(' ')
}

function importStatus(parsed: ParsedAnswers): string {
  let message = `Загружено ответов: ${String(parsed.count)}.`
  if (parsed.errors.length > 0) {
    message += ` Пропущено строк с ошибками: ${String(parsed.errors.length)}.`
    const preview = parsed.errors.slice(0, 3).join(' ')
    message += ` ${preview}${parsed.errors.length > 3 ? ' …' : ''}`
  }
  return message
}

export default function Project() {
  const [answers, setAnswers] = useState<Answers>({})
  const [tab, setTab] = useState<Tab>('questions')
  const [onlyUnanswered, setOnlyUnanswered] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState(1)
  const [scrollRequest, setScrollRequest] = useState(0)
  const [dialog, setDialog] = useState<ScaleRef | null>(null)
  const [status, setStatus] = useState('')
  const [lastAffected, setLastAffected] = useState<readonly MainScaleDelta[]>([])
  const [ready, setReady] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const score = useMemo(() => scoreAnswers(answers), [answers])
  const answersRef = useRef(answers)

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    const stored = loadAnswers()
    answersRef.current = stored
    setAnswers(stored)
    setTab(loadTab())
    setActiveQuestion(nextUnanswered(stored, 0) || 1)
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) saveAnswers(answers)
  }, [answers, ready])

  useEffect(() => {
    if (ready) saveTab(tab)
  }, [tab, ready])

  const answerQuestion = useCallback((question: number, answer: Answer) => {
    if (!Number.isInteger(question) || question < 1 || question > TOTAL_QUESTIONS) return
    const current = answersRef.current
    const previous = currentAnswer(current[question])
    if (previous === answer) return
    const next = setAnswer(current, question, answer)
    answersRef.current = next
    const nextScore = scoreAnswers(next)
    setAnswers(next)
    setLastAffected(affectedMainScales(scoreAnswers(current), nextScore))
    setActiveQuestion(question)
  }, [])

  const activateQuestion = useCallback((question: number) => {
    setActiveQuestion(question)
  }, [])

  const goToQuestion = useCallback(
    (value: number) => {
      if (!Number.isInteger(value) || value < 1) return
      const question = Math.min(value, TOTAL_QUESTIONS)
      if (onlyUnanswered && currentAnswer(answers[question]) !== undefined) setOnlyUnanswered(false)
      setTab('questions')
      setActiveQuestion(question)
      setScrollRequest((current) => current + 1)
    },
    [answers, onlyUnanswered],
  )

  const firstUnanswered = useCallback(() => {
    const question = nextUnanswered(answers, 0)
    if (question !== 0) goToQuestion(question)
  }, [answers, goToQuestion])

  const resetTest = useCallback(() => {
    if (
      answeredCount(answers) > 0 &&
      !window.confirm('Все ответы будут удалены. Начать новый тест?')
    ) {
      return
    }
    setAnswers(clearAnswers())
    answersRef.current = {}
    setLastAffected([])
    setStatus('Все ответы удалены.')
    setTab('questions')
    setActiveQuestion(1)
    setScrollRequest((current) => current + 1)
  }, [answers])

  const exportAnswers = useCallback(() => {
    const text = serializeAnswers(answers)
    if (!text) {
      setStatus('Нет ответов для экспорта.')
      return
    }
    const blob = new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = exportFileName()
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 500)
    setStatus(`Сохранено ответов: ${String(answeredCount(answers))}.`)
  }, [answers])

  const importAnswers = useCallback(async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = parseAnswersFile(text)
      if (parsed.count === 0 && parsed.errors.length === 0) {
        setStatus('В файле не найдено ответов.')
        return
      }
      const next = mergeAnswers(answers, parsed.answers)
      answersRef.current = next
      setAnswers(next)
      setLastAffected(affectedMainScales(score, scoreAnswers(next)))
      setStatus(importStatus(parsed))
      const candidate = nextUnanswered(next, 0)
      if (candidate !== 0) setActiveQuestion(candidate)
      setScrollRequest((current) => current + 1)
    } catch {
      setStatus('Не удалось прочитать файл.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [answers, score])

  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <div className={styles.topRow}>
          <h2 className={styles.title}>Тест СМИЛ</h2>
          <div
            className={styles.progress}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={TOTAL_QUESTIONS}
            aria-valuenow={score.answered}
            aria-label={`Отвечено ${String(score.answered)} из ${String(TOTAL_QUESTIONS)}`}
          >
            <div className={styles.progressBar}>
              <i
                className={styles.progressFill}
                style={{ width: `${String((score.answered * 100) / TOTAL_QUESTIONS)}%` }}
              />
            </div>
            <span className={styles.progressText}>
              Отвечено: {String(score.answered)} из {String(TOTAL_QUESTIONS)}
              {score.answered === TOTAL_QUESTIONS ? ' ✓' : ''}
            </span>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={resetTest}>
              Новый
            </button>
            <button type="button" className={styles.button} onClick={exportAnswers}>
              Экспорт
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                fileRef.current?.click()
              }}
            >
              Импорт
            </button>
          </div>
        </div>

        <nav
          className={styles.tabs}
          role="tablist"
          aria-label="Разделы теста"
          onKeyDown={(event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
            event.preventDefault()
            const index = TABS.findIndex((item) => item.id === tab)
            const step = event.key === 'ArrowRight' ? 1 : -1
            const next = TABS[(index + step + TABS.length) % TABS.length]
            if (next) {
              setTab(next.id)
              document.getElementById(`tab-${next.id}`)?.focus()
            }
          }}
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              className={cx(styles.tab, tab === item.id && styles.tabActive)}
              onClick={() => {
                setTab(item.id)
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {status !== '' && (
          <p className={styles.status} role="status" aria-live="polite">
            {status}
          </p>
        )}
      </header>

      <div className={styles.content}>
        {tab === 'questions' && (
          <QuestionsPane
            answers={answers}
            activeQuestion={activeQuestion}
            scrollRequest={scrollRequest}
            onlyUnanswered={onlyUnanswered}
            answered={score.answered}
            lastAffected={lastAffected}
            onAnswer={answerQuestion}
            onActivate={activateQuestion}
            onToggleOnlyUnanswered={setOnlyUnanswered}
            onGoTo={goToQuestion}
            onFirstUnanswered={firstUnanswered}
          />
        )}
        {tab === 'results' && (
          <ResultsPane
            score={score}
            lastAffected={lastAffected}
            onOpenScale={(scale) => {
              setDialog(scale)
            }}
          />
        )}
        {tab === 'reg' && (
          <RegistrationSheet
            answers={answers}
            onGoToQuestion={goToQuestion}
            onFirstUnanswered={firstUnanswered}
          />
        )}
      </div>

      <input
        ref={fileRef}
        className={styles.fileInput}
        type="file"
        accept=".txt,text/plain"
        onChange={() => {
          void importAnswers()
        }}
      />

      {dialog !== null && (
        <ScaleQuestionsDialog
          state={dialog}
          answers={answers}
          onClose={() => {
            setDialog(null)
          }}
        />
      )}
    </div>
  )
}
