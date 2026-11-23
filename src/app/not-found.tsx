import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/shared/ui/Footer/Footer'
import styles from './not-found.module.css'

export const metadata: Metadata = {
  robots: { index: false },
}

export default function NotFound() {
  return (
    <>
      <div className={styles.content}>
        <h1 lang="en">Page not found</h1>
        <p lang="en">This page does not exist.</p>
        <Link href="/playground/" lang="en" className={styles.link}>
          Go to Playground
        </Link>
      </div>
      <Footer />
    </>
  )
}
