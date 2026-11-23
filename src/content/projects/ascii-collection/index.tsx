'use client'

import { useEffect, useRef } from 'react'
import { mountAsciiCollection } from './main'

const BASE = '/projects/ascii-collection'

function loadStylesheet(href: string): Promise<void> {
  const existing = document.querySelector(`link[rel="stylesheet"][href="${href}"]`)
  if (existing) return Promise.resolve()

  return new Promise((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => {
      resolve()
    }
    link.onerror = () => {
      resolve()
    }
    document.head.append(link)
  })
}

function loadFont(): Promise<void> {
  // Пиксельный шрифт 8x16 определяет размер знакоместа; пока он не загружен,
  // первый расчёт сетки идёт по fallback-шрифту и терминал рендерится неправильно.
  return Promise.race([
    document.fonts
      .load('16px "IBM VGA 8x16"')
      .then(() => undefined)
      .catch(() => undefined),
    new Promise<void>((resolve) => {
      setTimeout(resolve, 2500)
    }),
  ])
}

export default function Project() {
  const rootRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const terminal = terminalRef.current
    if (!root || !terminal) return

    let destroy: (() => void) | undefined
    let cancelled = false

    async function boot(): Promise<void> {
      await loadStylesheet(`${BASE}/ascii.css`)
      await loadFont()
      if (!cancelled) destroy = mountAsciiCollection(root, terminal)
    }

    void boot()

    return () => {
      cancelled = true
      destroy?.()
    }
  }, [])

  return (
    <div className="ascii-root" ref={rootRef}>
      <main className="terminal-shell">
        <pre className="terminal" ref={terminalRef} aria-live="polite" />
      </main>
    </div>
  )
}

