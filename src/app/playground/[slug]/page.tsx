import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { projects } from '@/content/projects'
import { ProjectView } from '@/content/ProjectView'
import { pageMetadata } from '@/shared/lib/seo'
import { VisuallyHidden } from '@/shared/ui/VisuallyHidden/VisuallyHidden'

export const dynamicParams = false

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.meta.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = projects.find((p) => p.meta.slug === slug)
  if (!entry) return {}
  return pageMetadata({
    title: entry.meta.title,
    description: entry.meta.description,
    path: `/playground/${entry.meta.slug}/`,
    type: 'website',
  })
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const entry = projects.find((p) => p.meta.slug === slug)
  if (!entry) notFound()
  return (
    <>
      <VisuallyHidden as="h1">{entry.meta.title}</VisuallyHidden>
      <VisuallyHidden as="p">{entry.meta.description}</VisuallyHidden>
      <ProjectView slug={entry.meta.slug} />
    </>
  )
}
