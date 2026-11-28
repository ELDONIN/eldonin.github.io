import Link from 'next/link'
import type { EntryMeta } from '@/features/collection/model'
import { entryHref } from './lib/collection'
import styles from './CollectionList.module.css'

interface CollectionListProps {
  entries: readonly EntryMeta[]
  basePath: string
  selectedSlug: string | null
  allTags: readonly string[]
  selectedTags: readonly string[]
  /** Передаётся только в интерактивной версии; в fallback теги не кликабельны. */
  onTagToggle?: (tag: string) => void
}

export function CollectionList({
  entries,
  basePath,
  selectedSlug,
  allTags,
  selectedTags,
  onTagToggle,
}: CollectionListProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.tags}>
        {allTags.map((tag) => {
          const active = selectedTags.includes(tag)
          if (onTagToggle) {
            return (
              <button
                key={tag}
                type="button"
                className={styles.tag}
                data-active={active ? 'true' : undefined}
                aria-pressed={active}
                onClick={() => {
                  onTagToggle(tag)
                }}
              >
                {tag}
              </button>
            )
          }
          return (
            <span key={tag} className={styles.tag} data-active={active ? 'true' : undefined}>
              {tag}
            </span>
          )
        })}
      </div>
      {entries.length === 0 ? (
        <p className={styles.empty} lang="en">
          No matches
        </p>
      ) : (
        <ul className={styles.list}>
          {entries.map((entry) => {
            const selected = entry.slug === selectedSlug
            return (
              <li key={entry.slug}>
                <Link
                  href={entryHref(basePath, entry.slug, selectedTags)}
                  className={styles.item}
                  data-selected={selected ? 'true' : undefined}
                >
                  <span className={styles.title}>{entry.title}</span>
                  <span className={styles.desc}>{entry.description}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
