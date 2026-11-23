import { pageMetadata } from '@/shared/lib/seo'
import { VisuallyHidden } from '@/shared/ui/VisuallyHidden/VisuallyHidden'
import styles from './page.module.css'

export const metadata = pageMetadata({
  title: 'Gnozila',
  description: 'Статьи.',
  path: '/articles/',
  type: 'website',
  absoluteTitle: true,
})

export default function Page() {
  return (
    <>
      <VisuallyHidden as="h1">Articles</VisuallyHidden>
      <p className={styles.empty} lang="en">
        Select an article
      </p>
    </>
  )
}
