'use client'

import { useCallback, useState } from 'react'
import { CanvasHost, type SketchFactory } from '@/shared/ui/CanvasHost/CanvasHost'
import { createSketch } from './sketch'
import styles from './index.module.css'

export default function Project() {
  const [name, setName] = useState('Lorenz Attractor')

  const create = useCallback<SketchFactory>((canvas, host) => {
    return createSketch(canvas, host, setName)
  }, [])

  return (
    <div className={styles.root}>
      <CanvasHost create={create} />
      <div className={styles.label} aria-live="polite">
        <p className={styles.title}>{name}</p>
        <p className={styles.hint}>← → / A D — switch · C — camera · LMB rotate · RMB pan · wheel zoom</p>
      </div>
    </div>
  )
}
