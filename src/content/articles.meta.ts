import type { EntryMeta } from '@/features/collection/model'

export const articles = [
  {
    slug: 'afterlife-experiment',
    title: 'Эксперимент о загробной жизни',
    description: 'Формальная модель слепого эксперимента: может ли сигнал пережить смерть.',
    createDate: '2026-06-01',
    updateDate: '2026-06-01',
    tags: ['math', 'experiment'],
  },
] as const satisfies readonly EntryMeta[]

export type ArticleSlug = (typeof articles)[number]['slug']
