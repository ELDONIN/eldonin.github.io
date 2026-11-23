import type { EntryMeta } from '@/features/collection/model'

export const articles = [
  {
    slug: 'afterlife-experiment',
    title: 'Afterlife Experiment',
    description: 'Формальная модель слепого эксперимента: может ли сигнал придти из загробного мира',
    createDate: '2026-06-01',
    updateDate: '2026-11-23',
    tags: ['experiment'],
  },
  {
    slug: 'mikhailovskaya-obitel',
    title: 'История Михайловской обители',
    description:
      'Хроника общины «старца Алексия» в посёлке Победа: от возникновения в 1950-х до сноса построек в 2015–2016 годах',
    createDate: '2026-11-24',
    updateDate: '2026-11-24',
    tags: ['history'],
  },
] as const satisfies readonly EntryMeta[]

export type ArticleSlug = (typeof articles)[number]['slug']
