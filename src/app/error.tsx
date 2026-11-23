'use client'

import { Footer } from '@/shared/ui/Footer/Footer'
import styles from './error.module.css'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.content}>
        <p lang="en">Something went wrong</p>
        <button lang="en" type="button" onClick={reset} className={styles.button}>
          Try again
        </button>
      </div>
      <Footer />
    </div>
  )
}
