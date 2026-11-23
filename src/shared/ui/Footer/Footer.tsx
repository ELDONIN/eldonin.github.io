import { SITE_YEAR } from '@/shared/config/site'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span lang="en">{SITE_YEAR} ELDONIN</span>
    </footer>
  )
}
