'use client'

import { useEffect, useRef } from 'react'
import { QUESTIONS } from '../data/questions'
import { answerToWord, currentAnswer, type Answer, type Answers } from '../lib/answers'
import styles from '../index.module.css'
import type { ScaleRef } from './types'

function cx(...classes: readonly (string | false | undefined)[]): string {
  return classes.filter((value): value is string => Boolean(value)).join(' ')
}

function stateClass(answer: Answer | undefined): string | undefined {
  if (answer === 'yes') return styles.dialogStateYes
  if (answer === 'no') return styles.dialogStateNo
  if (answer === 'unknown') return styles.dialogStateUnknown
  return undefined
}

function QuestionColumn({
  title,
  numbers,
  answers,
}: {
  readonly title: string
  readonly numbers: readonly number[]
  readonly answers: Answers
}) {
  return (
    <section className={styles.dialogColumn} aria-label={title}>
      <h3 className={styles.dialogColumnTitle}>
        {title} <span className={styles.hint}>({String(numbers.length)})</span>
      </h3>
      {numbers.length === 0 ? (
        <p className={styles.hint}>Нет вопросов с таким ключом.</p>
      ) : (
        <ul className={styles.dialogList}>
          {numbers.map((question) => {
            const answer = currentAnswer(answers[question])
            return (
              <li key={question} className={styles.dialogItem}>
                <span className={styles.dialogNumber}>{String(question)}</span>
                <span className={styles.dialogText}>{QUESTIONS[question - 1] ?? ''}</span>
                <span className={cx(styles.dialogState, stateClass(answer))}>
                  {answer ? answerToWord(answer) : '—'}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export function ScaleQuestionsDialog({
  state,
  answers,
  onClose,
}: {
  readonly state: ScaleRef
  readonly answers: Answers
  readonly onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const active = document.activeElement
    previousFocus.current = active instanceof HTMLElement ? active : null
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) {
        event.preventDefault()
        return
      }
      const current = document.activeElement
      if (event.shiftKey && (current === first || !panel.contains(current))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (current === last || !panel.contains(current))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocus.current?.focus()
    }
  }, [])

  const { scale } = state
  const chosenYes = scale.yes.reduce(
    (count, question) => (currentAnswer(answers[question]) === 'yes' ? count + 1 : count),
    0,
  )
  const chosenNo = scale.no.reduce(
    (count, question) => (currentAnswer(answers[question]) === 'no' ? count + 1 : count),
    0,
  )

  return (
    <div
      className={styles.dialogOverlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="smil-scale-dialog-title"
      >
        <div className={styles.dialogHead}>
          <h2 className={styles.dialogTitle} id="smil-scale-dialog-title">
            {scale.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className={styles.button}
            onClick={() => {
              onClose()
            }}
          >
            Закрыть
          </button>
        </div>
        <div className={styles.dialogBody}>
          <p className={styles.dialogSummary}>
            Всего вопросов: {String(scale.yes.length + scale.no.length)}. Выбрано «Да»:{' '}
            {String(chosenYes)}. Выбрано «Нет»: {String(chosenNo)}.
          </p>
          <div className={styles.dialogColumns}>
            <QuestionColumn title="Ответ «Да»" numbers={scale.yes} answers={answers} />
            <QuestionColumn title="Ответ «Нет»" numbers={scale.no} answers={answers} />
          </div>
        </div>
      </div>
    </div>
  )
}

