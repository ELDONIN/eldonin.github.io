'use client'

import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

/** Блок виден, вкладка активна и нет prefers-reduced-motion (раздел 17). */
export function useActive(ref: RefObject<HTMLElement | null>): boolean {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setActive(false)
      return
    }

    let inView = false
    let tabVisible = !document.hidden

    const update = () => {
      setActive(inView && tabVisible)
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        inView = entry.isIntersecting
        update()
      }
    })
    observer.observe(el)

    const onVisibility = () => {
      tabVisible = !document.hidden
      update()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [ref])

  return active
}
