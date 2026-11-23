import type { EntryMeta } from '@/features/collection/model'

export const articles = [
  {
    slug: 'afterlife-experiment',
    title: 'Afterlife Experiment',
    description: 'Формальная модель слепого эксперимента: может ли сигнал пережить смерть.',
    createDate: '2026-06-01',
    updateDate: '2026-11-23',
    tags: ['experiment'],
  },
] as const satisfies readonly EntryMeta[]

export type ArticleSlug = (typeof articles)[number]['slug']
