'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { QUESTIONS, TOTAL_QUESTIONS } from '../data/questions'
import type { Answer, Answers } from '../lib/answers'
import { currentAnswer } from '../lib/answers'
import type { MainScaleDelta } from '../lib/score'
import styles from '../index.module.css'

const OPTIONS: readonly { value: Answer; label: string }[] = [
  { value: 'yes', label: 'Да' },
  { value: 'no', label: 'Нет' },
  { value: 'unknown', label: 'Не знаю' },
]

function cx(...classes: readonly (string | false | undefined)[]): string {
  return classes.filter((value): value is string => Boolean(value)).join(' ')
}

function formatScaleDelta(item: MainScaleDelta): string {
  const sign = item.delta > 0 ? '+' : ''
  return `${item.title} (${sign}${String(item.delta)})`
}

interface RowProps {
  readonly question: number
  readonly text: string
  readonly answer: Answer | undefined
  readonly active: boolean
  readonly onAnswer: (question: number, answer: Answer) => void
  readonly onActivate: (question: number) => void
}

const QuestionRow = memo(function QuestionRow({
  question,
  text,
  answer,
  active,
  onAnswer,
  onActivate,
}: RowProps) {
  return (
    <div
      className={cx(
        styles.questionRow,
        active && styles.questionRowActive,
        answer !== undefined && styles.answered,
      )}
      data-question={String(question)}
    >
      <span className={styles.questionNumber}>{String(question)}</span>
      <button
        type="button"
        className={styles.questionText}
        aria-current={active ? 'true' : undefined}
        onClick={() => {
          onActivate(question)
        }}
      >
        {text}
      </button>
      <div
        className={styles.answers}
        role="group"
        aria-label={`Ответ на вопрос ${String(question)}`}
      >
        {OPTIONS.map((option) => {
          const pressed = answer === option.value
          return (
            <button
              key={option.value}
              type="button"
              className={cx(styles.answerButton, pressed && styles.answerButtonPressed)}
              aria-pressed={pressed}
              onClick={() => {
                onAnswer(question, option.value)
              }}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
})

interface QuestionsPaneProps {
  readonly answers: Answers
  readonly activeQuestion: number
  readonly scrollRequest: number
  readonly onlyUnanswered: boolean
  readonly answered: number
  readonly lastAffected: readonly MainScaleDelta[]
  readonly onAnswer: (question: number, answer: Answer) => void
  readonly onActivate: (question: number) => void
  readonly onToggleOnlyUnanswered: (value: boolean) => void
  readonly onGoTo: (question: number) => void
  readonly onFirstUnanswered: () => void
}

export function QuestionsPane({
  answers,
  activeQuestion,
  scrollRequest,
  onlyUnanswered,
  answered,
  lastAffected,
  onAnswer,
  onActivate,
  onToggleOnlyUnanswered,
  onGoTo,
  onFirstUnanswered,
}: QuestionsPaneProps) {
  const [gotoValue, setGotoValue] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const onAnswerRef = useRef(onAnswer)

  useEffect(() => {
    onAnswerRef.current = onAnswer
  }, [onAnswer])

  const stableAnswer = useCallback((question: number, answer: Answer) => {
    onAnswerRef.current(question, answer)
  }, [])

  useEffect(() => {
    if (scrollRequest === 0) return
    const row = listRef.current?.querySelector<HTMLElement>(
      `[data-question="${String(activeQuestion)}"]`,
    )
    if (!row) return
    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    row.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
  }, [activeQuestion, scrollRequest])

  return (
    <div
      className={styles.pane}
      role="tabpanel"
      id="panel-questions"
      aria-labelledby="tab-questions"
    >
      <div className={styles.paneInner}>
        <div className={styles.tools}>
          <form
            className={styles.gotoForm}
            onSubmit={(event) => {
              event.preventDefault()
              onGoTo(Number(gotoValue))
            }}
          >
            <label className={styles.toolLabel} htmlFor="smil-goto">
              Перейти к №
            </label>
            <input
              id="smil-goto"
              className={styles.toolInput}
              type="number"
              inputMode="numeric"
              min={1}
              max={TOTAL_QUESTIONS}
              value={gotoValue}
              onChange={(event) => {
                setGotoValue(event.target.value)
              }}
            />
            <button type="submit" className={styles.button}>
              Перейти
            </button>
          </form>
          <button type="button" className={styles.button} onClick={onFirstUnanswered}>
            К первому без ответа
          </button>
          <label className={styles.toolLabel}>
            <input
              type="checkbox"
              checked={onlyUnanswered}
              onChange={(event) => {
                onToggleOnlyUnanswered(event.target.checked)
              }}
            />
            только без ответа
          </label>
        </div>

        <p className={styles.hint} aria-live="polite">
          {answered === 0
            ? 'После ответа здесь появятся изменения базовых шкал.'
            : lastAffected.length === 0
              ? 'Последний ответ не изменил базовых шкал.'
              : `Последний ответ изменил шкалы: ${lastAffected
                  .map((item) => formatScaleDelta(item))
                  .join(', ')}`}
        </p>

        <div
          className={styles.questionList}
          ref={listRef}
          data-only-unanswered={onlyUnanswered ? 'true' : undefined}
        >
          {QUESTIONS.map((text, index) => {
            const question = index + 1
            return (
              <QuestionRow
                key={question}
                question={question}
                text={text}
                answer={currentAnswer(answers[question])}
                active={question === activeQuestion}
                onAnswer={stableAnswer}
                onActivate={onActivate}
              />
            )
          })}
        </div>
        {onlyUnanswered && answered === TOTAL_QUESTIONS && (
          <p className={styles.allDone}>
            Все вопросы отвечены. Результаты — на вкладке «Результаты».
          </p>
        )}
      </div>
    </div>
  )
}
