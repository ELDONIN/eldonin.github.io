'use client'

import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'
import { PaneLoader } from '@/shared/ui/PaneLoader/PaneLoader'
import { projects } from './projects'

const views: Record<string, ComponentType> = Object.fromEntries(
  projects.map(({ meta, load }) => [
    meta.slug,
    dynamic(load, { ssr: false, loading: () => <PaneLoader /> }),
  ]),
)

export function ProjectView({ slug }: { slug: string }) {
  const View = views[slug]
  if (View === undefined) throw new Error(`Unknown project: ${slug}`)
  return <View />
}
