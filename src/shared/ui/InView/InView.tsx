'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface InViewProps {
  children: ReactNode
  fallback: ReactNode
  rootMargin?: string
}

/** Монтирует children при первом пересечении с областью видимости (раздел 17). */
export function InView({ children, fallback, rootMargin = '200px' }: InViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [rootMargin])

  return <div ref={ref}>{visible ? children : fallback}</div>
}
