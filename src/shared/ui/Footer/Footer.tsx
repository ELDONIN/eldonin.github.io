import { SITE_YEAR } from '@/shared/config/site'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer} lang="en">
      {SITE_YEAR} ELDONIN
    </footer>
  )
}
