'use client'

import styles from './index.module.css'

const BASE = '/projects/smil-test'

/**
 * Тест СМИЛ — самодостаточное legacy-приложение (jQuery + Flot, 566 вопросов в HTML).
 * Запускается в iframe из public/, чтобы не портировать тысячи строк в React.
 */
export default function Project() {
  return <iframe className={styles.frame} src={`${BASE}/index.html`} title="Тест СМИЛ" />
}
