import type { ProjectEntry } from './types'

export const projects = [
  {
    meta: {
      slug: 'game-of-life-on-toroid-gpu',
      title: 'Game Of Life On Toroid (GPU)',
      description:
        'Игра «Жизнь» Конвея на ~1,4 млн ячеек, развёрнутых на 3D-тор, с интерактивной камерой.',
      createDate: '2026-03-31',
      updateDate: '2026-11-23',
      tags: ['sim'],
    },
    load: () => import('./projects/game-of-life-on-toroid-gpu'),
  },
  {
    meta: {
      slug: 'strange-attractors',
      title: 'Strange Attractors',
      description: 'Сборник 3D-визуализаций хаотических систем.',
      createDate: '2026-03-25',
      updateDate: '2026-11-23',
      tags: ['gallery'],
    },
    load: () => import('./projects/strange-attractors'),
  },
  {
    meta: {
      slug: 'spoc-virtualbox',
      title: 'SPoC Shuttle Computer',
      description: 'Бортовой компьютер шаттла NASA в браузере через x86-эмулятор v86.',
      createDate: '2026-11-04',
      updateDate: '2026-11-23',
      tags: ['sim'],
    },
    load: () => import('./projects/spoc-virtualbox'),
  },
  {
    meta: {
      slug: 'imposing-clocks',
      title: 'Imposing Clocks',
      description: 'Сборник странных идей для часового циферблата.',
      createDate: '2026-04-01',
      updateDate: '2026-11-23',
      tags: ['gallery'],
    },
    load: () => import('./projects/imposing-clocks'),
  },
  {
    meta: {
      slug: 'ascii-collection',
      title: 'ASCII Collection',
      description: 'ASCII-меню с 3D-рендерером и парой классических игр.',
      createDate: '2026-03-27',
      updateDate: '2026-11-23',
      tags: ['sim'],
    },
    load: () => import('./projects/ascii-collection'),
  },
  {
    meta: {
      slug: 'parasocial-silly-cat',
      title: 'Parasocial Silly Cat',
      description: 'Интерактивный котик.',
      createDate: '2026-10-04',
      updateDate: '2026-11-23',
      tags: ['other'],
    },
    load: () => import('./projects/parasocial-silly-cat'),
  },
  {
    meta: {
      slug: 'smil-test',
      title: 'Тест СМИЛ',
      description: 'Психологический тест СМИЛ: 566 вопросов, автоматический подсчёт шкал и профиль личности.',
      createDate: '2026-11-23',
      updateDate: '2026-11-23',
      tags: ['test'],
    },
    load: () => import('./projects/smil-test'),
  },
] as const satisfies readonly ProjectEntry[]

export type ProjectSlug = (typeof projects)[number]['meta']['slug']
