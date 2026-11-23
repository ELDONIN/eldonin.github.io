'use client'

import styles from './global-error.module.css'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ru">
      <body className={styles.body}>
        <div className={styles.content}>
          <p lang="en">Something went wrong</p>
          <button lang="en" type="button" onClick={reset} className={styles.button}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
