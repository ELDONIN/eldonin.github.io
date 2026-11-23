'use client'

import styles from './error.module.css'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={styles.wrap}>
      <p lang="en">Something went wrong</p>
      <button lang="en" type="button" onClick={reset} className={styles.button}>
        Try again
      </button>
    </div>
  )
}
