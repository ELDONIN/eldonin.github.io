'use client'

import { useEffect, useRef } from 'react'
import { computeBufferSize } from '@/shared/lib/host/size'
import { useActive } from '@/shared/lib/host/useActive'
import { useElementSize } from '@/shared/lib/host/useElementSize'
import styles from './CanvasHost.module.css'

export interface HostSize {
  width: number
  height: number
  dpr: number
}

export interface HostControls {
  readonly reducedMotion: boolean
  requestFrame(): void
}

export interface Sketch {
  resize(size: HostSize): void
  frame(time: number, delta: number): void
  dispose(): void
}

export type SketchFactory = (canvas: HTMLCanvasElement, host: HostControls) => Sketch

/** Создаёт <canvas> на всю область, следит за размером и крутит rAF (раздел 17). */
export function CanvasHost({ create }: { create: SketchFactory }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { width, height } = useElementSize(containerRef)
  const active = useActive(containerRef)
  const sketchRef = useRef<Sketch | null>(null)
  const reducedMotionRef = useRef(false)

  // Создание/уничтожение sketch.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const controls: HostControls = {
      get reducedMotion() {
        return reducedMotionRef.current
      },
      requestFrame() {
        if (reducedMotionRef.current) sketchRef.current?.frame(performance.now(), 0)
      },
    }

    const sketch = create(canvas, controls)
    sketchRef.current = sketch

    return () => {
      sketchRef.current = null
      sketch.dispose()
    }
  }, [create])

  // Размер буфера + resize (до первого кадра и при каждом изменении размера).
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const size = computeBufferSize(width, height, window.devicePixelRatio || 1)
    canvas.width = size.width
    canvas.height = size.height
    const sketch = sketchRef.current
    if (sketch) {
      sketch.resize({ width, height, dpr: size.dpr })
      if (reducedMotionRef.current) sketch.frame(performance.now(), 0)
    }
  }, [width, height])

  // rAF-цикл, пока active и нет prefers-reduced-motion.
  useEffect(() => {
    const sketch = sketchRef.current
    if (!active || !sketch || reducedMotionRef.current) return

    let rafId = 0
    let last = performance.now()
    let first = true
    const tick = (time: number) => {
      const delta = first ? 0 : time - last
      first = false
      last = time
      sketch.frame(time, delta)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [active])

  return (
    <div ref={containerRef} className={styles.host}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
