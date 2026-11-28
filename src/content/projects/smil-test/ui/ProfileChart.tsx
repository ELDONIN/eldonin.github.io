import type { MainScore } from '../lib/score'
import styles from '../index.module.css'

const WIDTH = 720
const HEIGHT = 380
const LEFT = 40
const RIGHT = 16
const TOP = 16
const BOTTOM = 40
const Y_MIN = 0
const Y_MAX = 120
const TICKS = Array.from({ length: 13 }, (_, index) => index * 10)

function plotX(index: number): number {
  return LEFT + (index / (12 - 0)) * (WIDTH - LEFT - RIGHT)
}

function plotY(value: number): number {
  const clamped = Math.min(Math.max(value, Y_MIN), Y_MAX)
  return TOP + ((Y_MAX - clamped) / (Y_MAX - Y_MIN)) * (HEIGHT - TOP - BOTTOM)
}

/** Профиль T-баллов вместо Flot: SVG масштабируется без ResizeObserver. */
export function ProfileChart({ scores }: { readonly scores: readonly MainScore[] }) {
  const points = scores.map((score, index) => ({
    x: plotX(index),
    y: plotY(score.t),
    label: score.scale.id,
    t: score.t,
    trust: index < 3,
  }))
  const trustLine = points
    .filter((point) => point.trust)
    .map((point) => `${String(point.x)},${String(point.y)}`)
    .join(' ')
  const mainLine = points
    .filter((point) => !point.trust)
    .map((point) => `${String(point.x)},${String(point.y)}`)
    .join(' ')

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${String(WIDTH)} ${String(HEIGHT)}`}
      role="img"
      aria-label="Профиль T-баллов по базовым шкалам"
    >
      <title>Профиль T-баллов: L, F, K и шкалы 1–0</title>
      <rect
        x={LEFT}
        y={plotY(70)}
        width={WIDTH - LEFT - RIGHT}
        height={plotY(30) - plotY(70)}
        className={styles.chartBand}
      />
      {TICKS.map((tick) => (
        <g key={tick}>
          <line
            x1={LEFT}
            y1={plotY(tick)}
            x2={WIDTH - RIGHT}
            y2={plotY(tick)}
            className={styles.chartGrid}
          />
          <text x={LEFT - 8} y={plotY(tick) + 4} textAnchor="end" className={styles.chartAxisText}>
            {String(tick)}
          </text>
        </g>
      ))}
      <line x1={LEFT} y1={plotY(0)} x2={WIDTH - RIGHT} y2={plotY(0)} className={styles.chartAxis} />
      {points.map((point) => (
        <text
          key={`x-${point.label}`}
          x={point.x}
          y={HEIGHT - BOTTOM + 20}
          textAnchor="middle"
          className={styles.chartAxisText}
        >
          {point.label}
        </text>
      ))}
      <polyline points={trustLine} className={styles.chartTrustLine} />
      <polyline points={mainLine} className={styles.chartMainLine} />
      {points.map((point) => (
        <circle
          key={`point-${point.label}`}
          cx={point.x}
          cy={point.y}
          r={3.5}
          className={point.trust ? styles.chartTrustPoint : styles.chartMainPoint}
        >
          <title>{`${point.label}: ${String(point.t)}`}</title>
        </circle>
      ))}
    </svg>
  )
}
