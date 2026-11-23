import type { ProjectEntry } from './types'

export const projects = [
  {
    meta: {
      slug: 'game-of-life-on-toroid-gpu',
      title: 'Жизнь на торе (GPU)',
      description:
        'Игра «Жизнь» Конвея на ~1,4 млн ячеек, развёрнутых на 3D-тор, с интерактивной камерой.',
      createDate: '2026-03-31',
      updateDate: '2026-03-31',
      tags: ['gpu', 'canvas', 'sim'],
    },
    load: () => import('./projects/game-of-life-on-toroid-gpu'),
  },
  {
    meta: {
      slug: 'strange-attractors',
      title: 'Странные аттракторы',
      description: 'Сборник 3D-визуализаций хаотических систем.',
      createDate: '2026-03-25',
      updateDate: '2026-03-25',
      tags: ['canvas', 'math'],
    },
    load: () => import('./projects/strange-attractors'),
  },
  {
    meta: {
      slug: 'spoc-virtualbox',
      title: 'Эмулятор SPOC',
      description: 'Бортовой компьютер шаттла NASA в браузере через x86-эмулятор v86.',
      createDate: '2026-11-04',
      updateDate: '2026-11-04',
      tags: ['emulator', 'terminal', 'sim'],
    },
    load: () => import('./projects/spoc-virtualbox'),
  },
  {
    meta: {
      slug: 'imposing-clocks',
      title: 'Imposing Clocks',
      description: 'Сборник странных идей для часового циферблата.',
      createDate: '2026-04-01',
      updateDate: '2026-04-01',
      tags: ['map', 'time'],
    },
    load: () => import('./projects/imposing-clocks'),
  },
  {
    meta: {
      slug: 'ascii-collection',
      title: 'ASCII Collection',
      description: 'ASCII-меню с 3D-рендерером и парой классических игр.',
      createDate: '2026-03-27',
      updateDate: '2026-03-27',
      tags: ['ascii', 'terminal'],
    },
    load: () => import('./projects/ascii-collection'),
  },
  {
    meta: {
      slug: 'afterlife-experiment',
      title: 'Эксперимент о загробной жизни',
      description: 'Интерактивный симулятор цепочек «донор — реципиент — монитор».',
      createDate: '2026-06-01',
      updateDate: '2026-06-01',
      tags: ['experiment'],
    },
    load: () => import('./projects/afterlife-experiment'),
  },
  {
    meta: {
      slug: 'parasocial-silly-cat',
      title: 'Parasocial Silly Cat',
      description: 'Интерактивный котик.',
      createDate: '2026-10-04',
      updateDate: '2026-10-04',
      tags: ['interactive'],
    },
    load: () => import('./projects/parasocial-silly-cat'),
  },
] as const satisfies readonly ProjectEntry[]

export type ProjectSlug = (typeof projects)[number]['meta']['slug']
