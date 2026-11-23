'use client'

import { useCallback, useRef, useState } from 'react'
import { CanvasHost, type SketchFactory } from '@/shared/ui/CanvasHost/CanvasHost'
import { createSketch } from './sketch'
import styles from './index.module.css'

export default function Project() {
  const [helpOpen, setHelpOpen] = useState(false)
  const helpOpenRef = useRef(false)
  helpOpenRef.current = helpOpen

  const create = useCallback<SketchFactory>((canvas, host) => {
    return createSketch(canvas, host, {
      onHelpChange: setHelpOpen,
      isHelpOpen: () => helpOpenRef.current,
    })
  }, [])

  return (
    <div className={styles.root}>
      <CanvasHost create={create} />
      <button
        type="button"
        className={styles.helpHint}
        onClick={() => {
          setHelpOpen(true)
        }}
        lang="en"
      >
        Press &quot;H&quot; for help
      </button>
      {helpOpen && (
        <div
          className={styles.helpOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Controls"
          onClick={(event) => {
            if (event.target === event.currentTarget) setHelpOpen(false)
          }}
        >
          <div className={styles.helpWindow} lang="en">
            <dl>
              <dt>Left mouse drag</dt>
              <dd>Rotate the torus (pan in flat view)</dd>
              <dt>Right mouse drag</dt>
              <dd>Draw living cells</dd>
              <dt>Middle mouse drag</dt>
              <dd>Pan the view</dd>
              <dt>Mouse wheel</dt>
              <dd>Zoom in / out</dd>
              <dt>R</dt>
              <dd>Reset view (rotation, pan, zoom)</dd>
              <dt>G</dt>
              <dd>Pause / resume the simulation</dd>
              <dt>S</dt>
              <dd>Toggle auto-rotation</dd>
              <dt>D</dt>
              <dd>Switch torus / flat view</dd>
              <dt>H</dt>
              <dd>Show / hide this help</dd>
              <dt>F5</dt>
              <dd>Restart</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
