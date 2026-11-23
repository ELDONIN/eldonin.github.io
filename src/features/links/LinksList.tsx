import type { LinkEntry } from './model'
import styles from './LinksList.module.css'

export function LinksList({ links }: { links: readonly LinkEntry[] }) {
  return (
    <ul className={styles.list}>
      {links.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.item}
          >
            <span className={styles.title}>{link.title}</span>
            <span className={styles.desc}>{link.description}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
