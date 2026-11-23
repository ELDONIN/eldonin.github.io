import type { ComponentType } from 'react'

export interface WidgetEntry {
  slug: string
  load: () => Promise<{ default: ComponentType }>
}

/**
 * Интерактивные элементы статей, которые НЕ входят в Playground.
 * Встраиваются в статьи блоком ```project slug=<slug>.
 */
export const widgets = [
  { slug: 'afterlife-experiment', load: () => import('./widgets/afterlife-experiment') },
] as const satisfies readonly WidgetEntry[]

export type WidgetSlug = (typeof widgets)[number]['slug']
