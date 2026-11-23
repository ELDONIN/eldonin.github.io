import type { ReactNode } from 'react'
import styles from './VisuallyHidden.module.css'

interface VisuallyHiddenProps {
  as?: 'span' | 'h1' | 'h2' | 'p'
  children: ReactNode
}

export function VisuallyHidden({ as: Tag = 'span', children }: VisuallyHiddenProps) {
  return <Tag className={styles.hidden}>{children}</Tag>
}
