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
  'M1075 2545 c-355 -66 -663 -270 -862 -573 -283 -431 -281 -991 5 -1391 221 -308 534 -510 877 -567 117 -19 309 -15 420 10 309 68 597 258 801 529 252 334 309 760 157 1166 -72 192 -166 334 -321 483 -182 174 -382 282 -622 334 -106 23 -353 28 -455 9 z m-417.7 -463.64 c 63.6 -28.8 286.8 -260.4 408 -421.2 51.6 -69.6 96 -128.4 98.4 -130.8 10.8 -14.4 19.2 20.4 27.6 129.6 10.8 136.8 34.8 184.8 100.8 202.8 58.8 16.8 98.4 4.8 139.2 -42 43.2 -49.2 46.8 -93.6 12 -213.6 -13.2 -45.6 -24 -88.8 -24 -93.6 0 -6 32.4 18 73.2 54 188.4 164.4 417.6 350.4 457.2 370.8 172.8 88.8 315.6 -85.2 175.2 -212.4 -14.4 -14.4 -73.2 -49.2 -129.6 -76.8 -150 -74.4 -290.4 -162 -355.2 -220.8 l -57.6 -51.6 178.8 -6 c 235.2 -7.2 282 -30 282 -134.4 0 -52.8 -46.8 -110.4 -103.2 -126 -28.8 -8.4 -94.8 -6 -216 7.2 -96 10.8 -177.6 15.6 -181.2 12 -8.4 -8.4 4.8 -25.2 188.4 -248.4 188.4 -229.2 218.4 -274.8 225.6 -348 4.8 -57.6 3.6 -62.4 -43.2 -108 -40.8 -40.8 -55.2 -48 -98.4 -48 -43.2 0 -57.6 7.2 -94.8 45.6 -24 25.2 -78 110.4 -121.2 188.4 -122.4 225.6 -240 393.6 -240 345.6 0 -25.2 -50.4 -254.4 -61.2 -280.8 -31.2 -79.2 -150 -91.2 -207.6 -21.6 -43.2 51.6 -40.8 118.8 6 232.8 21.6 50.4 34.8 93.6 31.2 97.2 -3.6 3.6 -112.8 -64.8 -241.2 -153.6 -338.4 -230.4 -373.2 -250.8 -423.6 -256.8 -56.4 -7.2 -96 13.2 -133.2 67.2 -21.6 32.4 -27.6 52.8 -22.8 87.6 10.8 80.4 32.4 97.2 266.4 211.2 230.4 111.6 390 206.4 390 230.4 0 14.4 -70.8 12 -324 -8.4 -81.6 -6 -93.6 -4.8 -130.8 20.4 -100.8 69.6 -66 217.2 58.8 250.8 40.8 10.8 214.8 -3.6 363.6 -30 56.4 -9.6 38.4 22.8 -84 151.2 -85.2 87.6 -154.8 146.4 -253.2 211.2 -139.2 91.2 -170.4 127.2 -170.4 198 0 42 44.4 105.6 87.6 123.6 51.6 22.8 88.8 21.6 146.4 -4.8 z'

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
              <circle cx="1280" cy="1280" r="1200" fill="var(--logo-bg)" suppressHydrationWarning />
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
