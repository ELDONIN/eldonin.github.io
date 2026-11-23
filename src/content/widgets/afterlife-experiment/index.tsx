'use client'

import { useMemo, useState } from 'react'
import styles from './index.module.css'

interface Chain {
  donors: string[]
  recipients: string[]
  monitors: string[]
}

type Status = 'invalid' | 'valid' | 'active'
type Tab = 'basic' | 'robust' | 'custom'

const PRESETS: Record<Tab, string> = {
  basic:
    'DRM Алексей Матвей Илья\nDRM Матвей Илья Лиза\nDRM Илья Лиза Пётр\nDRM Лиза Пётр Анна\nDRM Пётр Анна Алексей\nDRM Анна Алексей Матвей',
  robust:
    'DRRMM Алексей Матвей Пётр Илья Анна\nDRRMM Матвей Илья Анна Лиза Алексей\nDRRMM Илья Лиза Алексей Пётр Матвей\nDRRMM Лиза Пётр Матвей Анна Илья\nDRRMM Пётр Анна Илья Алексей Лиза\nDRRMM Анна Алексей Лиза Матвей Пётр',
  custom: 'DRM А Б В',
}

const LS_KEY = 'zagrobny_custom'

const STATUS_META: Record<Status, { row: string; badge: string; label: string }> = {
  invalid: { row: 'rowInvalid', badge: 'badgeInvalid', label: 'Невалидна' },
  valid: { row: 'rowValid', badge: 'badgeValid', label: 'Валидна' },
  active: { row: 'rowActive', badge: 'badgeActive', label: 'Активна' },
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'basic', label: 'Базовый' },
  { id: 'robust', label: 'Робастность' },
  { id: 'custom', label: 'Свой' },
]

function normalizeRoles(roles: string): string {
  return roles.toUpperCase().replace(/[ДРМ]/g, (c) => (c === 'Д' ? 'D' : c === 'Р' ? 'R' : 'M'))
}

function cx(...classes: Array<string | undefined>): string {
  return classes.filter((c): c is string => typeof c === 'string').join(' ')
}

function parseInput(text: string): { chains: Chain[]; errors: string[] } {
  const chains: Chain[] = []
  const errors: string[] = []
  text.split('\n').forEach((raw, i) => {
    const line = raw.trim()
    if (!line) return
    const n = i + 1
    const parts = line.split(/\s+/)
    const rawRoles = parts[0] ?? ''
    const names = parts.slice(1)
    if (!rawRoles || names.length === 0) {
      errors.push(`Строка ${String(n)}: недостаточно данных`)
      return
    }
    const roles = normalizeRoles(rawRoles)
    if (!/^[DRM]+$/.test(roles)) {
      errors.push(`Строка ${String(n)}: роли должны состоять из D, R, M`)
      return
    }
    if (!['D', 'R', 'M'].every((r) => roles.includes(r))) {
      errors.push(`Строка ${String(n)}: нужна хотя бы одна роль каждого типа`)
      return
    }
    if (roles.length !== names.length) {
      errors.push(`Строка ${String(n)}: ролей ${String(roles.length)}, имён ${String(names.length)}`)
      return
    }
    const pick = (role: 'D' | 'R' | 'M') => names.filter((_, k) => roles[k] === role)
    chains.push({ donors: pick('D'), recipients: pick('R'), monitors: pick('M') })
  })
  return { chains, errors }
}

function getChainStatus(chain: Chain, eliminated: ReadonlySet<string>): Status {
  const alive = (list: string[]) => list.filter((n) => !eliminated.has(n)).length
  if (alive(chain.recipients) < 1 || alive(chain.monitors) < 1) return 'invalid'
  return chain.donors.some((n) => eliminated.has(n)) ? 'active' : 'valid'
}

function collectParticipants(chains: Chain[]): string[] {
  const set = new Set<string>()
  for (const chain of chains) {
    for (const name of [...chain.donors, ...chain.recipients, ...chain.monitors]) set.add(name)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ru'))
}

function readCustom(): string {
  try {
    return localStorage.getItem(LS_KEY) ?? PRESETS.custom
  } catch {
    return PRESETS.custom
  }
}

export default function Widget() {
  const [tab, setTab] = useState<Tab>('basic')
  const [customText, setCustomText] = useState<string>(() => readCustom())
  const [eliminated, setEliminated] = useState<string[]>([])

  const text = tab === 'custom' ? customText : PRESETS[tab]
  const readonly = tab !== 'custom'

  const { chains, errors } = useMemo(() => parseInput(text), [text])
  const participants = useMemo(() => collectParticipants(chains), [chains])
  const eliminatedSet = useMemo(() => new Set(eliminated), [eliminated])
  const statuses = useMemo(
    () => chains.map((chain) => getChainStatus(chain, eliminatedSet)),
    [chains, eliminatedSet],
  )

  const validCount = statuses.filter((s) => s !== 'invalid').length
  const activeCount = statuses.filter((s) => s === 'active').length

  function switchTab(next: Tab): void {
    setTab(next)
    setEliminated([])
  }

  function handleTextChange(value: string): void {
    setCustomText(value)
    try {
      localStorage.setItem(LS_KEY, value)
    } catch {
      // хранилище недоступно
    }
  }

  function toggleParticipant(name: string): void {
    setEliminated((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    )
  }

  return (
    <div className={styles.widget}>
      <div className={styles.stack}>
        <div className={styles.inputBlock}>
          <div className={styles.tabs} role="tablist" aria-label="Набор цепочек">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={cx(styles.tabBtn, tab === t.id ? styles.tabActive : undefined)}
                onClick={() => {
                  switchTab(t.id)
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className={styles.tabPanel} role="tabpanel">
            <textarea
              className={styles.textarea}
              spellCheck={false}
              aria-label="Цепочки: по одной на строку"
              value={text}
              readOnly={readonly}
              onChange={(e) => {
                handleTextChange(e.target.value)
              }}
            />
          </div>
          <div className={styles.hint}>
            Формат: &lt;роли&gt; &lt;имена&gt; — по одной цепочке на строку
            <br />
            D — донор&nbsp;&nbsp; R — реципиент&nbsp;&nbsp; M — монитор
            <br />
            Пример: <strong>DRRM Иван Анна Мария Пётр</strong>
            <br />
            «Базовый» и «Робастность» — только для чтения; свои цепочки вводите во вкладке «Свой»
          </div>
          {errors.length > 0 && (
            <div role="alert">
              {errors.map((e) => (
                <div key={e} className={styles.error}>
                  ⚠ {e}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.tableWrap}>
          {chains.length === 0 ? (
            <div className={styles.empty}>Введите цепочки выше — таблица появится здесь</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Цепочка</th>
                  <th scope="col">Доноры</th>
                  <th scope="col">Реципиенты</th>
                  <th scope="col">Мониторы</th>
                  <th scope="col">Статус</th>
                </tr>
              </thead>
              <tbody>
                {chains.map((chain, idx) => {
                  const meta = STATUS_META[statuses[idx] ?? 'invalid']
                  return (
                    <tr key={idx} className={styles[meta.row]}>
                      <td className={styles.chainNum}>
                        C<sub>{idx}</sub>
                      </td>
                      <td>{nameTags(chain.donors, eliminatedSet)}</td>
                      <td>{nameTags(chain.recipients, eliminatedSet)}</td>
                      <td>{nameTags(chain.monitors, eliminatedSet)}</td>
                      <td>
                        <span className={cx(styles.badge, styles[meta.badge])}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.controlsRow}>
          <div className={styles.participantsBlock}>
            <div className={styles.participantsLabel}>Участники — нажмите для выбывания</div>
            <div className={styles.participantsGrid}>
              {participants.map((name) => {
                const out = eliminatedSet.has(name)
                return (
                  <button
                    key={name}
                    type="button"
                    className={cx(styles.participant, out ? styles.eliminated : undefined)}
                    aria-pressed={out}
                    onClick={() => {
                      toggleParticipant(name)
                    }}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className={styles.stats} aria-live="polite">
            <Stat label="Участников" value={participants.length} />
            <Stat label="Цепочек" value={chains.length} />
            <Stat label="Валидных" value={validCount} />
            <Stat label="Активных" value={activeCount} />
          </div>
        </div>
      </div>
    </div>
  )
}

function nameTags(names: string[], eliminated: ReadonlySet<string>) {
  return names.map((name) => (
    <span
      key={name}
      className={cx(styles.nameTag, eliminated.has(name) ? styles.nameTagDead : undefined)}
    >
      {name}
    </span>
  ))
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statRow}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  )
}
