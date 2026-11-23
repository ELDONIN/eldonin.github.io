'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import styles from './Header.module.css'

const NAV = [
  { href: '/playground/', label: 'Playground', segment: 'playground' },
  { href: '/articles/', label: 'Articles', segment: 'articles' },
  { href: '/links/', label: 'Links', segment: 'links' },
] as const

export function Header() {
  const segment = useSelectedLayoutSegment()

  return (
    <header className={styles.header} lang="en">
      <div className={styles.inner}>
        <Link href="/playground/" className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element -- логотип — статический SVG, оптимизация не нужна */}
          <img src="/logo.svg" alt="" width={24} height={24} className={styles.logo} />
          <span className={styles.name}>Gnozila</span>
        </Link>
        <nav className={styles.nav} aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.link}
              data-active={segment === item.segment ? 'true' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
