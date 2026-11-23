import { links } from '@/content/links'
import { LinksList } from '@/features/links/LinksList'
import { Footer } from '@/shared/ui/Footer/Footer'
import { pageMetadata } from '@/shared/lib/seo'
import { VisuallyHidden } from '@/shared/ui/VisuallyHidden/VisuallyHidden'
import styles from './page.module.css'

export const metadata = pageMetadata({
  title: 'Gnozila',
  description: 'Ссылки.',
  path: '/links/',
  type: 'website',
  absoluteTitle: true,
})

export default function Page() {
  return (
    <>
      <VisuallyHidden as="h1">Links</VisuallyHidden>
      <div className={styles.content}>
        <LinksList links={links} />
      </div>
      <Footer />
    </>
  )
}
