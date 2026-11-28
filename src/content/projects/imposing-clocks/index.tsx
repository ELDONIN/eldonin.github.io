'use client'

import { useEffect, useRef } from 'react'
import { mountClockGallery } from './clock'
import './clock.css'

const BASE = '/projects/imposing-clocks'

function loadStylesheet(href: string): void {
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.append(link)
}

function loadLeaflet(): Promise<void> {
  return new Promise((resolve) => {
    const host = window as unknown as { L?: unknown }
    if (host.L) {
      resolve()
      return
    }

    loadStylesheet(`${BASE}/leaflet/leaflet.css`)
    const script = document.createElement('script')
    script.src = `${BASE}/leaflet/leaflet.js`
    script.onload = () => {
      resolve()
    }
    script.onerror = () => {
      console.error(`Не удалось загрузить Leaflet: ${script.src}`)
      resolve()
    }
    document.head.append(script)
  })
}

export default function Project() {
  const rootRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const title = titleRef.current
    const hint = hintRef.current
    if (!root || !title || !hint) return

    let destroy: (() => void) | undefined
    let cancelled = false

    void loadLeaflet().then(() => {
      if (!cancelled) destroy = mountClockGallery(root, title, hint)
    })

    return () => {
      cancelled = true
      destroy?.()
    }
  }, [])

  return (
    <div className="clock-root">
      <main className="stage">
        <section className="clock-view" ref={rootRef} aria-live="polite" />
      </main>
      <aside className="clock-caption" aria-live="polite">
        <h2 className="clock-caption-title" ref={titleRef}>
          24 Hour Clock
        </h2>
        <p className="clock-caption-hint" ref={hintRef} />
      </aside>
    </div>
  )
}

