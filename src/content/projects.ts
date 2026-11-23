import type { ProjectEntry } from './types'

export const projects = [
  {
    meta: {
      slug: 'game-of-life-on-toroid-gpu',
      title: 'Game Of Life On Toroid (GPU)',
      description: 'Игра «Жизнь» Конвея на торе, с интерактивной камерой',
      createDate: '2026-03-31',
      updateDate: '2026-11-23',
      tags: ['visualization'],
    },
    load: () => import('./projects/game-of-life-on-toroid-gpu'),
  },
  {
    meta: {
      slug: 'strange-attractors',
      title: 'Strange Attractors',
      description: 'Сборник визуализаций хаотических систем',
      createDate: '2026-03-25',
      updateDate: '2026-11-23',
      tags: ['gallery', 'visualization'],
    },
    load: () => import('./projects/strange-attractors'),
  },
  {
    meta: {
      slug: 'spoc-virtualbox',
      title: 'SPoC Shuttle Computer',
      description: 'Бортовой компьютер шаттла NASA в браузере',
      createDate: '2026-11-04',
      updateDate: '2026-11-23',
      tags: ['simulator'],
    },
    load: () => import('./projects/spoc-virtualbox'),
  },
  {
    meta: {
      slug: 'imposing-clocks',
      title: 'Imposing Clocks',
      description: 'Сборник странных идей для часового циферблата',
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
      description: 'ASCII-меню с артами, 3D-рендерером и парой классических игр',
      createDate: '2026-03-27',
      updateDate: '2026-11-23',
      tags: ['other'],
    },
    load: () => import('./projects/ascii-collection'),
  },
  {
    meta: {
      slug: 'parasocial-silly-cat',
      title: 'Parasocial Silly Cat',
      description: 'Интерактивный котик',
      createDate: '2026-10-04',
      updateDate: '2026-11-23',
      tags: ['other'],
    },
    load: () => import('./projects/parasocial-silly-cat'),
  },
  {
    meta: {
      slug: 'smil-test',
      title: 'SMIL test',
      description: 'Психологический тест СМИЛ: оценка индивидуальных свойств психики',
      createDate: '2026-11-23',
      updateDate: '2026-11-23',
      tags: ['test'],
    },
    load: () => import('./projects/smil-test'),
  },
] as const satisfies readonly ProjectEntry[]

export type ProjectSlug = (typeof projects)[number]['meta']['slug']
