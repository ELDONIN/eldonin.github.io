'use client'

import { useState } from 'react'
import type { MainScaleId } from '../data/mainScales'
import { filterAndSortExtra, type ExtraSort } from '../lib/extraScales'
import type { MainScaleDelta, Score } from '../lib/score'
import { isOutOfRange } from '../lib/score'
import styles from '../index.module.css'
import { Memo } from './Memo'
import { ProfileChart } from './ProfileChart'
import type { ScaleRef } from './types'

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

interface ResultsPaneProps {
  readonly score: Score
  readonly lastAffected: readonly MainScaleDelta[]
  readonly onOpenScale: (scale: ScaleRef) => void
}

export function ResultsPane({ score, lastAffected, onOpenScale }: ResultsPaneProps) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<ExtraSort>('n')
  const [onlyOutOfRange, setOnlyOutOfRange] = useState(false)
  const extra = filterAndSortExtra(score.extra, { query, sort, onlyOutOfRange })
  const deltas = new Map<MainScaleId, number>(
    lastAffected.map((item) => [item.id, item.delta]),
  )

  return (
    <div className={styles.pane} role="tabpanel" id="panel-results" aria-labelledby="tab-results">
      <div className={styles.paneInner}>
        <div className={styles.profileGrid}>
          <section className={styles.card} aria-labelledby="smil-profile-title">
            <h3 className={styles.cardTitle} id="smil-profile-title">
              Профиль
            </h3>
            <ProfileChart scores={score.main} />
            <p className={styles.hint}>
              Слева — шкалы достоверности L, F, K, справа — основные шкалы 1–0. Норма — 30–70
              T.
            </p>
          </section>

          <section className={styles.card} aria-labelledby="smil-scores-title">
            <h3 className={styles.cardTitle} id="smil-scores-title">
              Баллы
            </h3>
            <div className={styles.tableWrap}>
              <table className={styles.scoresTable}>
                <caption className={styles.visuallyHidden}>
                  T-баллы и сырые баллы базовых шкал
                </caption>
                <thead>
                  <tr>
                    <th scope="col">T-баллы</th>
                    <th scope="col">Сырые</th>
                    <th scope="col">Шкалы</th>
                  </tr>
                </thead>
                <tbody>
                  {score.main.map(({ scale, raw, t }) => {
                    const delta = deltas.get(scale.id)
                    return (
                      <tr key={scale.id}>
                        <td>{formatScore(t)}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.rawButton}
                            aria-label={`Вопросы шкалы ${scale.title}`}
                            onClick={() => {
                              onOpenScale({ kind: 'main', scale })
                            }}
                          >
                            {String(raw)}
                          </button>
                        </td>
                        <td
                          className={
                            delta === undefined
                              ? undefined
                              : delta > 0
                                ? styles.deltaDanger
                                : styles.deltaSuccess
                          }
                        >
                          {scale.title}
                        </td>
                      </tr>
                    )
                  })}
                  <tr>
                    <td />
                    <td>{String(score.unknown)}</td>
                    <td>?: Ответ «Не знаю»</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.hint}>
              Нажмите на сырой балл, чтобы увидеть вопросы шкалы. Красным подсвечены шкалы,
              которым последний ответ добавил балл, зелёным — убавил.
            </p>
          </section>
        </div>

        <Memo />

        <section className={styles.card} aria-labelledby="smil-extra-title">
          <h3 className={styles.cardTitle} id="smil-extra-title">
            Дополнительные шкалы
          </h3>
          <div className={styles.extraTools}>
            <input
              className={styles.toolInput}
              type="search"
              placeholder="Поиск по названию шкалы"
              aria-label="Поиск по названию шкалы"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
              }}
            />
            <label className={styles.toolLabel}>
              Сортировка
              <select
                className={styles.toolInput}
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as ExtraSort)
                }}
              >
                <option value="n">по номеру</option>
                <option value="dev">по отклонению от 50</option>
                <option value="t_desc">по T-баллу ↓</option>
                <option value="t_asc">по T-баллу ↑</option>
                <option value="raw">по сырым баллам ↓</option>
              </select>
            </label>
            <label className={styles.toolLabel}>
              <input
                type="checkbox"
                checked={onlyOutOfRange}
                onChange={(event) => {
                  setOnlyOutOfRange(event.target.checked)
                }}
              />
              только вне нормы (T &lt; 30 или T &gt; 70)
            </label>
            <span className={styles.hint}>
              Показано {String(extra.shown)} из {String(extra.total)} · вне нормы:{' '}
              {String(extra.outside)}
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.extraTable}>
              <caption className={styles.visuallyHidden}>
                Дополнительные шкалы: название, T-балл и сырой балл
              </caption>
              <thead>
                <tr>
                  <th scope="col">Название шкалы</th>
                  <th scope="col">T-баллы</th>
                  <th scope="col">Сырые баллы</th>
                </tr>
              </thead>
              <tbody>
                {extra.items.map(({ scale, raw, t }) => {
                  const out = isOutOfRange(t)
                  return (
                    <tr key={scale.index}>
                      <td>{scale.title}</td>
                      <td className={out ? styles.outOfRange : undefined}>{formatScore(t)}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.rawButton}
                          aria-label={`Вопросы шкалы ${scale.title}`}
                          onClick={() => {
                            onOpenScale({ kind: 'extra', scale })
                          }}
                        >
                          {String(raw)}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

