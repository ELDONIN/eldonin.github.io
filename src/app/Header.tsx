'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import styles from './Header.module.css'

const NAV = [
  { href: '/playground/', label: 'Playground', segment: 'playground' },
  { href: '/articles/', label: 'Articles', segment: 'articles' },
  { href: '/links/', label: 'Links', segment: 'links' },
] as const

type Theme = 'dark' | 'light'

const LOGO_PATH =
  'M1075 2545 c-355 -66 -663 -270 -862 -573 -283 -431 -281 -991 5 -1391 221 -308 534 -510 877 -567 117 -19 309 -15 420 10 309 68 597 258 801 529 252 334 309 760 157 1166 -72 192 -166 334 -321 483 -182 174 -382 282 -622 334 -106 23 -353 28 -455 9z m-320 -604 c53 -24 239 -217 340 -351 43 -58 80 -107 82 -109 9 -12 16 17 23 108 9 114 29 154 84 169 49 14 82 4 116 -35 36 -41 39 -78 10 -178 -11 -38 -20 -74 -20 -78 0 -5 27 15 61 45 157 137 348 292 381 309 144 74 263 -71 146 -177 -12 -12 -61 -41 -108 -64 -125 -62 -242 -135 -296 -184 l-48 -43 149 -5 c196 -6 235 -25 235 -112 0 -44 -39 -92 -86 -105 -24 -7 -79 -5 -180 6 -80 9 -148 13 -151 10 -7 -7 4 -21 157 -207 157 -191 182 -229 188 -290 4 -48 3 -52 -36 -90 -34 -34 -46 -40 -82 -40 -36 0 -48 6 -79 38 -20 21 -65 92 -101 157 -102 188 -200 328 -200 288 0 -21 -42 -212 -51 -234 -26 -66 -125 -76 -173 -18 -36 43 -34 99 5 194 18 42 29 78 26 81 -3 3 -94 -54 -201 -128 -282 -192 -311 -209 -353 -214 -47 -6 -80 11 -111 56 -18 27 -23 44 -19 73 9 67 27 81 222 176 192 93 325 172 325 192 0 12 -59 10 -270 -7 -68 -5 -78 -4 -109 17 -84 58 -55 181 49 209 34 9 179 -3 303 -25 47 -8 32 19 -70 126 -71 73 -129 122 -211 176 -116 76 -142 106 -142 165 0 35 37 88 73 103 43 19 74 18 122 -4z'

export function Header() {
  const segment = useSelectedLayoutSegment()
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    let saved: string | null = null
    try {
      saved = window.localStorage.getItem('theme')
    } catch {
      /* ignore */
    }
    const initial: Theme = saved === 'light' ? 'light' : 'dark'
    setTheme(initial)
    document.documentElement.dataset.theme = initial
  }, [])

  function toggleTheme(): void {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try {
      window.localStorage.setItem('theme', next)
    } catch {
      /* ignore */
    }
  }

  return (
    <header className={styles.header} lang="en">
      <div className={styles.inner}>
        <Link href="/playground/" className={styles.brand}>
          <svg className={styles.logo} viewBox="0 0 256 256" aria-hidden="true" focusable="false">
            <g transform="translate(0,256) scale(0.1,-0.1)" stroke="none">
              <circle cx="1280" cy="1280" r="1100" fill="var(--logo-bg)" suppressHydrationWarning />
              <path fill="var(--logo-star)" d={LOGO_PATH} suppressHydrationWarning />
            </g>
          </svg>
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
        <button
          type="button"
          className={styles.themeBtn}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? (
            <svg
              className={styles.themeIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              suppressHydrationWarning
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              className={styles.themeIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              suppressHydrationWarning
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
