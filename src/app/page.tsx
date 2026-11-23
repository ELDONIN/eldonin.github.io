import { redirect } from 'next/navigation'
import { pageMetadata } from '@/shared/lib/seo'

export const metadata = pageMetadata({
  title: 'Gnozila',
  description: 'Интерактивные веб-визуализации, статьи и ссылки.',
  path: '/playground/',
  type: 'website',
  absoluteTitle: true,
})

export default function Page() {
  redirect('/playground')
}
