'use client'

import { TOTAL_QUESTIONS } from '../data/questions'
import { answerToWord, currentAnswer, type Answer, type Answers } from '../lib/answers'
import styles from '../index.module.css'

const MARK: Readonly<Record<Answer, string>> = {
  yes: '↑',
  no: '↓',
  unknown: '?',
}

function cx(...classes: readonly (string | false | undefined)[]): string {
  return classes.filter((value): value is string => Boolean(value)).join(' ')
}

function cellClass(answer: Answer | undefined): string | undefined {
  if (answer === 'yes') return styles.regYes
  if (answer === 'no') return styles.regNo
  if (answer === 'unknown') return styles.regUnknown
  return undefined
}

function chainLabel(chain: readonly Answer[] | undefined): string {
  if (!chain || chain.length === 0) return 'без ответа'
  return chain.map(answerToWord).join(' → ')
}

export function RegistrationSheet({
  answers,
  onGoToQuestion,
  onFirstUnanswered,
}: {
  readonly answers: Answers
  readonly onGoToQuestion: (question: number) => void
  readonly onFirstUnanswered: () => void
}) {
  return (
    <div className={styles.pane} role="tabpanel" id="panel-reg" aria-labelledby="tab-reg">
      <div className={styles.paneInner}>
        <div className={styles.tools}>
          <button type="button" className={styles.button} onClick={onFirstUnanswered}>
            К первому без ответа
          </button>
          <span className={styles.hint}>
            Клик по клетке открывает вопрос. Ответы, изменённые после первого нажатия, отмечены
            точкой.
          </span>
        </div>

        <div className={styles.regGrid} aria-label="Регистрационный лист ответов">
          {Array.from({ length: TOTAL_QUESTIONS }, (_, index) => {
            const question = index + 1
            const chain = answers[question]
            const answer = currentAnswer(chain)
            const changed = (chain?.length ?? 0) > 1
            return (
              <button
                key={question}
                type="button"
                className={cx(styles.regCell, cellClass(answer), changed && styles.regChanged)}
                aria-label={`Вопрос ${String(question)}: ${chainLabel(chain)}`}
                onClick={() => {
                  onGoToQuestion(question)
                }}
              >
                <span className={styles.regNumber}>{String(question)}</span>
                {answer && (
                  <span className={styles.regMark} aria-hidden="true">
                    {MARK[answer]}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <section className={styles.card} aria-labelledby="smil-reg-legend-title">
          <h3 className={styles.cardTitle} id="smil-reg-legend-title">
            Варианты ответов
          </h3>
          <ul className={styles.legend}>
            <li className={styles.legendItem}>
              <span className={cx(styles.legendSwatch, styles.regYes)}>↑</span>
              Выбран ответ «Да»
            </li>
            <li className={styles.legendItem}>
              <span className={cx(styles.legendSwatch, styles.regNo)}>↓</span>
              Выбран ответ «Нет»
            </li>
            <li className={styles.legendItem}>
              <span className={cx(styles.legendSwatch, styles.regUnknown)}>?</span>
              Выбран ответ «Не знаю»
            </li>
            <li className={styles.legendItem}>
              <span
                className={cx(styles.legendSwatch, styles.regYes, styles.regChanged)}
                aria-hidden="true"
              >
                ↑
              </span>
              Ответ менялся после первого нажатия
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
