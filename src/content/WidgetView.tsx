'use client'

import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'
import { PaneLoader } from '@/shared/ui/PaneLoader/PaneLoader'
import { widgets } from './widgets'

const views: Record<string, ComponentType> = Object.fromEntries(
  widgets.map(({ slug, load }) => [
    slug,
    dynamic(load, { ssr: false, loading: () => <PaneLoader /> }),
  ]),
)

export function WidgetView({ slug }: { slug: string }) {
  const View = views[slug]
  if (View === undefined) throw new Error(`Unknown widget: ${slug}`)
  return <View />
}
