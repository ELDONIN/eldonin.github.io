'use client'

import { Suspense, type ReactNode } from 'react'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import type { EntryMeta } from '@/features/collection/model'
import { Footer } from '@/shared/ui/Footer/Footer'
import { BackLink } from './BackLink'
import { CollectionList } from './CollectionList'
import { FilteredCollection } from './FilteredCollection'
import { collectTags } from './lib/collection'
import styles from './SplitLayout.module.css'

interface SplitLayoutProps {
  entries: readonly EntryMeta[]
  basePath: string
  children: ReactNode
  /** Playground — правая область «как приложение» (фиксированная высота). */
  app?: boolean
}

export function SplitLayout({ entries, basePath, children, app = false }: SplitLayoutProps) {
  const segment = useSelectedLayoutSegment()
  const selectedSlug = segment ?? null
  const hasSelection = segment !== null
  const allTags = collectTags(entries)

  return (
    <div className={styles.root} data-has-selection={hasSelection ? 'true' : 'false'}>
      <aside className={styles.aside}>
        <Suspense
          fallback={
            <CollectionList
              entries={entries}
              basePath={basePath}
              selectedSlug={selectedSlug}
              allTags={allTags}
              selectedTags={[]}
            />
          }
        >
          <FilteredCollection entries={entries} basePath={basePath} selectedSlug={selectedSlug} />
        </Suspense>
        <Footer />
      </aside>
      <section className={app ? `${styles.detail ?? ''} ${styles.detailApp ?? ''}` : styles.detail}>
        <Suspense
          fallback={
            <Link href={`${basePath}/`} className={styles.back} lang="en">
              ← Back
            </Link>
          }
        >
          <BackLink basePath={basePath} className={styles.back} />
        </Suspense>
        {children}
      </section>
    </div>
  )
}
