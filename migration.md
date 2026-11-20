# Gnozila — требования к проекту

## 1. Общее

- Название: **Gnozila**
- Тема: **тёмная** (единственная)
- Разделы: Playground, Articles, Links
- Стартовая страница: Playground
- Логотип: `public/logo.svg`. Используется и в хедере, и как фавикон.
- Язык интерфейса: **английский** (навигация, футер, подсказки, 404). Язык контента (проекты, статьи, ссылки): **русский**.
- `<html lang="ru">` в корневом `layout.tsx`: основная часть текста на сайте русская, и от `lang` зависит озвучка скринридером и перенос слов.
- `title` и `description` проектов, статей и ссылок могут содержать **кириллицу и латиницу** (любые печатные символы Unicode). Ограничения на безопасные символы действуют только для `slug` и `tags` (см. раздел 7).
- **Основа — десктоп.** На десктопе Playground и Articles работают как **приложения**: окно не прокручивается, прокручиваются только внутренние области (см. 6.0). Мобильная версия делается по остаточному принципу: сайт должен открываться и читаться на телефоне (ниже `768px` раскладка заменяется схемой «список → деталь», обычная страничная прокрутка, см. 6.0), но полный функционал на телефоне не гарантируется.
- **Статьи пишутся в Obsidian** (заметки `.md` с YAML-frontmatter) и при необходимости дополняются строкой с проектом Playground (см. 6.2).

## 2. Технологический стек

| Область | Требование |
|---|---|
| Фреймворк | Next.js, App Router |
| Язык | TypeScript, `strict: true` + дополнительные флаги строгости: `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` |
| Пакетный менеджер | pnpm |
| Линтинг | ESLint + `typescript-eslint` с пресетом `strict-type-checked` |
| Форматирование | Prettier |
| Стили | **CSS Modules** (`*.module.css` рядом с компонентом) + один глобальный `src/app/globals.css` с токенами; см. раздел 4 |
| Тесты | Vitest (юнит-тесты и тесты целостности контента), см. разделы 7 и 9 |
| Контент статей | Заметки Obsidian (`.md`) с YAML-frontmatter; компилируются через **`@next/mdx`**, общая карта компонентов в `src/mdx-components.tsx`; см. 6.2 |
| Вспомогательные пакеты | `@types/mdx`, `server-only` (защита серверного загрузчика статей), `zod` (**dependency**: проверяет мету при сборке и в тестах), `gray-matter` (разбор frontmatter), `remark-frontmatter`, `remark-gfm`, `remark-mdx-images`, `rehype-slug` |

**Настройка MDX**
- Конфиг Next.js: `next.config.ts` (или `next.config.mjs`): экосистема remark/rehype только ESM.
- Если сборка идёт на Turbopack, remark/rehype-плагины указываются строками-именами, а их опции должны сериализоваться.
- `pageExtensions` не расширяется: `.md`-файлы лежат в `src/content/articles/<slug>/` и подключаются через `import()`, маршрутами они не становятся. Опция `extension` у `@next/mdx` — `/\.md$/`, формат разбора — `md`: JSX и выражения `{}` в заметках не интерпретируются, чтобы произвольный текст из Obsidian не ломал сборку.
- Плагины: `remark-frontmatter`, `remark-gfm`, собственный `remark-obsidian` (`mdx-plugins/remark-obsidian.mjs`, см. 6.2), `remark-mdx-images`, `rehype-slug`. Плагины указываются строками-именами, опции сериализуемые (см. раздел 13).
- Файл `src/mdx-components.tsx` обязателен для MDX в App Router (см. 6.2).
- Плагины: remark — `remark-gfm`, `./mdx-plugins/remark-obsidian.mjs`; rehype — `rehype-slug`, `['rehype-pretty-code', { theme: 'github-dark', keepBackground: false }]`. Порядок важен: `remark-obsidian` идёт раньше (он превращает ```` ```mermaid ```` и другой Obsidian-синтаксис в компоненты до подсветки кода).
- Собственные плагины лежат в `mdx-plugins/` в корне репозитория (вне `src` и вне слоёв), это `.mjs`-файлы; опции плагинов только сериализуемые (строки, числа, объекты без функций).
- Плагина frontmatter нет: файл статьи не может начинаться с `---` (см. раздел 7).

**Год в футере.** `next.config` задаёт `env: { NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()) }`. Значение вычисляется при сборке и подставляется в серверный и клиентский код одинаково (см. 5, «Footer»).

**Единая команда проверки:** `pnpm check` = `lint` + `typecheck` + `test` + `build`. Отдельных скриптов-проверок нет.

`references/` — read-only, исключена из tsc, ESLint и Prettier.

## 3. Архитектура

### 3.1 Слои и правила импортов

```
app  →  content  →  features  →  shared
```

- `app` — маршруты, layout'ы, страницы ошибок и 404, `src/mdx-components.tsx`. Может импортировать всё.
- `content` — **контент сайта**: проекты Playground, статьи, ссылки, их манифесты и загрузчики, а также компоненты `Project` и `ProjectView`, которые встраивают проект на страницу. Может импортировать `features` (только `import type` для типов записей) и `shared`. Не импортирует `app`.
  - Код самих проектов (`content/projects/<slug>/**`) импортирует **только `shared`**.
- `features` — переиспользуемая функциональность без знания о конкретном контенте: `collection`, `articles` (общие MDX-компоненты), `links`. Могут импортировать только `shared`. **Фичи не импортируют друг друга и не импортируют `content`.**
- `shared` — только по-настоящему общее (`PaneLoader`, `Footer`, `ScrollArea`, `LazyMount`, `project-host`, шрифты и т. п.). Не знает о `features`, `content` и `app`.
- **Фича `collection`** — «браузер коллекции»: теги, фильтрация, список, `SplitLayout`, чистые функции тегов. Playground и Articles используют её одинаково; различаются только данные, базовый путь (`/playground` и `/articles`) и содержимое правой области. Дублировать вёрстку, фильтрацию (`?tags=`) и мобильную раскладку в разделах нельзя.
- **Связь статей и Playground** проходит только через слой `content`: статья встраивает проект строкой `![[project:slug]]`, которую `remark-obsidian` превращает в `<Project slug="…" />`; заметки не содержат `import`.
- Правила проверяются линтером (`no-restricted-imports` или `eslint-plugin-boundaries`). Заметки `.md` линтер не видит; `import` и JSX в них не работают по построению (формат `md`, см. раздел 2).

### 3.2 Структура репозитория

```
Gnozila/
├── AGENTS.md
├── README.md
├── ROADMAP.md
├── migration.md
├── references/                  # read-only
├── mdx-plugins/
│   └── remark-obsidian.mjs      # синтаксис Obsidian → разметка сайта (при сборке, см. 6.2)
├── public/
│   ├── logo.svg                 # логотип: хедер + фавикон
│   └── og.png                   # картинка по умолчанию для соцсетей, 1200×630
└── src/
    ├── mdx-components.tsx       # карта MDX-компонентов (требование @next/mdx); слой app
    ├── app/
    │   ├── globals.css          # reset, токены в :root, color-scheme, каркас body (см. разделы 4 и 6.0)
    │   ├── sitemap.ts           # см. раздел 12
    │   ├── robots.ts            # см. раздел 12
    │   ├── error.tsx
    │   ├── global-error.tsx
    │   ├── not-found.tsx
    │   ├── playground/
    │   │   ├── layout.tsx       # серверный: читает projects.meta, рендерит SplitLayout
    │   │   ├── error.tsx
    │   │   ├── page.tsx         # «Select a project»
    │   │   └── [slug]/page.tsx
    │   ├── articles/
    │   │   ├── layout.tsx
    │   │   ├── error.tsx
    │   │   ├── page.tsx         # «Select an article»
    │   │   └── [slug]/page.tsx
    │   └── links/page.tsx
    ├── content/
    │   ├── types.ts                 # type Loader
    │   ├── schema.ts                # zod-схемы меты (проекты, ссылки, frontmatter статей)
    │   ├── projects.meta.ts         # мета проектов: чистые данные, порядок = порядок в списке
    │   ├── projects.loaders.ts      # Record<ProjectSlug, Loader>
    │   ├── articles.source.ts       # чтение папок статей, разбор frontmatter, проверка zod (без server-only, тестируется)
    │   ├── articles.ts              # import 'server-only'; getArticles(), loadArticle(slug) поверх articles.source.ts
    │   ├── links.ts                 # список ссылок
    │   ├── ProjectView.tsx          # клиентская обёртка: next/dynamic + ssr: false + PaneLoader
    │   ├── Project.tsx              # <Project slug height /> для MDX (серверный)
    │   ├── integrity.test.ts        # целостность контента и файлов (см. раздел 7)
    │   ├── meta.test.ts             # проверка манифестов схемой
    │   ├── projects/
    │   │   └── <slug>/              # имя папки = slug
    │   │       └── index.tsx        # 'use client', default-экспорт корневого компонента
    │   └── articles/                # хранилище (vault) Obsidian
    │       └── <slug>/              # имя папки = slug
    │           ├── <slug>.md        # заметка: YAML-frontmatter + текст
    │           └── *.png и др.      # вложения заметки (лежат рядом)
    ├── features/
    │   ├── collection/
    │   │   ├── model.ts             # EntryMeta
    │   │   ├── SplitLayout.tsx
    │   │   ├── CollectionList.tsx   # презентационный список + теги (без хуков)
    │   │   ├── FilteredCollection.tsx # читает ?tags=, использует useSearchParams
    │   │   └── lib/                 # чистая логика тегов + *.test.ts
    │   ├── articles/
    │   │   └── mdx/                 # общие компоненты MDX (Callout, Figure, Mermaid, …); Prose.tsx + Prose.module.css
    │   └── links/
    │       ├── model.ts             # LinkEntry
    │       ├── LinksList.tsx
    │       └── lib/                 # нормализация url + *.test.ts
    └── shared/
        ├── ui/
        │   ├── Footer/              # Footer.tsx + Footer.module.css
        │   ├── ScrollArea/          # внутренняя прокручиваемая область (см. 6.0)
        │   ├── LazyMount/           # монтирует детей, когда блок попал на экран (см. 6.2)
        │   └── PaneLoader/
        ├── lib/
        │   ├── project-host/        # useProjectHost, useAnimationFrame: размер, видимость, очистка (см. 6.1)
        │   ├── project-host/        # хуки для проектов (см. 6.1)
        │   └── seo.ts               # pageMetadata(): сборка Metadata для страниц (см. раздел 12)
        └── config/
            ├── site.ts              # SITE_URL, SITE_NAME, SITE_YEAR
            └── fonts/
                ├── fonts.ts
                └── <Шрифт>-*.woff2
```

`loading.tsx` не используется (см. 6.1, «Состояние загрузки»).

Папка `src/content/articles/` открывается в Obsidian как хранилище. Служебная папка `.obsidian/` добавляется в `.gitignore` и исключается из tsc, ESLint и Prettier.

### 3.3 Модель записи

Проект и статья имеют общую **мету** (то, что показывается в списке), но разное содержимое и среду выполнения: проект — программа в браузере (`canvas`, `WebGL`, `window`), статья — документ, готовящийся на сервере при сборке.

- **Мета отделена от загрузчика.** Мета — чистые сериализуемые данные, их можно передавать куда угодно (в том числе в клиентский компонент) и тестировать без MDX и без заглушек. Загрузчик — отдельная структура `Record<Slug, Loader>`. Это относится к проектам и ссылкам: мета проектов лежит в `projects.meta.ts`, а **мета статей живёт в YAML-frontmatter самих заметок** (см. 6.2), её читает `content/articles.ts`.
- `EntryMeta` (`features/collection/model.ts`): `slug`, `title`, `description`, `createDate`, `updateDate`, `tags`.
- `LinkEntry` (`features/links/model.ts`): `title`, `description`, `url`. Без `slug`, `createDate`, `updateDate` и `tags`.
- **`slug` = имя папки проекта** (`content/projects/<slug>/`) **или имя файла статьи без расширения** (`content/articles/<slug>.mdx`). Имя и `slug` не могут различаться. `slug` не меняется после публикации: это часть URL.
- Порядок элементов массива меты = порядок в списке.
- `content/articles.ts` начинается с `import 'server-only'`: попытка импортировать его из клиентского кода падает на сборке. `projects.meta.ts` — без `server-only`.
- `Record<ProjectSlug, Loader>` с `satisfies` гарантирует на уровне `tsc`, что у каждого `slug` из меты проектов есть загрузчик и нет лишних. У статей `slug` — имя папки, отдельного реестра нет.
- `next/dynamic` с `ssr: false` вызывается только в клиентской обёртке `ProjectView`.

```ts
// src/features/collection/model.ts
export interface EntryMeta {
  slug: string
  title: string
  description: string
  createDate: string // 'YYYY-MM-DD', дата создания, не меняется
  updateDate: string // 'YYYY-MM-DD', дата последнего обновления, >= createDate
  tags: readonly [string, ...string[]]
}
```

```ts
// src/content/types.ts
import type { ComponentType } from 'react'

export type Loader = () => Promise<{ default: ComponentType }>
```

```ts
// src/content/projects.meta.ts
import type { EntryMeta } from '@/features/collection/model'

export const projects = [
  {
    slug: 'particle-field',
    title: 'Поле частиц',
    description: 'Интерактивная симуляция частиц в силовом поле',
    createDate: '2026-03-14',
    updateDate: '2026-03-14',
    tags: ['canvas', 'physics'],
  },
] as const satisfies readonly EntryMeta[]

export type ProjectSlug = (typeof projects)[number]['slug']
```

```ts
// src/content/projects.loaders.ts
import type { Loader } from './types'
import type { ProjectSlug } from './projects.meta'

export const projectLoaders = {
  'particle-field': () => import('./projects/particle-field'),
} as const satisfies Record<ProjectSlug, Loader>
```

```yaml
# src/content/articles/best-article/best-article.md (начало файла)
---
title: Лучшая статья
description: Короткое описание
tags: [typescript, architecture]
createDate: 2026-03-14
updateDate: 2026-03-14
order: 1
---
```

```ts
// src/content/articles.ts
import 'server-only'
import type { ComponentType } from 'react'
import type { EntryMeta } from '@/features/collection/model'

// все статьи по возрастанию order; ошибка во frontmatter роняет сборку
export declare function getArticles(): Promise<readonly EntryMeta[]>

// тело статьи: import(`./articles/${slug}/${slug}.md`)
export declare function loadArticle(slug: string): Promise<ComponentType>
```

```ts
// src/content/links.ts
import type { LinkEntry } from '@/features/links/model'

export const links = [
  {
    title: 'Next.js',
    description: 'Документация фреймворка',
    url: 'https://nextjs.org/docs',
  },
] as const satisfies readonly LinkEntry[]
```

```tsx
// src/content/ProjectView.tsx
'use client'

import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'
import { useSeenOnce } from '@/shared/lib/project-host'
import { PaneLoader } from '@/shared/ui/PaneLoader'
import { projectLoaders } from './projects.loaders'

const views: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(projectLoaders).map(([slug, load]) => [
    slug,
    dynamic(load, { ssr: false, loading: () => <PaneLoader /> }),
  ]),
)

// lazy: проект создаётся, только когда его блок приблизился к области видимости (для статей)
export function ProjectView({ slug, lazy = false }: { slug: string; lazy?: boolean }) {
  const [ref, seen] = useSeenOnce<HTMLDivElement>('200px')
  const View = views[slug]
  if (View === undefined) throw new Error(`Unknown project: ${slug}`)
  return (
    <div ref={ref} style={{ height: '100%' }}>
      {lazy && !seen ? <PaneLoader /> : <View />}
    </div>
  )
}
```

```tsx
// src/content/Project.tsx (серверный)
import { ProjectView } from './ProjectView'
import { projectLoaders } from './projects.loaders'
import type { ProjectSlug } from './projects.meta'
import { LazyMount } from '@/shared/ui/LazyMount'

export function Project({ slug, height = 400 }: { slug: ProjectSlug; height?: number }) {
  if (!(slug in projectLoaders)) throw new Error(`Unknown project: ${slug}`)
  return (
    <div style={{ height, touchAction: 'pan-y' }}>
      <LazyMount rootMargin="200px">
        <ProjectView slug={slug} lazy />
      </LazyMount>
    </div>
  )
}
```

Страницы статей статические, поэтому неизвестный `slug` в `<Project>` роняет **сборку**, а не рантайм. `Project` (встроенный в статью) включает `lazy`, а страница Playground вызывает `ProjectView` без него: проект создаётся сразу.

## 4. Дизайн

- Тёмная тема.
- **Запрещено использовать эффект свечения текста** (text-shadow/glow и аналоги), если это явно не указано в задании.
- Шрифты **лежат в репозитории** в `src/shared/config/fonts/` и подключаются через `next/font/local` в `fonts.ts` (пути относительны этого файла). Внешние запросы к CDN и Google Fonts не используются. Если файла шрифта нет, падает сборка.
- Формат файлов: `woff2` или `woff` (предпочтительно `woff2`). Шрифт **обязательно содержит кириллицу и латиницу**.
- В `fonts.ts` задаются `display: 'swap'` и CSS-переменная (`variable`), которую корневой `layout.tsx` вешает на `<html>`.
- Набор начертаний ограничивается реально используемыми (например, regular и bold).
- Высота хедера задаётся одной CSS-переменной `--header-h`; от неё считается строка шапки в сетке `body` (см. 6.0).

### Стили (CSS Modules)

- **Каждый компонент** со стилями имеет рядом свой `<Имя>.module.css`. Глобальных классов нет; в `globals.css` только reset, базовые стили `html`/`body`/ссылок, каркас `body` (6.0) и токены.
- **Токены** лежат в `:root` в `globals.css`: цвета (`--bg`, `--fg`, `--muted`, `--border`, `--accent`, `--code-bg`, `--mark-bg`, `--callout-note`, `--callout-tip`, `--callout-warning`, `--callout-danger`), отступы, `--header-h`, `--back-h` (высота ссылки `← Back` на мобильных, `2.75rem`), переменные шрифтов из `next/font`. Модули используют только `var(--…)`, цвета и размеры литералами не пишутся. Тема одна, `color-scheme: dark` на `<html>`.
- **Единственный брейкпоинт:** `48rem` (768px). CSS-переменные в `@media` не работают, поэтому значение повторяется в модулях, где нужно (`globals.css`, `SplitLayout`, `ScrollArea`, шапка, `Prose`), с комментарием `/* breakpoint: см. REQUIREMENTS.md, раздел 4 */`.
- **Проза статей:** один `Prose.module.css` в `features/articles/mdx/`, обёртка `Prose` оборачивает содержимое статьи; стили элементов задаются селекторами вида `.prose h2`, `.prose pre` (допустимо в CSS Modules, так как в селекторе есть локальный класс). Отдельные компоненты на каждый HTML-элемент в карте MDX не нужны. `Prose` оформляет всё, что поддерживает разметка статей (6.2): заголовки, списки и задачи, таблицы, цитаты, сноски, `<mark>`, callouts, картинки, блоки кода, диаграммы. Цвета подсвеченного кода задаёт тема `shiki` (inline-стили): это единственное исключение из правила «цвета только из токенов»; фон `pre` берётся из `--code-bg`.
- **Фокус:** у всех интерактивных элементов видимый `:focus-visible`.
- **Доступ к классам в TypeScript:** `styles.root`. Из-за `noUncheckedIndexedAccess` результат имеет тип `string | undefined`, что допустимо для `className`.
- **Описание в списках** (`description` под названием): `font-size` около `0.8125rem`, цвет `--muted`, не более двух строк (`line-clamp: 2`). Рекомендуемая длина описания — до 160 символов, чтобы оно не обрезалось.
- **Запрет свечения** (см. выше) проверяет `integrity.test.ts`: ни в одном `*.css` нет `text-shadow`.

## 5. Общий каркас (layout)

Корневой `layout.tsx` рендерит `<Header />` и `<main>{children}</main>`. Глобального футера нет (см. «Footer»).

### Header
- **Прилипает к верху окна** (`position: sticky; top: 0; height: var(--header-h)`). На десктопе это строка сетки `body`, на мобильных прилипание работает при прокрутке страницы.
- Слева: логотип (`public/logo.svg`) + название проекта **Gnozila**
- Затем отступ и навигация: **Playground**, **Articles**, **Links**
- Название активной страницы подчёркнуто. Активность определяется по первому сегменту пути (`useSelectedLayoutSegment` в корневом `layout`):
  - **Playground** активен на `/playground` и на любом `/playground/<slug>`;
  - **Articles** активен на `/articles` и на любом `/articles/<slug>`;
  - **Links** активен и подчёркнут на `/links`;
  - на странице 404 и других несуществующих маршрутах ни один пункт не подчёркнут.
- `/` перенаправляет на `/playground` **непостоянным** редиректом (`permanent: false`, код 307): браузеры не кэшируют его навсегда, и главную страницу можно будет сделать позже.

### Footer
- Компонент `shared/ui/Footer`: одна строка мелким шрифтом (`--muted`), текст `{SITE_YEAR} ELDONIN`.
- **Год вычисляется самостоятельно при сборке:** `SITE_YEAR` в `shared/config/site.ts` читает `process.env.NEXT_PUBLIC_BUILD_YEAR`, которое подставляет `next.config` (раздел 2). Ручной правки года нет. Обращаться к переменной нужно **через точку** (`process.env.NEXT_PUBLIC_BUILD_YEAR`): Next.js подставляет значения только при такой записи, при `process.env['…']` подстановки не будет.
- Год соответствует году **последней сборки**. Сайт пересобирается при изменении контента, поэтому после Нового года год обновится при ближайшей сборке (см. раздел 8).
- **Размещение:**
  - `/playground` и `/articles`: **внизу левой колонки** (под списком, см. 6.0). Футер не прокручивается вместе со списком, он всегда виден;
  - `/links`, 404 и страницы ошибок: внизу содержимого страницы;
  - на страницах проектов и статей отдельного футера нет, он уже находится в левой колонке.
- На мобильных футер находится в конце списка (в левой колонке, которая видна на `/playground` и `/articles`) и в конце содержимого остальных страниц.

### Метаданные
- Фавикон: `public/logo.svg`, подключается через `metadata.icons` в корневом `layout.tsx`. Отдельный `icon.*` в `src/app/` не создаётся.
- Остальные метаданные (title, description, canonical, Open Graph, sitemap, robots) — см. раздел 12.

## 6. Страницы

### 6.0 Каркас `SplitLayout`, прокрутка и `ScrollArea`

**Общая схема.** На десктопе (≥768px) Playground и Articles работают как **приложения**: окно браузера не прокручивается. Прокручиваются только внутренние области. На мобильных (<768px) сайт — обычный документ со страничной прокруткой.

**Каркас `body` (десктоп)**
- `body`: `height: 100dvh; overflow: hidden; display: grid; grid-template-rows: var(--header-h) minmax(0, 1fr)`. Первая строка — шапка, вторая — `main`.
- `main` не прокручивается сам. Прокрутка задаётся тем, что лежит внутри.
- На мобильных `body` имеет обычную высоту и прокручивается окном.

**Десктоп (≥768px)**
- Двухколоночная сетка в `main`: левый столбец + правая область, обе высотой во всю область под шапкой.
- **Левый столбец** — flex-колонка:
  1. теги (не прокручиваются);
  2. список (`flex: 1; min-height: 0; overflow-y: auto`) — прокручивается внутри колонки; позиция прокрутки сохраняется при смене проекта или статьи (layout не перемонтируется);
  3. `Footer` внизу, не прокручивается.
- **Правая область Playground:** `overflow: hidden`, проект занимает её целиком. Прокручивать нечего, поэтому колесо мыши, жесты и клавиши достаются проекту, и ему не нужно бороться с прокруткой страницы.
- **Правая область Articles:** компонент `shared/ui/ScrollArea` (см. ниже), внутри — `<h1>` и статья.
- Ссылки списка ведут на `/<раздел>/<slug>` с `scroll={false}`: прокруткой внутренней области управляет `ScrollArea`, а не Next.js.
- Клик по тегу выполняется через `router.replace(url, { scroll: false })`.

**`shared/ui/ScrollArea`** (клиентский компонент, общий для Articles, Links, 404 и страниц ошибок)
- На десктопе: `overflow-y: auto; overscroll-behavior: contain; height: 100%`, тонкий полосой прокрутки из токенов (`scrollbar-width: thin`, `scrollbar-color`). На мобильных прокрутки нет, область растёт по содержимому.
- `tabindex="0"` и доступное имя (`aria-label`), чтобы пробел, `PageUp/PageDown` и стрелки работали с клавиатуры.
- **Смена страницы** (изменение `pathname`):
  - переход по ссылке: `scrollTop = 0`;
  - «Назад/Вперёд» (`popstate`): восстановить сохранённую позицию этого `pathname`.
- Позиция сохраняется в `sessionStorage` под ключом `scroll:<pathname>` (при `scroll` с троттлингом и при уходе со страницы).
- **Фокус:** только в Articles после открытия статьи фокус переносится на область (`focus({ preventScroll: true })`), чтобы пробел и `PageDown` сразу листали статью. К списку можно вернуться через `Shift+Tab`.
- **Якоря `#heading`** работают штатно; отступ задаётся `scroll-padding-top` на самой области.
- **Печать:** `@media print` снимает `height`, `overflow` и ограничения `body`, скрывает шапку и левую колонку, статья печатается целиком.
- Проекты, встроенные в статью, не должны перехватывать `wheel` без необходимости: иначе колесо над холстом не будет листать статью.

**Мобильные (<768px) — схема «список → деталь»**

Принцип: основа — десктоп, мобильная версия минимальна и делается по остаточному принципу. Объём ограничен списком ниже; всё, чего в нём нет, на мобильных не делается.
- Прокручивается страница целиком, шапка sticky. Левый столбец без sticky и без внутренней прокрутки, `ScrollArea` не создаёт внутренней прокрутки.
- На `/playground` и `/articles` показывается только левый столбец (теги + список + футер) на всю ширину. Правая область с текстом «Select …» скрыта.
- На `/playground/<slug>` и `/articles/<slug>` левый столбец скрыт (`display: none`, компонент остаётся смонтированным), показываются ссылка `← Back` над контентом (ведёт на `/<раздел>` с сохранением `?tags=`) и сам контент.
- Область проекта на `/playground/<slug>` на мобильных имеет высоту `calc(100dvh - var(--header-h) - var(--back-h))`.
- Состояние определяется по `useSelectedLayoutSegment` в `SplitLayout` (атрибут `data-has-selection`) и переключается CSS. Определение устройства по user-agent и JS-проверки ширины экрана не используются: переключение раскладки делается только CSS.
- Описания проектов и статей (`description` под названием) видны и на мобильных: отдельного поведения для них нет.
- Стили `:hover` оборачиваются в `@media (hover: hover)`, чтобы после тапа элемент не оставался «наведённым».
- **Теги** на мобильных идут **одной горизонтально прокручиваемой строкой** (`flex-wrap: nowrap; overflow-x: auto`), на десктопе переносятся на несколько строк. Разметка одна и та же (`CollectionList`), различие только в CSS.
- Пункты навигации, элементы списка и кнопка `← Back` имеют область касания не менее 44px по высоте.
- Шапка **всегда sticky**, особого поведения в ландшафте нет.
- Проект внутри статьи: обёртка `<Project>` задаёт `touch-action: pan-y`, чтобы холст не перехватывал вертикальную прокрутку страницы. Остальное поведение проектов на touch-устройствах не гарантируется, проекты не обязаны работать без мыши и клавиатуры, отдельных флагов в мете нет.
- Проза: размер шрифта не меньше 16px, `pre` и таблицы прокручиваются внутри себя (`overflow-x: auto`), изображения и диаграммы не шире экрана (`max-width: 100%`); у картинок всегда есть `width`/`height` (их даёт статический импорт, см. 6.2).

**Не делаем:** пометки проектов «только для десктопа», `apple-touch-icon` и PWA, `safe-area-inset`, `svh`/`dvh`-тонкости и особое поведение шапки в ландшафте, автоматические мобильные тесты (Playwright). Проверка — вручную в эмуляции DevTools.

### 6.1 Playground

Playground — это набор **интерактивных веб-визуализаций**. В списке слева отображаются название и под ним краткое описание, при выборе названия справа открывается сам проект.

**Раскладка:** см. 6.0. Каркас общий с Articles (`features/collection/SplitLayout`).

**Маршрутизация** (устроена так же, как в Articles, см. 6.2)
- `/playground` — пустое состояние, в правой области текст **Select a project** (на мобильных скрыт, см. 6.0)
- `/playground/<slug>` — выбранный проект. Выбор **отражается в URL**.
- Левый столбец живёт в `app/playground/layout.tsx` и не перемонтируется при смене проекта. Layout серверный: он читает `content/projects.meta.ts` и передаёт мету в клиентский `SplitLayout` напрямую (в мете нет функций).
- Страницы проектов статические: `generateStaticParams` по мете, `dynamicParams = false`. Неизвестный slug → 404.
- Подчёркнутый проект определяется из URL (`useSelectedLayoutSegment`).

**Левый столбец**
- Сверху: теги
- Ниже: список проектов. Для каждого проекта показываются `title` и под ним `description` мелким шрифтом (`--muted`, не более двух строк, см. раздел 4). Название и описание находятся внутри одной ссылки.
- Всплывающих подсказок нет: описание всегда видно на странице, на десктопе и на мобильных.
- Внизу колонки: `Footer` (см. 5).

**Фильтрация по тегам**
- Клик по тегу: тег подчёркивается, в списке остаются только проекты, у которых есть **все** выбранные теги
- Можно выбрать несколько тегов
- **Несколько тегов работают как пересечение (AND)**: каждый новый выбранный тег сужает результат
- Повторный клик снимает выделение
- Если ни один тег не выбран — показываются все проекты
- **Список тегов вычисляется от всех элементов раздела и не зависит от выбранного фильтра:** набор и порядок тегов не меняются, меняется только подчёркивание.
- Выбранные теги хранятся в query-параметре `?tags=a,b`, ссылки списка сохраняют текущий `?tags=`. Так как теги состоят только из `a-z`, `0-9` и `-`, дополнительное кодирование не требуется.
- Клик по тегу обновляет `?tags=` через `router.replace`, без новой записи в истории. Переход между проектами — обычная навигация с записью в истории.
- Теги из `?tags=`, которых нет в данных, игнорируются.
- **Пустой результат возможен** (комбинация тегов, которой нет ни у одного проекта). Тогда на месте списка показывается текст `No matches`; теги остаются доступными, чтобы снять выбор.

**Suspense и серверный список вместо скелетона**
- `FilteredCollection` читает `useSearchParams`, поэтому его оборачивает `Suspense`, охватывающий блок «теги + список» целиком.
- **`fallback` — не скелетон, а настоящий список**: тот же презентационный компонент `CollectionList`, отрисованный без фильтра: все теги (неинтерактивные, без подчёркивания) и все элементы обычными ссылками `<a>` с описаниями. Выбранный элемент подчёркнут, потому что `SplitLayout` знает сегмент через `useSelectedLayoutSegment` (ему Suspense не нужен).
- Так ссылки на все проекты и статьи присутствуют в статическом HTML, а при гидратации подключается фильтр без сдвигов вёрстки. Разметка `fallback` и итогового блока строится одним компонентом `CollectionList`, поэтому размеры совпадают по построению.
- Отдельный компонент `ListSkeleton` не нужен.

**Выбор проекта**
- Выбранный проект в списке **подчёркивается**
- Пока проект не выбран (`/playground`), в правой области текст **Select a project**
- **Если фильтр по тегам скрыл выбранный проект, он остаётся открытым.** URL не меняется, правая область меняется только при выборе другого проекта.

**Правая область**
- Показывает **только сам проект**: интерактивная визуализация на всю область. Никакой видимой шапки или заголовка в правой области нет (на мобильных добавляется только ссылка `← Back`, см. 6.0).
- Единственное исключение — визуально скрытый (`sr-only`) блок с `<h1>` (`title`) и абзацем (`description`) для поисковиков и скринридеров (см. раздел 12). Он рендерится на сервере страницей `/playground/<slug>` и позиционируется так, чтобы не влиять на раскладку.

**Реализация проектов**
- Каждый проект — React-клиентский компонент (`'use client'`) в `content/projects/<slug>/index.tsx`, с default-экспортом корневого компонента.
- Проект регистрируется в двух местах: запись в `projects.meta.ts` и строка в `projects.loaders.ts`. Если одно из них забыто, ошибку выдаёт `tsc` (`satisfies Record<ProjectSlug, Loader>`), а папка без записи в мете — тест целостности.
- Код проекта загружается лениво и не попадает в бандл других страниц.
- Страница `/playground/<slug>` (серверная) ищет запись по `slug`; если записи нет — `notFound()`; иначе рендерит клиентскую обёртку `ProjectView` (см. 3.3).
- Проект рендерится только на клиенте (`next/dynamic` с `ssr: false`), потому что ему нужны `window`, `canvas` или `WebGL`.
- Проект импортирует только `shared`.
- **Общий каркас проекта.** Подгонка под размер, слежение за видимостью и очистка вынесены в `shared/lib/project-host`. Проект не пишет собственные `ResizeObserver`, `IntersectionObserver` и циклы `requestAnimationFrame`:
  - `useProjectHost()` возвращает `{ ref, size, active, onDispose }`. `ref` вешается на корневой контейнер проекта. `size` — `{ width, height, dpr }` контейнера (`null` до первого измерения), обновляется через `ResizeObserver`. `active` равен `true`, пока контейнер виден на экране и вкладка открыта (`IntersectionObserver` + `document.visibilityState`). `onDispose(fn)` регистрирует очистку проекта;
  - `useAnimationFrame(callback, active)` запускает цикл `requestAnimationFrame` только пока `active === true` и отменяет его при размонтировании;
  - при размонтировании хук сам отключает все наблюдатели и слушатели и вызывает функции из `onDispose` в обратном порядке (например, `loseContext()` для WebGL, снятие собственных слушателей);
  - проект подгоняется под размер правой области (или контейнера, в который он встроен, см. 6.2) через `size`, а вне экрана и в скрытой вкладке приостанавливается.

**Состояние загрузки**
- `loading.tsx` не используется: все страницы статические и готовы при сборке.
- Пока грузится код проекта (ленивый `import()`), в правой области показывается общий индикатор `shared/ui/PaneLoader` (текст `Loading…`, без свечения) через опцию `loading` у `next/dynamic`.

**Ошибки**
- Ошибка выполнения проекта перехватывается `app/playground/error.tsx` и не ломает левый столбец. В правой области: сообщение `Something went wrong` и кнопка `Try again` (`reset`). Состояние ошибки сбрасывается при переходе на другой slug.

**Данные проекта** (`content/projects.meta.ts`): `slug`, `title`, `description`, `createDate`, `updateDate`, `tags`. Даты на сайте **не отображаются**; `updateDate` используется как `lastmod` в sitemap (см. раздел 12).

**Порядок:** вручную, по важности. Порядок элементов массива = порядок в списке. При фильтрации относительный порядок сохраняется.

### 6.2 Articles

**Раскладка:** см. 6.0 — тот же `SplitLayout`. Левый столбец (теги + список статей + футер), справа статья в прокручиваемой области `ScrollArea`. Окно браузера не прокручивается, прокручивается только статья.

**Описания:** в списке под названием статьи показывается `description` мелким шрифтом (то же поведение, что в Playground). Всплывающих подсказок нет.

**Маршрутизация**
- `/articles` — пустое состояние, в правой области текст **Select an article** (на мобильных скрыт)
- `/articles/<slug>` — выбранная статья. Выбор **отражается в URL**.
- Левый столбец живёт в `app/articles/layout.tsx` и не перемонтируется при смене статьи. Layout серверный: читает `getArticles()` и передаёт мету в `SplitLayout`.
- Страницы статей статические: `generateStaticParams` по `getArticles()`, `dynamicParams = false`. Неизвестный slug → 404.
- Страница `/articles/<slug>` (серверная) находит мету в `getArticles()`, загружает тело через `loadArticle(slug)` и рендерит default-экспорт (серверный компонент, скомпилированный из `.md`). Метаданные страницы берутся из frontmatter (`generateMetadata`).
- Подчёркнутая статья определяется из URL (`useSelectedLayoutSegment`).
- **Заголовок статьи рендерит страница**: `<h1>{title}</h1>` из frontmatter, затем содержимое заметки. Заголовки заметки **сдвигаются на уровень вниз** (`#` → `<h2>`, `##` → `<h3>`, …, `######` остаётся `<h6>`), поэтому автор пишет заметку как обычно в Obsidian. Так на странице ровно один `<h1>`, и он совпадает с `<title>`.
- Прокруткой статьи управляет `ScrollArea` (сброс при смене статьи, восстановление при «Назад/Вперёд», фокус, см. 6.0).
- Состояние загрузки и ошибки: как в 6.1 (`PaneLoader` для тяжёлых компонентов статьи, `app/articles/error.tsx` для ошибок статьи, в том числе из MDX-компонентов; левый столбец остаётся рабочим).

**Фильтрация по тегам:** то же поведение, что в Playground (мультивыбор, **AND**, повторный клик снимает выделение, список тегов вычисляется от всех статей, `?tags=a,b`, `Suspense` с серверным списком в `fallback`, `router.replace`, неизвестные теги игнорируются, пустой результат показывает `No matches`).

**Статья, скрытая фильтром:** остаётся открытой. URL не меняется.

**Порядок:** вручную, по важности, задаётся полем `order` во frontmatter (меньше число — выше в списке).

**Формат статей (Obsidian)**

Статьи пишутся в Obsidian. Папка `src/content/articles/` открывается как хранилище. В настройках Obsidian вложения должны сохраняться «в той же папке, что и текущий файл» (Default location for new attachments → Same folder as current file).

- Каждая статья — папка `src/content/articles/<slug>/` с файлом `<slug>.md`. Имя заметки совпадает со `slug`, чтобы в Obsidian заметки различались. Вложения (изображения) лежат в той же папке.
- **`slug` = имя папки = имя файла без `.md`**, формат `^[a-z0-9]+(-[a-z0-9]+)*$`. Во frontmatter `slug` не указывается.
- **Мета живёт в YAML-frontmatter** заметки (в Obsidian это «Properties»): `title`, `description`, `tags`, `createDate`, `updateDate`, `order`. Форматы полей — раздел 7. Frontmatter не попадает в HTML.
- Obsidian пишет даты как `2026-03-14` без кавычек, YAML-парсер превращает такие значения в `Date`. Поэтому при разборе дата приводится к строке `YYYY-MM-DD` через UTC (`toISOString().slice(0, 10)`), иначе возможен сдвиг на день.
- Даты на сайте **не отображаются**; `updateDate` используется как `lastmod` в sitemap и `modifiedTime` в Open Graph, `createDate` — как `publishedTime` (см. раздел 12).
- Публикуются все папки из `src/content/articles/` при ближайшей сборке.

**Поддерживаемый синтаксис Obsidian** (реализуют `remark-gfm` и собственный `remark-obsidian`)

| Синтаксис | Результат |
|---|---|
| Markdown + GFM: таблицы, задачи `- [ ]`, сноски, зачёркивание, блоки кода | обычная разметка |
| `[[slug]]`, `[[slug\|текст]]`, `[[slug#Заголовок]]`, `[[#Заголовок]]` | внутренняя ссылка на `/articles/<slug>` (с якорем). Текст по умолчанию — `title` целевой статьи. Ссылка на несуществующую статью выводится простым текстом, в логе сборки появляется предупреждение |
| `![[image.png]]`, `![[image.png\|400]]` | изображение из папки заметки; число после `\|` — ширина в px. Размеры берутся из файла (статический импорт), сдвига вёрстки нет. Файла нет — ошибка сборки |
| `![[project:slug]]`, `![[project:slug\|500]]` | встроенный проект Playground (см. ниже); число — высота в px, по умолчанию 400 |
| `> [!note] Заголовок` (callout) | блок `Callout`. Типы: `note`, `info`, `tip`, `warning`, `danger`; неизвестный тип считается `note`. Признаки сворачивания (`+`, `-`) игнорируются |
| `==текст==` | `<mark>` |
| `%%комментарий%%` | удаляется, в HTML не попадает |

**Не поддерживается** (остаётся обычным текстом или игнорируется): встраивание заметок `![[заметка]]`, `#теги` в тексте (теги только во frontmatter), формулы `$…$`, Mermaid, Dataview, Canvas, алиасы, ссылки на блоки `[[заметка#^id]]`, raw HTML, граф и обратные ссылки.

**Проект в статье.** Чтобы дополнить статью проектом, автор вставляет в нужное место одну строку, например `![[project:particle-field]]`. Проекты необязательны.
- `remark-obsidian` превращает строку в `<Project slug="…" height={…} />` из `content/Project.tsx` (подключён в карте компонентов).
- Заметки tsc не проверяет, но неизвестный `slug` роняет **сборку**: серверный `Project` бросает ошибку при статической генерации страницы.
- **Проект запускается, когда блок попал на экран.** `Project` оборачивает проект в `shared/ui/LazyMount` (`IntersectionObserver`, `rootMargin: 200px`). Пока блок далеко от экрана, вместо проекта пустой блок заданной высоты, код проекта не загружается. После появления проект монтируется и остаётся смонтированным.
- Пока код проекта грузится, показывается `PaneLoader`.
- Вне экрана и в скрытой вкладке проект приостанавливается (`active === false` в `useProjectHost`, см. 6.1).
- Блок имеет заданную высоту и `touch-action: pan-y`.

**Компоненты.** Общие компоненты (`Callout`, `Prose`, `ArticleLink`, `ArticleImage`) лежат в `features/articles/mdx/` и подключаются централизованно через `src/mdx-components.tsx` (функция `useMDXComponents`). `ArticleLink` рендерит внутренние ссылки через `next/link`, внешние открывает в новой вкладке. `ArticleImage` — обёртка над `next/image`. Компоненты **не** знают о проектах. Контент по-прежнему считается доверенным: статьи пишет только автор проекта; JSX и raw HTML в заметках не исполняются.

```tsx
// src/mdx-components.tsx
import type { MDXComponents } from 'mdx/types'
import { Project } from '@/content/Project'
import { Callout } from '@/features/articles/mdx/Callout'
import { ArticleLink } from '@/features/articles/mdx/ArticleLink'
import { ArticleImage } from '@/features/articles/mdx/ArticleImage'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { Project, Callout, a: ArticleLink, img: ArticleImage, ...components }
}
```

### 6.3 Links

- **Плоский список** (без категорий и группировки): название и описание
- Источник: `content/links.ts` (массив `LinkEntry`)
- Поля: `title`, `description`, `url`
- `url` уникален. Сравнение после нормализации: регистр схемы и хоста не учитывается, завершающий `/` и фрагмент `#...` отбрасываются.
- Порядок = порядок элементов массива
- Все ссылки открываются в новой вкладке: `target="_blank"` и `rel="noopener noreferrer"`. Кликабелен весь блок одной ссылкой `<a>`; название подчёркивается при `hover` и `:focus-visible`.
- Страница оборачивается в `ScrollArea` (на десктопе прокручивается внутренняя область, а не окно). В конце страницы `Footer`.
- Страница `app/links/page.tsx` читает `content/links.ts` и передаёт данные компоненту из `features/links` (фича не импортирует `content`).

## 7. Организация контента

**Принципы**
- Нет категорий — только **теги** (поле `tags` у проектов и статей; у ссылок тегов нет).
- Порядок по важности: у проектов — **позиция в массиве** `projects.meta.ts`; у статей — поле `order` во frontmatter. Сортировок по датам нет.
- Список тегов в левом столбце **не хранится отдельно**, а вычисляется из **всех** элементов раздела. Теги идут в порядке первого появления.
- **`title` уникален** внутри каждого списка (проекты, статьи, ссылки). Сравнение без учёта регистра и пробелов по краям.
- **Даты — строки `YYYY-MM-DD`** (тип `string`). У каждого проекта и статьи два обязательных поля: `createDate` (создание, после публикации не меняется) и `updateDate` (последнее существенное обновление; при создании равна `createDate`). На сайте не показываются; используются в sitemap и Open Graph (раздел 12). При существенном обновлении проекта или статьи автор меняет только `updateDate`.
- **Пустые списки недопустимы:** `projects`, `articles` и `links` содержат хотя бы один элемент.
- **Контент — часть кода.** Мета, загрузчики и `.md` компилируются при `pnpm build`. При работе сервера обращений к файловой системе за контентом нет. `fs` используется только при сборке и только в `content/articles.source.ts` (чтение папок статей и frontmatter) и в `mdx-plugins/remark-obsidian.mjs`. Тесты читают файловую систему, но в приложение не попадают.
- **Целостность связей.** Для проектов её держат типы: нет загрузчика для `slug` из меты или лишний загрузчик → ошибка `tsc`; удалённая папка → ошибка `import()` на сборке. Для статей её держит сборка: некорректный frontmatter, отсутствующий `<slug>.md`, повторяющиеся `title` или `order`, отсутствующая картинка роняют `pnpm build`.

**Форматы полей** (проверяются схемами `zod` из `content/schema.ts`; для статей это поля frontmatter)

| Поле | Правила |
|---|---|
| `title` | Непустая строка после обрезки пробелов, без переводов строк, до 120 символов. Допустимы кириллица, латиница, цифры, пробелы и знаки препинания. |
| `description` | Непустая строка без переводов строк, до 300 символов (в списках показывается не более двух строк, рекомендуется до 160 символов). |
| `slug` | `^[a-z0-9]+(-[a-z0-9]+)*$`, длина 1–64. Задаётся вручную, **не выводится из `title`**. Совпадает с именем папки проекта или файла статьи. Не меняется после публикации. |
| `tags` | Массив из одного и более тегов. Каждый: `^[a-z0-9]+(-[a-z0-9]+)*$`, до 32 символов. Дубликаты внутри одного элемента запрещены. |
| `createDate` | Строка `YYYY-MM-DD`, существующая календарная дата. Не меняется после публикации. |
| `updateDate` | Строка `YYYY-MM-DD`, существующая календарная дата, не раньше `createDate`. |
| `order` | Только у статей. Целое число ≥ 1, уникально среди статей. Меньше число — выше в списке. |
| `url` | Абсолютный `http(s)`-адрес. |

**Уникальность:** `slug` уникален среди проектов и отдельно среди статей (пересечение допустимо; у статей он уникален по построению как имя папки). `title` уникален в каждом списке. `order` уникален среди статей.

**Проверки.** Отдельных скриптов нет, всё живёт в `tsc`, сборке и Vitest.

*Типы (`tsc`) и сборка:* форма записей (`satisfies`), полнота и отсутствие лишних ключей в `loaders` (`Record<Slug, Loader>`), существование файлов из `import()`, компиляция `.md` (frontmatter, wikilinks, вложения), наличие файлов шрифтов (`next/font/local`), существование `slug` в `<Project slug="…">` (падение статической генерации).

*`content/meta.test.ts`:* схема `zod` применяется к реальным манифестам проектов и ссылок и к frontmatter реальных статей (через `articles.source.ts`): форматы полей, непустые списки, существование дат, `updateDate` не раньше `createDate`, уникальность `title`, `slug` и `order`, уникальность `url` после нормализации.

*`content/integrity.test.ts`* (читает файловую систему, не попадает в бандл):
- набор папок `content/projects/*` совпадает с набором `slug` в `projects.meta.ts`, у каждой есть `index.tsx`;
- в каждой папке `content/articles/<slug>/` есть файл `<slug>.md` (остальные файлы — вложения);
- в `src/**/*.css` нет `text-shadow` (запрет свечения, см. раздел 4);
- предупреждение (`console.warn`, без падения) о тегах, встречающихся один раз, — защита от опечаток.

## 8. Деплой

- Проект деплоится на собственный сервер. Next.js работает в Node-режиме (не статический экспорт) с `output: 'standalone'` за reverse proxy (например, nginx или Caddy). Способ запуска процесса (systemd, pm2, Docker) не фиксируется.
- Контент статичен: `pnpm build` генерирует все страницы, поэтому изменение контента = пересборка и перезапуск.
- Год в футере фиксируется при сборке (см. 5). Если нужно, чтобы он обновлялся в январе без правок контента, достаточно пересобирать сайт по расписанию (например, раз в месяц).
- Редирект `/` → `/playground` задаётся через `redirects()` в `next.config` с `permanent: false` (307).
- Версия Node одна и та же на сервере и в разработке (`.nvmrc`, `engines`).

## 9. Тесты

- Юнит-тесты на Vitest, файлы `*.test.ts` лежат рядом с кодом. Команда `pnpm test`.
- Чистая логика (без React и файловой системы) живёт в `features/collection/lib` и `features/links/lib`.
- Тесты нужны там, где есть логика, а не там, где достаточно схемы:
  - вычисление списка тегов и порядка тегов (по первому появлению, от всех элементов независимо от фильтра);
  - фильтрация по тегам (**AND**: остаются элементы со всеми выбранными тегами; порядок сохраняется; пустой выбор = все элементы; комбинация без совпадений = пустой список);
  - разбор `?tags=` (неизвестные теги игнорируются, дубликаты и пустые значения отбрасываются);
  - нормализация `url` и проверка уникальности `url`;
  - поиск записи по `slug`;
  - разбор синтаксиса Obsidian (`[[…]]`, `![[…]]`, callout, `==…==`, `%%…%%`, сдвиг заголовков): тесты `mdx-plugins/remark-obsidian.test.ts` на коротких входных строках.
- Форматы полей отдельными юнит-тестами не покрываются: их проверяет схема на реальных манифестах (`meta.test.ts`). Допускается один-два теста самой схемы на граничные значения (кириллица в `title`, заглавные буквы и двойной `-` в `slug`).
- Тесты манифестов и целостности — см. раздел 7. Заглушка `server-only` не нужна: тесты не импортируют `*.loaders.ts`.
- **`pnpm check` запускает lint, typecheck, test и build.**

## 10. Страница 404

- Собственная 404: `src/app/not-found.tsx`. Стандартная страница Next.js не используется.
- Страница показывается в общем каркасе (header), текст на английском, есть ссылка на Playground, внизу содержимого `Footer`. В хедере ни один пункт навигации не подчёркнут.
- Она же отображается при неизвестном slug (`dynamicParams = false` / `notFound()`) и при несуществующем маршруте. HTTP-статус ответа — 404.

## 11. Страницы ошибок

- `app/error.tsx` — общая ошибка, header сохраняется, внизу содержимого `Footer`.
- `app/global-error.tsx` — ошибки корневого layout; содержит собственные `<html lang="ru">` и `<body>`.
- `app/playground/error.tsx` и `app/articles/error.tsx` — ошибки проекта или статьи (в том числе из MDX-компонентов): левый столбец остаётся рабочим, в правой области сообщение `Something went wrong` и кнопка `Try again` (`reset`). Состояние ошибки сбрасывается при переходе на другой slug.
- Тексты на английском, как весь интерфейс.

## 12. SEO

Минимальный набор на штатных средствах Next.js, без внешних SEO-пакетов. Метатеги `keywords` не используются.

### 12.1 Заголовки и описания

- `src/shared/config/site.ts` экспортирует `SITE_URL` (боевой домен, без завершающего `/`), `SITE_NAME` (`Gnozila`) и `SITE_YEAR` (см. 5).
- Корневой `layout.tsx` задаёт `metadataBase: new URL(SITE_URL)` и `title: { default: SITE_NAME, template: '%s · Gnozila' }`.
- `generateMetadata` есть у `/articles/<slug>` и у `/playground/<slug>`. `title` и `description` берутся из меты записи, ничего дополнительно писать автору не нужно.
- Страницы `/playground`, `/articles` и `/links` задают статические `metadata` (`title` и `description` на русском; у `/playground` и `/articles` можно использовать одно описание раздела).
- Все метаданные страниц собираются одной функцией `pageMetadata({ title, description, path, type })` из `shared/lib/seo.ts`. Она возвращает `title`, `description`, `alternates.canonical`, `openGraph` и `twitter` целиком. Это обязательно: в Next.js `openGraph` дочерней страницы заменяет родительский объект целиком, а не сливается с ним, поэтому картинку и `locale` нужно повторять в каждой странице.
- `404` и страницы ошибок: `robots: { index: false }`.

### 12.2 Canonical

- `alternates.canonical` указывает на путь **без query**: `/articles/<slug>`, `/playground/<slug>`, `/playground`, `/articles`, `/links`. Благодаря этому `?tags=…` не создаёт дубликатов в индексе.
- Адрес собирается от `metadataBase`, то есть всегда на боевом домене.

### 12.3 `sitemap.ts` и `robots.ts`

- `app/sitemap.ts` отдаёт:
  - три раздела: `/playground`, `/articles`, `/links`;
  - все проекты (`/playground/<slug>`) и все статьи (`/articles/<slug>`) из мет.
- `lastmod` проектов и статей берётся из `updateDate`. Страницы разделов без `lastmod`.
- `app/robots.ts` разрешает всё (`allow: '/'`) и содержит ссылку `sitemap: ${SITE_URL}/sitemap.xml`.
- Оба файла статичны и собираются при `pnpm build` из мет проектов и из `getArticles()`.

### 12.4 Один `<h1>` и текст в HTML

- На каждой странице ровно один `<h1>`.
- **Статья:** `<h1>{title}</h1>` рендерит страница (см. 6.2); заголовки заметки сдвигаются на уровень вниз (см. 6.2), поэтому второго `<h1>` не появится.
- **Проект:** проект рендерится с `ssr: false`, поэтому в серверном HTML от него остаётся только `PaneLoader`. Страница `/playground/<slug>` дополнительно рендерит на сервере `sr-only`-блок: `<h1>` с `title` и абзац с `description`. Блок виден скринридеру и поисковику, глазами его нет (см. 6.1).
- **Списки разделов:** на `/playground`, `/articles` и `/links` `<h1>` тоже `sr-only` (`Playground`, `Articles`, `Links`); на мобильных `/playground` и `/articles` показывают список, и он остаётся доступным.
- Список проектов и статей присутствует в статическом HTML как обычные ссылки с названием и описанием (см. 6.1, `fallback` у `Suspense`), поэтому краулер видит все страницы и их описания.

### 12.5 Open Graph и Twitter

- Картинка по умолчанию: `public/og.png`, 1200×630, подключается в `pageMetadata` как `openGraph.images` и `twitter.images`.
- `openGraph.locale: 'ru_RU'`, `openGraph.siteName: SITE_NAME`, `openGraph.url` равен canonical.
- `openGraph.type`: `article` для страниц статей (с `publishedTime` из `createDate` и `modifiedTime` из `updateDate`), `website` для остальных.
- `twitter.card: 'summary_large_image'`.
- Индивидуальные превью (`opengraph-image.tsx`) в минимальный набор не входят.

### 12.6 Проверка

- Тест `content/meta.test.ts` дополнительно проверяет, что `pageMetadata` возвращает canonical без query и что `title` не пустой (чистая функция, без Next).
- Остальное проверяется вручную после деплоя: `/sitemap.xml`, `/robots.txt`, исходный HTML страницы статьи (`<h1>`, `<title>`, canonical, `og:*`).

### 12.7 Вне кода (напоминание автору)

Не требует реализации, но входит в «минимум»: HTTPS и единый канонический хост (редирект `www` на основной домен), gzip или brotli и долгий `Cache-Control` для `/_next/static/` на уровне reverse proxy; подтверждение сайта в Яндекс Вебмастере и Google Search Console с отправкой sitemap; внешние ссылки на сайт (публикации статей на сторонних площадках со ссылкой на источник).

## 13. Открытые вопросы (проверить прототипом)

1. **`dynamic()` с загрузчиком из записи.** В `ProjectView` `next/dynamic` получает загрузчик из `Object.entries(projectLoaders)`, а не литерал `import()`. Если Next.js это не принимает, запасной вариант: `React.lazy` + `Suspense` или явная карта `slug → dynamic(() => import(…))` (полноту карты всё равно держит `Record<ProjectSlug, …>`).
2. **Прокрутка внутренней области (`ScrollArea`).** Проверить на прототипе:
   - что при `scroll={false}` Next.js не трогает прокрутку, а `ScrollArea` сбрасывает её при переходе по ссылке;
   - что «Назад/Вперёд» восстанавливает позицию из `sessionStorage` и корректно отличается от обычного перехода;
   - что перенос фокуса на область не мешает клавиатурной навигации по списку;
   - что `#heading`-якоря и печать работают во вложенном контейнере.
3. **Собственный `remark-obsidian` и сборщик.** Плагин — локальный файл, а Turbopack принимает плагины только строками-именами с сериализуемыми опциями. Проверить, что путь к локальному `.mjs` принимается. Запасной вариант: сборка через webpack (`next build --webpack`) или оформление плагина как отдельного пакета.
4. **`sr-only` `<h1>` у проектов.** Проверить, что поисковики индексируют скрытый блок так, как задумано, и что `description` в сниппете выглядит осмысленно; при необходимости добавить к странице проекта видимое описание.
6. **Obsidian и `.mdx`.** По умолчанию Obsidian не индексирует `.mdx`. Проверить способ открывать их как Markdown (настройка или плагин сообщества). Запасной вариант: писать статьи в `.md` и принимать оба расширения в `@next/mdx`, но это отход от решения «формат только `.mdx`».
7. **`remark-obsidian` на Turbopack.** Проверить: подключается ли локальный `.mjs` строкой-именем; работают ли сгенерированные импорты вложений (картинки, видео, аудио) и `next/image` со статическим импортом. Запасной вариант: вложения в `public/` и подстановка URL плагином.
8. **Obsidian-заметки и MDX.** Проверить на реальных заметках, как часто ломают сборку `{`, `}`, `<` и HTML-комментарии. Если часто, добавить предобработку текста в плагин.
9. **`mermaid` и подсветка кода.** Проверить размер подгружаемого кода `mermaid`, тему из токенов, поведение при ошибке; для `rehype-pretty-code` — что `title` и подсветка строк работают при сериализуемых опциях.
10. **Видимость внутри `ScrollArea`.** Проверить, что `IntersectionObserver` корректно учитывает обрезку прокручиваемой областью, так проекты в статье стартуют и встают на паузу вовремя.
5. **AND и пустые результаты.** Если текст `No matches` на практике раздражает, заменить его блокировкой тегов, выбор которых дал бы пустой список (`aria-disabled`, приглушённый цвет).
6. **`format: 'md'` и узлы JSX.** Проверить, что `remark-obsidian` может отдавать узлы `mdxJsxFlowElement` (`Project`, `Callout`) там, где JSX из текста не разбирается, и что raw HTML ведёт себя предсказуемо (игнорируется, а не ломает сборку).
7. **Динамический `import()` заметок.** `loadArticle` использует `import(`./articles/${slug}/${slug}.md`)` с переменной частью пути. Проверить на обоих сборщиках. Запасной вариант: генерируемая карта `slug → import()`.
8. **Картинки.** Проверить цепочку `![[file.png]]` → `remark-mdx-images` → `next/image` (статический импорт даёт `width` и `height`), включая SVG и GIF.
9. **Настройки Obsidian.** Выставить вложения «в папке текущего файла» и формат ссылок «Wikilink». Проверить, что `[[…]]` и `![[…]]`, которые вставляет сам Obsidian (автодополнение), совпадают с синтаксисом из 6.2. В частности, Obsidian может вставить `![[slug/file.png]]` вместо короткого имени файла.