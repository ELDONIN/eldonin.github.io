import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArticleBody } from '@/content/ArticleBody'
import { articles } from '@/content/articles.meta'
import { pageMetadata } from '@/shared/lib/seo'
import styles from './page.module.css'

export const dynamicParams = false

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = articles.find((a) => a.slug === slug)
  if (!entry) return {}
  return pageMetadata({
    title: entry.title,
    description: entry.description,
    path: `/articles/${entry.slug}/`,
    type: 'article',
    publishedTime: entry.createDate,
    modifiedTime: entry.updateDate,
  })
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const entry = articles.find((a) => a.slug === slug)
  if (!entry) notFound()
  return (
    <article className={styles.article}>
      <h1 className={styles.title}>{entry.title}</h1>
      <ArticleBody slug={entry.slug} />
    </article>
  )
}
