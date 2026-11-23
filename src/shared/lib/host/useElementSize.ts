'use client'

import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

export interface ElementSize {
  width: number
  height: number
}

/** Отслеживает CSS-размер элемента через ResizeObserver (раздел 17). */
export function useElementSize(ref: RefObject<HTMLElement | null>): ElementSize {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.contentRect
        setSize({ width: rect.width, height: rect.height })
      }
    })
    observer.observe(el)

    const rect = el.getBoundingClientRect()
    setSize({ width: rect.width, height: rect.height })

    return () => {
      observer.disconnect()
    }
  }, [ref])

  return size
}
