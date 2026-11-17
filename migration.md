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
- **Основа — десктоп.** Мобильная версия делается по остаточному принципу: сайт должен открываться и читаться на телефоне (ниже `768px` раскладка заменяется схемой «список → деталь», см. 6.0), но полный функционал на телефоне не гарантируется.

## 2. Технологический стек

| Область | Требование |
|---|---|
| Фреймворк | Next.js, App Router |
| Язык | TypeScript, `strict: true` + дополнительные флаги строгости: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax` |
| Пакетный менеджер | pnpm |
| Линтинг | ESLint + `typescript-eslint` с пресетом `strict-type-checked` |
| Форматирование | Prettier |
| Стили | **CSS Modules** (`*.module.css` рядом с компонентом) + один глобальный `src/app/globals.css` с токенами; см. раздел 4 |
| Тесты | Vitest (юнит-тесты и тесты целостности контента), см. разделы 7 и 9 |
| Контент статей | MDX через **`@next/mdx`**, общая карта компонентов в `src/mdx-components.tsx` |
| Вспомогательные пакеты | `@types/mdx`, `server-only` (защита серверного загрузчика статей), `zod` (**devDependency**, только схемы для тестов контента) |

**Настройка MDX**
- Конфиг Next.js: `next.config.ts` (или `next.config.mjs`): экосистема remark/rehype только ESM.
- Если сборка идёт на Turbopack, remark/rehype-плагины указываются строками-именами, а их опции должны сериализоваться.
- `pageExtensions` не расширяется: `.mdx`-файлы лежат в `src/content/articles/<slug>/` и подключаются через `import()`, маршрутами они не становятся.
- Файл `src/mdx-components.tsx` обязателен для MDX в App Router (см. 6.2).

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
- `shared` — только по-настоящему общее (`PaneLoader`, `Tooltip`, шрифты и т. п.). Не знает о `features`, `content` и `app`.
- **Фича `collection`** — «браузер коллекции»: теги, фильтрация, список, `SplitLayout`, чистые функции тегов. Playground и Articles используют её одинаково; различаются только данные и базовый путь (`/playground` и `/articles`). Дублировать вёрстку, фильтрацию (`?tags=`), tooltip и мобильную раскладку в разделах нельзя.
- **Связь статей и Playground** проходит только через слой `content`: статья встраивает проект компонентом `<Project slug="…" />`, а `.mdx`-файлы не содержат явных `import`.
- Правила проверяются линтером (`no-restricted-imports` или `eslint-plugin-boundaries`). Файлы `.mdx` линтер не видит; отсутствие в них `import` проверяет тест целостности (см. раздел 7).

### 3.2 Структура репозитория

```
Gnozila/
├── AGENTS.md
├── README.md
├── ROADMAP.md
├── migration.md
├── references/                  # read-only
├── public/
│   ├── logo.svg                 # логотип: хедер + фавикон
│   ├── og.png                   # картинка по умолчанию для соцсетей, 1200×630
│   └── articles/<slug>/         # медиа статьи
└── src/
    ├── mdx-components.tsx       # карта MDX-компонентов (требование @next/mdx); слой app
    ├── app/
    │   ├── globals.css          # reset, токены в :root, color-scheme (см. раздел 4)
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
    │   ├── schema.ts                # zod-схемы меты; импортируется ТОЛЬКО из тестов
    │   ├── projects.meta.ts         # мета проектов: чистые данные, порядок = порядок в списке
    │   ├── projects.loaders.ts      # Record<ProjectSlug, Loader>
    │   ├── articles.meta.ts         # мета статей: чистые данные
    │   ├── articles.loaders.ts      # Record<ArticleSlug, Loader>; начинается с import 'server-only'
    │   ├── links.ts                 # список ссылок
    │   ├── ProjectView.tsx          # клиентская обёртка: next/dynamic + ssr: false + PaneLoader
    │   ├── Project.tsx              # <Project slug height /> для MDX (серверный)
    │   ├── integrity.test.ts        # целостность контента и файлов (см. раздел 7)
    │   ├── meta.test.ts             # проверка манифестов схемой
    │   ├── projects/
    │   │   └── <slug>/              # имя папки = slug
    │   │       └── index.tsx        # 'use client', default-экспорт корневого компонента
    │   └── articles/
    │       └── <slug>/              # имя папки = slug
    │           └── index.mdx        # без frontmatter
    ├── features/
    │   ├── collection/
    │   │   ├── model.ts             # EntryMeta
    │   │   ├── SplitLayout.tsx
    │   │   ├── CollectionList.tsx   # презентационный список + теги (без хуков)
    │   │   ├── FilteredCollection.tsx # читает ?tags=, использует useSearchParams
    │   │   └── lib/                 # чистая логика тегов + *.test.ts
    │   ├── articles/
    │   │   └── mdx/                 # общие компоненты MDX; Prose.tsx + Prose.module.css (обёртка статьи)
    │   └── links/
    │       ├── model.ts             # LinkEntry
    │       ├── LinksList.tsx
    │       └── lib/                 # нормализация url + *.test.ts
    └── shared/
        ├── ui/
        │   ├── Tooltip/
        │   └── PaneLoader/
        ├── lib/
        │   └── seo.ts               # pageMetadata(): сборка Metadata для страниц (см. раздел 12)
        └── config/
            ├── site.ts              # SITE_URL, SITE_NAME
            └── fonts/
                ├── fonts.ts
                └── <Шрифт>-*.woff2
```

`loading.tsx` не используется (см. 6.1, «Состояние загрузки»).

### 3.3 Модель записи

Проект и статья имеют общую **мету** (то, что показывается в списке), но разное содержимое и среду выполнения: проект — программа в браузере (`canvas`, `WebGL`, `window`), статья — документ, готовящийся на сервере при сборке.

- **Мета отделена от загрузчика.** Мета — чистые сериализуемые данные, их можно передавать куда угодно (в том числе в клиентский компонент) и тестировать без MDX и без заглушек. Загрузчик — отдельная структура `Record<Slug, Loader>`.
- `EntryMeta` (`features/collection/model.ts`): `slug`, `title`, `description`, `date`, `tags`.
- `LinkEntry` (`features/links/model.ts`): `title`, `description`, `url`. Без `slug`, `date` и `tags`.
- **`slug` = имя папки** контента: `content/projects/<slug>/` и `content/articles/<slug>/`. Имя папки и `slug` не могут различаться. `slug` не меняется после публикации: это часть URL.
- Порядок элементов массива меты = порядок в списке.
- `articles.loaders.ts` начинается с `import 'server-only'`: попытка импортировать его из клиентского кода падает на сборке. `articles.meta.ts` и `projects.meta.ts` — без `server-only`.
- `Record<ProjectSlug, Loader>` с `satisfies` гарантирует на уровне `tsc`, что у каждого `slug` из меты есть загрузчик и нет лишних.
- `next/dynamic` с `ssr: false` вызывается только в клиентской обёртке `ProjectView`.

```ts
// src/features/collection/model.ts
export interface EntryMeta {
  slug: string
  title: string
  description: string
  date: string // 'YYYY-MM-DD'
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
    date: '2026-03-14',
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

```ts
// src/content/articles.meta.ts
import type { EntryMeta } from '@/features/collection/model'

export const articles = [
  {
    slug: 'best-article',
    title: 'Лучшая статья',
    description: 'Короткое описание',
    date: '2026-03-14',
    tags: ['typescript', 'architecture'],
  },
] as const satisfies readonly EntryMeta[]

export type ArticleSlug = (typeof articles)[number]['slug']
```

```ts
// src/content/articles.loaders.ts
import 'server-only'
import type { Loader } from './types'
import type { ArticleSlug } from './articles.meta'

export const articleLoaders = {
  'best-article': () => import('./articles/best-article/index.mdx'),
} as const satisfies Record<ArticleSlug, Loader>
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
import { PaneLoader } from '@/shared/ui/PaneLoader'
import { projectLoaders } from './projects.loaders'

const views: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(projectLoaders).map(([slug, load]) => [
    slug,
    dynamic(load, { ssr: false, loading: () => <PaneLoader /> }),
  ]),
)

export function ProjectView({ slug }: { slug: string }) {
  const View = views[slug]
  if (View === undefined) throw new Error(`Unknown project: ${slug}`)
  return <View />
}
```

```tsx
// src/content/Project.tsx (серверный)
import { ProjectView } from './ProjectView'
import { projectLoaders } from './projects.loaders'
import type { ProjectSlug } from './projects.meta'

export function Project({ slug, height = 400 }: { slug: ProjectSlug; height?: number }) {
  if (!(slug in projectLoaders)) throw new Error(`Unknown project: ${slug}`)
  return (
    <div style={{ height }}>
      <ProjectView slug={slug} />
    </div>
  )
}
```

Страницы статей статические, поэтому неизвестный `slug` в `<Project>` роняет **сборку**, а не рантайм.

## 4. Дизайн

- Тёмная тема.
- **Запрещено использовать эффект свечения текста** (text-shadow/glow и аналоги), если это явно не указано в задании.
- Шрифты **лежат в репозитории** в `src/shared/config/fonts/` и подключаются через `next/font/local` в `fonts.ts` (пути относительны этого файла). Внешние запросы к CDN и Google Fonts не используются. Если файла шрифта нет, падает сборка.
- Формат файлов: `woff2` или `woff` (предпочтительно `woff2`). Шрифт **обязательно содержит кириллицу и латиницу**.
- В `fonts.ts` задаются `display: 'swap'` и CSS-переменная (`variable`), которую корневой `layout.tsx` вешает на `<html>`.
- Набор начертаний ограничивается реально используемыми (например, regular и bold).
- Высота хедера задаётся одной CSS-переменной `--header-h`; от неё считаются размеры левого столбца и области проекта.

### Стили (CSS Modules)

- **Каждый компонент** со стилями имеет рядом свой `<Имя>.module.css`. Глобальных классов нет; в `globals.css` только reset, базовые стили `html`/`body`/ссылок и токены.
- **Токены** лежат в `:root` в `globals.css`: цвета (`--bg`, `--fg`, `--muted`, `--border`, `--accent`), отступы, `--header-h`, переменные шрифтов из `next/font`. Модули используют только `var(--…)`, цвета и размеры литералами не пишутся. Тема одна, `color-scheme: dark` на `<html>`.
- **Единственный брейкпоинт:** `48rem` (768px). CSS-переменные в `@media` не работают, поэтому значение повторяется в модулях, где нужно (`SplitLayout`, шапка, `Prose`), с комментарием `/* breakpoint: см. REQUIREMENTS.md, раздел 4 */`.
- **Проза статей:** один `Prose.module.css` в `features/articles/mdx/`, обёртка `Prose` оборачивает содержимое статьи; стили элементов задаются селекторами вида `.prose h2`, `.prose pre` (допустимо в CSS Modules, так как в селекторе есть локальный класс). Отдельные компоненты на каждый HTML-элемент в карте MDX не нужны.
- **Фокус:** у всех интерактивных элементов видимый `:focus-visible`.
- **Доступ к классам в TypeScript:** из-за флагов `noPropertyAccessFromIndexSignature` и `noUncheckedIndexedAccess` классы берутся через скобки: `styles['root']` (результат `string | undefined` допустим для `className`). Точечная запись `styles.root` не компилируется.
- **Запрет свечения** (см. выше) проверяет `integrity.test.ts`: ни в одном `*.css` нет `text-shadow`.

## 5. Общий каркас (layout)

### Header
- **Прилипает к верху окна** (`position: sticky; top: 0; height: var(--header-h)`).
- Слева: логотип (`public/logo.svg`) + название проекта **Gnozila**
- Затем отступ и навигация: **Playground**, **Articles**, **Links**
- Название активной страницы подчёркнуто. Активность определяется по первому сегменту пути (`useSelectedLayoutSegment` в корневом `layout`):
  - **Playground** активен на `/playground` и на любом `/playground/<slug>`;
  - **Articles** активен на `/articles` и на любом `/articles/<slug>`;
  - **Links** активен и подчёркнут на `/links`;
  - на странице 404 и других несуществующих маршрутах ни один пункт не подчёркнут.
- `/` перенаправляет на `/playground`.

### Footer
- Текст: `2026 ELDONIN`. Находится в конце страницы, под областью контента.

### Метаданные
- Фавикон: `public/logo.svg`, подключается через `metadata.icons` в корневом `layout.tsx`. Отдельный `icon.*` в `src/app/` не создаётся.
- Остальные метаданные (title, description, canonical, Open Graph, sitemap, robots) — см. раздел 12.

## 6. Страницы

### 6.0 Каркас `SplitLayout` и прокрутка

**Общая схема.** Прокручивается **страница целиком** (окно браузера), а не вложенные контейнеры. Это сохраняет штатное поведение браузера: восстановление позиции при «Назад/Вперёд», якорные ссылки `#heading` внутри статей, поиск по странице, печать.

**Десктоп (≥768px)**
- Двухколоночная сетка: левый столбец + правая область.
- **Левый столбец** — `position: sticky; top: var(--header-h); height: calc(100dvh - var(--header-h)); overflow-y: auto`. Он остаётся на месте при прокрутке страницы, а длинный список прокручивается внутри него. Прокрутка списка сохраняется при смене проекта или статьи (layout не перемонтируется).
- **Правая область** находится в обычном потоке документа. Для Articles её высота определяется статьёй. Для Playground правая область имеет высоту `calc(100dvh - var(--header-h))`, и проект занимает её целиком.
- Ссылки списка ведут на `/<раздел>/<slug>` **без** `scroll={false}`: штатная навигация Next.js возвращает страницу к началу новой статьи. Отдельный механизм сброса прокрутки не нужен.
- Клик по тегу выполняется через `router.replace(url, { scroll: false })`, чтобы фильтрация не сдвигала страницу.

**Мобильные (<768px) — схема «список → деталь»**

Принцип: основа — десктоп, мобильная версия минимальна и делается по остаточному принципу. Объём ограничен списком ниже; всё, чего в нём нет, на мобильных не делается.
- На `/playground` и `/articles` показывается только левый столбец (теги + список) на всю ширину, без sticky и без внутренней прокрутки. Правая область с текстом «Select …» скрыта.
- На `/playground/<slug>` и `/articles/<slug>` левый столбец скрыт (`display: none`, компонент остаётся смонтированным), показываются ссылка `← Back` над контентом (ведёт на `/<раздел>` с сохранением `?tags=`) и сам контент.
- Состояние определяется по `useSelectedLayoutSegment` в `SplitLayout` (атрибут `data-has-selection`) и переключается CSS.
- Tooltip создаётся только при `(hover: hover) and (pointer: fine)`; на остальных устройствах не рендерится (см. 6.1). Определение устройства по user-agent и JS-проверки ширины экрана не используются: переключение раскладки делается только CSS.
- Стили `:hover` оборачиваются в `@media (hover: hover)`, чтобы после тапа элемент не оставался «наведённым».
- **Теги** на мобильных идут **одной горизонтально прокручиваемой строкой** (`flex-wrap: nowrap; overflow-x: auto`), на десктопе переносятся на несколько строк. Разметка одна и та же (`CollectionList`), различие только в CSS.
- Пункты навигации, элементы списка и кнопка `← Back` имеют область касания не менее 44px по высоте.
- Шапка **всегда sticky**, особого поведения в ландшафте нет.
- Проект внутри статьи: обёртка `<Project>` задаёт `touch-action: pan-y`, чтобы холст не перехватывал вертикальную прокрутку страницы. Остальное поведение проектов на touch-устройствах не гарантируется, проекты не обязаны работать без мыши и клавиатуры, отдельных флагов в мете нет.
- Проза: размер шрифта не меньше 16px, `pre` и таблицы прокручиваются внутри себя (`overflow-x: auto`), изображения не шире экрана (`max-width: 100%`) и имеют `width`/`height`.

**Не делаем:** `description` на мобильных (его нет, пока нет tooltip), пометки проектов «только для десктопа», `apple-touch-icon` и PWA, `safe-area-inset`, `svh`/`dvh`-тонкости и особое поведение шапки в ландшафте, автоматические мобильные тесты (Playwright). Проверка — вручную в эмуляции DevTools.

### 6.1 Playground

Playground — это набор **интерактивных веб-визуализаций**. В списке слева отображаются только названия, при выборе названия справа открывается сам проект.

**Раскладка:** см. 6.0. Каркас общий с Articles (`features/collection/SplitLayout`).

**Маршрутизация** (устроена так же, как в Articles, см. 6.2)
- `/playground` — пустое состояние, в правой области текст **Select a project** (на мобильных скрыт, см. 6.0)
- `/playground/<slug>` — выбранный проект. Выбор **отражается в URL**.
- Левый столбец живёт в `app/playground/layout.tsx` и не перемонтируется при смене проекта. Layout серверный: он читает `content/projects.meta.ts` и передаёт мету в клиентский `SplitLayout` напрямую (в мете нет функций).
- Страницы проектов статические: `generateStaticParams` по мете, `dynamicParams = false`. Неизвестный slug → 404.
- Подчёркнутый проект определяется из URL (`useSelectedLayoutSegment`).

**Левый столбец**
- Сверху: теги
- Снизу: список проектов. Для каждого проекта показывается только `title`.
- **Tooltip с описанием:** при наведении курсора на название проекта (при удержании курсора, с небольшой задержкой около 300 мс) во всплывающем окошке показывается `description`. Окошко также открывается при фокусе с клавиатуры (`role="tooltip"`, `aria-describedby`) и закрывается по `Escape`. На touch-устройствах tooltip не показывается: тап сразу открывает проект. Tooltip не перехватывает клики и не перекрывает список целиком.
- Tooltip реализуется одним общим компонентом `shared/ui/Tooltip`, который используют и Playground, и Articles.

**Фильтрация по тегам**
- Клик по тегу: тег подчёркивается, в списке остаются только проекты с этим тегом
- Можно выбрать несколько тегов
- **Несколько тегов работают как объединение (OR)**
- Повторный клик снимает выделение
- Если ни один тег не выбран — показываются все проекты
- **Список тегов вычисляется от всех элементов раздела и не зависит от выбранного фильтра:** набор и порядок тегов не меняются, меняется только подчёркивание.
- Выбранные теги хранятся в query-параметре `?tags=a,b`, ссылки списка сохраняют текущий `?tags=`. Так как теги состоят только из `a-z`, `0-9` и `-`, дополнительное кодирование не требуется.
- Клик по тегу обновляет `?tags=` через `router.replace`, без новой записи в истории. Переход между проектами — обычная навигация с записью в истории.
- Теги из `?tags=`, которых нет в данных, игнорируются.
- Пустого результата быть не может: у каждого тега есть хотя бы один проект. Отдельное пустое состояние не нужно.

**Suspense и серверный список вместо скелетона**
- `FilteredCollection` читает `useSearchParams`, поэтому его оборачивает `Suspense`, охватывающий блок «теги + список» целиком.
- **`fallback` — не скелетон, а настоящий список**: тот же презентационный компонент `CollectionList`, отрисованный без фильтра: все теги (неинтерактивные, без подчёркивания) и все элементы обычными ссылками `<a>`. Выбранный элемент подчёркнут, потому что `SplitLayout` знает сегмент через `useSelectedLayoutSegment` (ему Suspense не нужен).
- Так ссылки на все проекты и статьи присутствуют в статическом HTML, а при гидратации подключается фильтр без сдвигов вёрстки. Разметка `fallback` и итогового блока строится одним компонентом `CollectionList`, поэтому размеры совпадают по построению.
- Отдельный компонент `ListSkeleton` не нужен.

**Выбор проекта**
- Выбранный проект в списке **подчёркивается**
- Пока проект не выбран (`/playground`), в правой области текст **Select a project**
- **Если фильтр по тегам скрыл выбранный проект, он остаётся открытым.** URL не меняется, правая область меняется только при выборе другого проекта.

**Правая область**
- Показывает **только сам проект**: интерактивная визуализация на всю область. Никакой видимой шапки, заголовка или tooltip в правой области нет (на мобильных добавляется только ссылка `← Back`, см. 6.0).
- Единственное исключение — визуально скрытый (`sr-only`) блок с `<h1>` (`title`) и абзацем (`description`) для поисковиков и скринридеров (см. раздел 12). Он рендерится на сервере страницей `/playground/<slug>`.

**Реализация проектов**
- Каждый проект — React-клиентский компонент (`'use client'`) в `content/projects/<slug>/index.tsx`, с default-экспортом корневого компонента.
- Проект регистрируется в двух местах: запись в `projects.meta.ts` и строка в `projects.loaders.ts`. Если одно из них забыто, ошибку выдаёт `tsc` (`satisfies Record<ProjectSlug, Loader>`), а папка без записи в мете — тест целостности.
- Код проекта загружается лениво и не попадает в бандл других страниц.
- Страница `/playground/<slug>` (серверная) ищет запись по `slug`; если записи нет — `notFound()`; иначе рендерит клиентскую обёртку `ProjectView` (см. 3.3).
- Проект рендерится только на клиенте (`next/dynamic` с `ssr: false`), потому что ему нужны `window`, `canvas` или `WebGL`.
- Проект импортирует только `shared`.
- Проект подгоняется под размер правой области (или контейнера, в который он встроен, см. 6.2) и корректно реагирует на её изменение (`ResizeObserver`), а при размонтировании освобождает ресурсы (анимации, слушатели, контексты WebGL).

**Состояние загрузки**
- `loading.tsx` не используется: все страницы статические и готовы при сборке.
- Пока грузится код проекта (ленивый `import()`), в правой области показывается общий индикатор `shared/ui/PaneLoader` (текст `Loading…`, без свечения) через опцию `loading` у `next/dynamic`.

**Ошибки**
- Ошибка выполнения проекта перехватывается `app/playground/error.tsx` и не ломает левый столбец. В правой области: сообщение `Something went wrong` и кнопка `Try again` (`reset`). Состояние ошибки сбрасывается при переходе на другой slug.

**Данные проекта** (`content/projects.meta.ts`): `slug`, `title`, `description`, `date`, `tags`. Поле `date` на сайте **не отображается**; оно используется как `lastmod` в sitemap (см. раздел 12).

**Порядок:** вручную, по важности. Порядок элементов массива = порядок в списке. При фильтрации относительный порядок сохраняется.

### 6.2 Articles

**Раскладка:** см. 6.0 — тот же `SplitLayout`. Левый столбец (теги + список статей), справа статья. Высота правой области определяется длиной статьи, прокручивается вся страница.

**Tooltip:** при наведении курсора на название статьи показывается tooltip с `description`: то же поведение, что в Playground (общий компонент, фокус с клавиатуры, нет на touch-устройствах).

**Маршрутизация**
- `/articles` — пустое состояние, в правой области текст **Select an article** (на мобильных скрыт)
- `/articles/<slug>` — выбранная статья. Выбор **отражается в URL**.
- Левый столбец живёт в `app/articles/layout.tsx` и не перемонтируется при смене статьи. Layout серверный: читает `content/articles.meta.ts` и передаёт мету в `SplitLayout`.
- Страницы статей статические: `generateStaticParams` по `articles.meta.ts`, `dynamicParams = false`. Неизвестный slug → 404.
- Страница `/articles/<slug>` (серверная) находит мету по `slug`, берёт загрузчик из `articles.loaders.ts`, выполняет его и рендерит default-экспорт (серверный MDX-компонент). Метаданные страницы берутся из меты (`generateMetadata`).
- Подчёркнутая статья определяется из URL (`useSelectedLayoutSegment`).
- **Заголовок статьи рендерит страница**: `<h1>{title}</h1>` из меты, затем содержимое MDX. Автор не пишет `#` (h1) в `.mdx`: заголовки внутри статьи начинаются с `##`. Так на странице ровно один `<h1>`, и он всегда совпадает с `<title>`.
- Состояние загрузки и ошибки: как в 6.1 (`PaneLoader` для тяжёлых компонентов статьи, `app/articles/error.tsx` для ошибок статьи, в том числе из MDX-компонентов; левый столбец остаётся рабочим).

**Фильтрация по тегам:** то же поведение, что в Playground (мультивыбор, OR, повторный клик снимает выделение, список тегов вычисляется от всех статей, `?tags=a,b`, `Suspense` с серверным списком в `fallback`, `router.replace`, неизвестные теги игнорируются).

**Статья, скрытая фильтром:** остаётся открытой. URL не меняется.

**Порядок:** вручную, по важности, задаётся порядком элементов в `content/articles.meta.ts`.

**Формат статей**
- Каждая статья — папка `src/content/articles/<slug>/` с файлом `index.mdx`, **без frontmatter**. Мета (`slug`, `title`, `description`, `date`, `tags`) живёт в `articles.meta.ts`.
- **`slug` = имя папки**, формат `^[a-z0-9]+(-[a-z0-9]+)*$`. Читаемое название хранится в `title`.
- Поле `date` на сайте **не отображается**; оно используется как `lastmod` в sitemap и `publishedTime` в Open Graph (см. раздел 12).
- Медиа — в `public/articles/<slug>/`.

**Компоненты в MDX**
- Корень статьи — **серверный** компонент. Интерактивные блоки внутри (вкладки, счётчик и т. п.) делаются отдельными клиентскими компонентами (`'use client'`); клиентским становится только сам блок.
- Общие компоненты лежат в `features/articles/mdx/` и подключаются централизованно через `src/mdx-components.tsx` (функция `useMDXComponents`): доступны во всех статьях **без `import`**. Они **не** знают о проектах.
- **Явные `import` в `.mdx` не используются.**
- **Встраивание проекта Playground** — компонентом `<Project slug="…" height={400} />` из `content/Project.tsx`, подключённым в карте компонентов:
  - `slug` типизирован как `ProjectSlug`, `height` по умолчанию 400;
  - компонент оборачивает проект в блок заданной высоты, проект подстраивается под него (`ResizeObserver`);
  - проект подгружается через `ProjectView`, пока он грузится, показывается `PaneLoader`;
  - `tsc` не проверяет `.mdx`, но неизвестный `slug` роняет **сборку**: серверный `Project` бросает ошибку при статической генерации страницы.
- MDX исполняет код, поэтому контент считается доверенным: статьи пишет только автор проекта.

```tsx
// src/mdx-components.tsx
import type { MDXComponents } from 'mdx/types'
import { Project } from '@/content/Project'
import { Callout } from '@/features/articles/mdx/Callout' // пример общего компонента

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { Project, Callout, ...components }
}
```

### 6.3 Links

- **Плоский список** (без категорий и группировки): название и описание
- Источник: `content/links.ts` (массив `LinkEntry`)
- Поля: `title`, `description`, `url`
- `url` уникален. Сравнение после нормализации: регистр схемы и хоста не учитывается, завершающий `/` и фрагмент `#...` отбрасываются.
- Порядок = порядок элементов массива
- Все ссылки открываются в новой вкладке: `target="_blank"` и `rel="noopener noreferrer"`. Кликабелен весь блок одной ссылкой `<a>`; название подчёркивается при `hover` и `:focus-visible`.
- Страница `app/links/page.tsx` читает `content/links.ts` и передаёт данные компоненту из `features/links` (фича не импортирует `content`).

## 7. Организация контента

**Принципы**
- Нет категорий — только **теги** (поле `tags` у проектов и статей; у ссылок тегов нет).
- Порядок по важности задаётся **позицией в массиве меты**, а не полем и не сортировкой.
- Список тегов в левом столбце **не хранится отдельно**, а вычисляется из **всех** элементов раздела. Теги идут в порядке первого появления.
- **`title` уникален** внутри каждого списка (проекты, статьи, ссылки). Сравнение без учёта регистра и пробелов по краям.
- **Даты — строки `YYYY-MM-DD`** (тип `string`). На сайте не показываются; используются в sitemap и Open Graph (раздел 12). При существенном обновлении проекта или статьи автор меняет `date`.
- **Пустые списки недопустимы:** `projects`, `articles` и `links` содержат хотя бы один элемент.
- **Контент — часть кода.** Мета, загрузчики и `.mdx` компилируются при `pnpm build`. Обращений к файловой системе за контентом в рантайме нет (`fs` не используется в коде приложения). Тесты целостности читают файловую систему, но в приложение не попадают.
- **Целостность связей держат типы:** нет загрузчика для `slug` из меты или лишний загрузчик → ошибка `tsc`; удалённая папка → ошибка `import()` на сборке.

**Форматы полей** (проверяются схемами `zod` из `content/schema.ts`)

| Поле | Правила |
|---|---|
| `title` | Непустая строка после обрезки пробелов, без переводов строк, до 120 символов. Допустимы кириллица, латиница, цифры, пробелы и знаки препинания. |
| `description` | Непустая строка без переводов строк, до 300 символов. |
| `slug` | `^[a-z0-9]+(-[a-z0-9]+)*$`, длина 1–64. Задаётся вручную, **не выводится из `title`**. Совпадает с именем папки. Не меняется после публикации. |
| `tags` | Массив из одного и более тегов. Каждый: `^[a-z0-9]+(-[a-z0-9]+)*$`, до 32 символов. Дубликаты внутри одного элемента запрещены. |
| `date` | Строка `YYYY-MM-DD`, существующая календарная дата. |
| `url` | Абсолютный `http(s)`-адрес. |

**Уникальность:** `slug` уникален среди проектов и отдельно среди статей (пересечение допустимо). `title` уникален в каждом списке.

**Проверки.** Отдельных скриптов нет, всё живёт в `tsc`, сборке и Vitest.

*Типы (`tsc`) и сборка:* форма записей (`satisfies`), полнота и отсутствие лишних ключей в `loaders` (`Record<Slug, Loader>`), существование файлов из `import()`, компиляция `.mdx`, наличие файлов шрифтов (`next/font/local`), существование `slug` в `<Project slug="…">` (падение статической генерации).

*`content/meta.test.ts`:* схема `zod` применяется к реальным манифестам: форматы полей, непустые списки, существование даты, уникальность `title` и `slug`, уникальность `url` после нормализации.

*`content/integrity.test.ts`* (читает файловую систему, не попадает в бандл):
- набор папок `content/projects/*` совпадает с набором `slug` в `projects.meta.ts`, у каждой есть `index.tsx`;
- набор папок `content/articles/*` совпадает с набором `slug` в `articles.meta.ts`, у каждой есть `index.mdx`;
- в `index.mdx` нет строк `import` и нет заголовков первого уровня `# …` (регулярка по началу строки вне блоков кода);
- картинки из `public/articles/`, на которые ссылаются статьи, существуют;
- в `src/**/*.css` нет `text-shadow` (запрет свечения, см. раздел 4);
- предупреждение (`console.warn`, без падения) о тегах, встречающихся один раз, — защита от опечаток.

## 8. Деплой

- Проект деплоится на собственный сервер. Next.js работает в Node-режиме (не статический экспорт) с `output: 'standalone'` за reverse proxy (например, nginx или Caddy). Способ запуска процесса (systemd, pm2, Docker) не фиксируется.
- Контент статичен: `pnpm build` генерирует все страницы, поэтому изменение контента = пересборка и перезапуск.
- Редирект `/` → `/playground` задаётся через `redirects()` в `next.config`.
- Версия Node одна и та же на сервере и в разработке (`.nvmrc`, `engines`).

## 9. Тесты

- Юнит-тесты на Vitest, файлы `*.test.ts` лежат рядом с кодом. Команда `pnpm test`.
- Чистая логика (без React и файловой системы) живёт в `features/collection/lib` и `features/links/lib`.
- Тесты нужны там, где есть логика, а не там, где достаточно схемы:
  - вычисление списка тегов и порядка тегов (по первому появлению, от всех элементов независимо от фильтра);
  - фильтрация по тегам (OR, порядок сохраняется, пустой выбор = все элементы);
  - разбор `?tags=` (неизвестные теги игнорируются, дубликаты и пустые значения отбрасываются);
  - нормализация `url` и проверка уникальности `url`;
  - поиск записи по `slug`.
- Форматы полей отдельными юнит-тестами не покрываются: их проверяет схема на реальных манифестах (`meta.test.ts`). Допускается один-два теста самой схемы на граничные значения (кириллица в `title`, заглавные буквы и двойной `-` в `slug`).
- Тесты манифестов и целостности — см. раздел 7. Заглушка `server-only` не нужна: тесты не импортируют `*.loaders.ts`.
- **`pnpm check` запускает lint, typecheck, test и build.**

## 10. Страница 404

- Собственная 404: `src/app/not-found.tsx`. Стандартная страница Next.js не используется.
- Страница показывается в общем каркасе (header и footer), текст на английском, есть ссылка на Playground. В хедере ни один пункт навигации не подчёркнут.
- Она же отображается при неизвестном slug (`dynamicParams = false` / `notFound()`) и при несуществующем маршруте. HTTP-статус ответа — 404.

## 11. Страницы ошибок

- `app/error.tsx` — общая ошибка, header и footer сохраняются.
- `app/global-error.tsx` — ошибки корневого layout; содержит собственные `<html lang="ru">` и `<body>`.
- `app/playground/error.tsx` и `app/articles/error.tsx` — ошибки проекта или статьи (в том числе из MDX-компонентов): левый столбец остаётся рабочим, в правой области сообщение `Something went wrong` и кнопка `Try again` (`reset`). Состояние ошибки сбрасывается при переходе на другой slug.
- Тексты на английском, как весь интерфейс.

## 12. SEO

Минимальный набор на штатных средствах Next.js, без внешних SEO-пакетов. Метатеги `keywords` не используются.

### 12.1 Заголовки и описания

- `src/shared/config/site.ts` экспортирует `SITE_URL` (боевой домен, без завершающего `/`) и `SITE_NAME` (`Gnozila`).
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
- `lastmod` проектов и статей берётся из `date`. Страницы разделов без `lastmod`.
- `app/robots.ts` разрешает всё (`allow: '/'`) и содержит ссылку `sitemap: ${SITE_URL}/sitemap.xml`.
- Оба файла статичны и собираются при `pnpm build` из мет, `fs` не используется.

### 12.4 Один `<h1>` и текст в HTML

- На каждой странице ровно один `<h1>`.
- **Статья:** `<h1>{title}</h1>` рендерит страница (см. 6.2); в `.mdx` h1 запрещён (проверяет `integrity.test.ts`).
- **Проект:** проект рендерится с `ssr: false`, поэтому в серверном HTML от него остаётся только `PaneLoader`. Страница `/playground/<slug>` дополнительно рендерит на сервере `sr-only`-блок: `<h1>` с `title` и абзац с `description`. Блок виден скринридеру и поисковику, глазами его нет (см. 6.1).
- **Списки разделов:** на `/playground`, `/articles` и `/links` `<h1>` тоже `sr-only` (`Playground`, `Articles`, `Links`); на мобильных `/playground` и `/articles` показывают список, и он остаётся доступным.
- Список проектов и статей присутствует в статическом HTML как обычные ссылки (см. 6.1, `fallback` у `Suspense`), поэтому краулер видит все страницы.

### 12.5 Open Graph и Twitter

- Картинка по умолчанию: `public/og.png`, 1200×630, подключается в `pageMetadata` как `openGraph.images` и `twitter.images`.
- `openGraph.locale: 'ru_RU'`, `openGraph.siteName: SITE_NAME`, `openGraph.url` равен canonical.
- `openGraph.type`: `article` для страниц статей (с `publishedTime` из `date`), `website` для остальных.
- `twitter.card: 'summary_large_image'`.
- Индивидуальные превью (`opengraph-image.tsx`) в минимальный набор не входят.

### 12.6 Проверка

- Тест `content/meta.test.ts` дополнительно проверяет, что `pageMetadata` возвращает canonical без query и что `title` не пустой (чистая функция, без Next).
- Остальное проверяется вручную после деплоя: `/sitemap.xml`, `/robots.txt`, исходный HTML страницы статьи (`<h1>`, `<title>`, canonical, `og:*`).

### 12.7 Вне кода (напоминание автору)

Не требует реализации, но входит в «минимум»: HTTPS и единый канонический хост (редирект `www` на основной домен), gzip или brotli и долгий `Cache-Control` для `/_next/static/` на уровне reverse proxy; подтверждение сайта в Яндекс Вебмастере и Google Search Console с отправкой sitemap; внешние ссылки на сайт (публикации статей на сторонних площадках со ссылкой на источник).

## 13. Открытые вопросы (проверить прототипом)

1. **`dynamic()` с загрузчиком из записи.** В `ProjectView` `next/dynamic` получает загрузчик из `Object.entries(projectLoaders)`, а не литерал `import()`. Если Next.js это не принимает, запасной вариант: `React.lazy` + `Suspense` или явная карта `slug → dynamic(() => import(…))` (полноту карты всё равно держит `Record<ProjectSlug, …>`).
2. **Прокрутка страницы при навигации.** Проверить на прототипе, что штатный скролл Next.js корректно возвращает страницу к началу при переходе между статьями и что «Назад/Вперёд» восстанавливает позицию при sticky-колонке.
3. **Проверка `.mdx` линтером.** `eslint-plugin-mdx` не принят; запрет `import` в статьях проверяет `integrity.test.ts`.
4. **`sr-only` `<h1>` у проектов.** Проверить, что поисковики индексируют скрытый блок так, как задумано, и что `description` в сниппете выглядит осмысленно; при необходимости добавить к странице проекта видимое описание.
5. **CSS Modules и строгие флаги TypeScript.** Доступ `styles['root']` (раздел 4) громоздок. Если это начнёт мешать, варианты: отключить `noPropertyAccessFromIndexSignature` или генерировать `.d.ts` для модулей (например, `typed-css-modules`). Решить на прототипе.