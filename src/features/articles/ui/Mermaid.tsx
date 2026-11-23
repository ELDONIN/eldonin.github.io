'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { InView } from '@/shared/ui/InView/InView'
import styles from './Mermaid.module.css'

/** Диаграмма Mermaid: исходник в <pre>, библиотека грузится лениво (раздел 16.7). */
export function Mermaid({ code }: { code: string }) {
  return (
    <InView fallback={<pre className={styles.source}>{code}</pre>}>
      <MermaidDiagram code={code} />
    </InView>
  )
}

function MermaidDiagram({ code }: { code: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const mermaid = (await import('mermaid')).default
        const root = getComputedStyle(document.documentElement)
        const read = (name: string, fallback: string) =>
          root.getPropertyValue(name).trim() || fallback
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: {
            background: read('--bg', '#0e0e11'),
            primaryColor: read('--bg', '#0e0e11'),
            primaryTextColor: read('--fg', '#e6e4e0'),
            primaryBorderColor: read('--border', '#26262b'),
            lineColor: read('--muted', '#94928d'),
            secondaryColor: read('--code-bg', '#15151a'),
            tertiaryColor: read('--bg', '#0e0e11'),
          },
        })
        const { svg } = await mermaid.render(`mermaid-${id}`, code)
        if (!cancelled && ref.current) ref.current.innerHTML = svg
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [code, id])

  if (error) {
    return (
      <div className={styles.error} role="status">
        <pre className={styles.source}>{code}</pre>
        <p className={styles.message}>Mermaid: {error}</p>
      </div>
    )
  }

  return <div ref={ref} className={styles.diagram} />
}
