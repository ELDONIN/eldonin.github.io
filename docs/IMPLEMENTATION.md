# Реализация

Как сайт устроен технически (стек, архитектура, код, тесты, деплой). Требования — в [`REQUIREMENTS.md`](REQUIREMENTS.md). Код ниже — опорные схемы; актуальный код живёт в репозитории.

## 1. Технологический стек

| Область | Решение |
|---|---|
| Фреймворк | Next.js (App Router, 15+), статический экспорт (`output: 'export'`) |
| Хостинг | GitHub Pages (деплой через GitHub Actions) |
| Язык | TypeScript: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` |
| Пакетный менеджер | pnpm (версия — в `package.json` → `packageManager`) |
| Линтинг | ESLint + `typescript-eslint` (`strict-type-checked`) |
| Форматирование | Prettier |
| Стили | CSS Modules + `src/app/globals.css` (токены) |
| Тесты | Vitest |
| Статьи | Markdown через `unified` (конвейер ниже) |
| Подсветка кода | `shiki` (на сервере при сборке) |
| Диаграммы | `mermaid` (клиент, лениво) |
| Валидация | `zod` (devDependency) |

Пакеты конвейера: `unified`, `remark-parse`, `remark-gfm`, `remark-rehype`, `rehype-slug`, `rehype-callouts`, `rehype-katex`, `hast-util-to-jsx-runtime`, `unist-util-visit`, `image-size`, `server-only`.

## 2. Скрипты

```json
{
  "dev": "next dev",
  "build": "next build",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "check": "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
}
```

`pnpm check` — единая команда проверки, выполняется и в CI. Версия Node едина для CI и разработки (`.nvmrc`, `engines`).

## 3. Конфигурация Next.js

```ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()) },
}
```

- Запрещено в `next.config`: `redirects()`, `rewrites()`, `headers()`, `basePath`, `assetPrefix`.
- Запрещено в коде (требует сервера): route handlers (кроме статических GET с `dynamic = 'force-static'`), server actions, `cookies()`/`headers()`, middleware, `revalidate`/ISR, `dynamicParams = true`, серверный loader `next/image`.
- `SITE_YEAR` читает `NEXT_PUBLIC_BUILD_YEAR` **через точку** (`process.env.NEXT_PUBLIC_BUILD_YEAR`) — только такая запись подставляется Next.js.

## 4. Архитектура (слои)

```
app → content → features → shared
```

- `app` — маршруты, layout, шапка, ошибки/404. Импортирует всё.
- `content` — контент и метаданные. Импортирует `features` и `shared`, не импортирует `app`. Код проектов `content/projects/<slug>/**` импортирует **только `shared`**.
- `features` — `collection`, `articles`, `links`. Только `shared`; фичи не импортируют друг друга и не импортируют `content` (нужное передаётся параметрами).
- `shared` — `PaneLoader`, `Footer`, `InView`, `CanvasHost`, `VisuallyHidden`, хуки хоста, SEO.
- `node:fs` — только в `features/articles/lib/` и `content/articles.source.ts` (выполняется при сборке).

Фича `collection` — браузер коллекции (теги, фильтрация, список, `SplitLayout`). Playground и Articles используют её одинаково; различаются данные, базовый путь и содержимое правой области.

## 5. Модель данных

```ts
interface EntryMeta {
  slug: string        // ^[a-z0-9]+(-[a-z0-9]+)*$
  title: string       // 1..120, без переносов
  description: string // 1..300, без переносов
  createDate: string  // YYYY-MM-DD
  updateDate: string  // YYYY-MM-DD, >= createDate
  tags: readonly [string, ...string[]] // a-z0-9-, без повторов
}
```

- Проекты: `content/projects.ts` — `{ meta, load: () => import(...) }`.
- Виджеты статей: `content/widgets.ts` — `{ slug, load }` (без меты).
- Статьи: `content/articles.meta.ts`.
- Ссылки: `content/links.ts` — `{ title, description, url }`.
- Схемы — `content/schema.ts` (zod).

## 6. Вёрстка

- Токены — в `globals.css`: `--bg`, `--fg`, `--muted`, `--border`, `--accent`, `--code-bg`, `--callout-*`, `--space-*`, `--radius`, `--header-h`, `--brand-w`, `--font-*`, `--surface-*`, `--logo-*`. Тёмная тема в `:root`, светлая — `:root[data-theme='light']`.
- Неровный фон проектов — `background: var(--surface)`: радиальный блик + градиент, значения — производные от `--bg`/`--fg`; части доступны как `--surface-glow`, `--surface-top`, `--surface-bottom`. Для canvas-сцен есть `--surface-deep`: в тёмной теме заметно темнее `--bg`, в светлой — слегка серый (`#e8e6e2`), чтобы сцена отличалась от белого `--bg`.
- `SplitLayout` (feature collection) — сетка `var(--brand-w) / 1fr` (та же колонка, что у бренда в шапке); правая область Playground (проп `app`) — `height: calc(100dvh - var(--header-h)); overflow: hidden`.
- `--brand-w` — ширина колонки бренда в шапке, от неё начинается навигация. Страница Links на десктопе использует тот же отступ (`calc(var(--brand-w) + var(--space-3))`), поэтому список начинается там же, где подписи разделов; на мобильных контент снова центрируется.
- Прокрутка: Playground — правая область; Articles/Links — окно.
- Мобильные — через атрибут `data-has-selection` (CSS-переключение, без user-agent и JS-проверок ширины). На мобильных `.aside` получает `min-height: calc(100dvh - var(--header-h))`, поэтому футер (`margin-top: auto`) прижат к нижнему краю экрана, а не к концу короткого списка.
- Проза — `features/articles/ui/Prose.module.css` (селекторы `.prose …`), колонка `max-width: 64rem`, `h2–h6` с `scroll-margin-top`.
- Проекты Playground — те же токены: DOM/SVG-часть через CSS Modules, литералы только для собственной палитры (см. требования). Цвета canvas читаются из `getComputedStyle(document.documentElement)` и обновляются при смене `data-theme` (раздел 9).

## 7. Фильтрация по тегам

- Чистая логика в `features/collection/lib/`: теги по первому появлению, фильтрация (AND, порядок сохраняется), разбор `?tags=` (неизвестные игнорируются, дубликаты/пустые отбрасываются), поиск записи по `slug`.
- `CollectionList` — презентационный компонент без хуков: теги-кнопки (`aria-pressed`) + список ссылок с описаниями.
- `FilteredCollection` читает `?tags=` через `useSearchParams`, обязательно обёрнут в `Suspense` (иначе падает статический экспорт). Fallback — настоящий список (не скелетон): тот же `CollectionList` без фильтра, теги неинтерактивные.
- Клик по тегу — `router.replace(url, { scroll: false })`. Пустой результат — «No matches».

## 8. Markdown-конвейер статей

```
<slug>.md
  → remark-parse → remark-gfm
  → remarkArticleRules   (проверки + ```project → узел gnozila-project)
  → remark-rehype
  → rehypeUnwrapProject  (поднимает gnozila-project из обёртки <pre>)
  → rehype-slug          (id заголовков → якоря)
  → rehype-katex         (математика)
  → rehypeFixMathml      (валидный MathML для <msub> и т.п.)
  → rehype-callouts      ({ theme: 'obsidian' })
  → rehypeMedia          (размеры, вид медиа)
  → hast-util-to-jsx-runtime (карта компонентов)
```

- `parseArticle` (в `features/articles/lib/parse.ts`) используют и страница при сборке, и тесты — правила проверяются одинаково, ошибки указывают файл и строку.
- `remarkArticleRules` бросает ошибку (file:line) на: h1, HTML, `[[`, неверное медиа (`/media_articles/<имя>`, `^[a-z0-9][a-z0-9._-]*$`, файл существует), неверный блок `project` (`slug` обязателен и входит в список, `height` — целое 100–2000, тело пустое).
- `rehypeMedia`: `parseImageAlt(alt)` (`текст|300`, `текст|300x200`), `mediaKind` (image/video/audio), размеры изображений через `image-size` (против сдвигов вёрстки).
- Карта компонентов (`features/articles/render.tsx`): `pre → CodeBlock`, `img → ArticleMedia`, `gnozila-project → Project`.

## 9. Запуск проектов

- Canvas-проекты — через `shared/ui/CanvasHost`: создаёт `<canvas>`, следит за размером (`ResizeObserver`), крутит `requestAnimationFrame` только пока холст виден, вкладка активна и нет `prefers-reduced-motion`. Фабрика `createSketch(canvas, host)`.
- DOM/SVG-проекты — через хуки `shared/lib/host` (`useElementSize`, `useActive`).
- Встраивание в статью — `<Project slug height />` внутри `InView` (монтируется при первом пересечении видимости, `rootMargin: 200px`).
- Самодостаточные legacy-приложения допустимо запускать в iframe из `public/projects/<slug>/`, если портирование в React нецелесообразно; сейчас таких проектов нет.
- SMIL-тест — нативный React-проект: тексты вопросов и ключи — в `content/projects/smil-test/data/`, чистая логика — в `lib/` (`score.ts`, `answers.ts`, `extraScales.ts`), UI — в `ui/`. Профиль рисуется SVG вместо Flot; формат `localStorage` и экспорта совместим с legacy (`smil_answers_v1`).
- Проект не обращается к серверу; внешние данные — только клиентский `fetch` или `public/`.
- Тема: DOM/SVG-проекты переключаются автоматически через CSS-токены. Canvas-проекты читают `--surface-deep` (фон сцены) и `--fg` через `getComputedStyle(document.documentElement)`: 2D-холсты заливают фон с `ctx.globalAlpha`, WebGL — `gl.clearColor` из распарсенного токена. По `MutationObserver` на `documentElement` (`data-theme`) палитра обновляется и кадр перерисовывается; `getComputedStyle` не вызывается внутри `frame`. Для legacy-iframe (если появится) фиксированная вёрстка допустима: тема сайта в отдельный документ не наследуется.
- Загрузка — `PaneLoader` через опцию `loading` у `next/dynamic`; ошибки — `app/playground/error.tsx`.

## 10. SEO

- `shared/lib/seo.ts`: `pageMetadata` (canonical со слешем, без query/fragment, `title` не пустой), `toCanonicalPath`.
- `sitemap.ts`, `robots.ts` — статические (`dynamic = 'force-static'`).
- Статьи: `article:published_time` / `article:modified_time`.

## 11. Тесты

- Юнит-тесты чистой логики — рядом с кодом (`*.test.ts`): коллекция/теги/фильтр/`?tags=`, `normalizeUrl`, `parseImageAlt`, `mediaKind`, `computeBufferSize`, `toCanonicalPath`, правила `remarkArticleRules`, `pageMetadata`, `rehypeFixMathml`, `rehypeUnwrapProject`, подсчёт и импорт/экспорт SMIL (включая parity-фикстуры из legacy).
- `content/meta.test.ts` — zod-схемы на реальных манифестах (форматы полей, непустые списки, уникальность `title`/`slug`, уникальность `url` после нормализации, `updateDate ≥ createDate`).
- `content/integrity.test.ts` (читает ФС, в бандл не попадает): папки проектов/виджетов совпадают со слагами (у каждой `index.tsx`), статьи проходят `parseArticle` с реальными слагами и медиа, имена медиа `^[a-z0-9][a-z0-9._-]*$`, файлы в `public/` ≤ 50 МБ, есть `.nojekyll`.
- Вручную после деплоя: `/sitemap.xml`, `/robots.txt`, исходный HTML статьи (`<h1>`, canonical, `og:*`), `/` → `/playground/`, 404, сброс прокрутки, мобильная раскладка.

## 12. Деплой: GitHub Pages

- `pnpm build` создаёт `out/` (HTML, JS, CSS, медиа), который публикуется на GitHub Pages. Изменение контента = коммит в `main` = автоматическая сборка и публикация.
- `.github/workflows/deploy.yml`: push в `main` → `pnpm install --frozen-lockfile` → `pnpm check` → upload-pages-artifact (`out/`) → deploy-pages.
- Настройка: Settings → Pages → Source = **GitHub Actions**; включить «Enforce HTTPS».
- `.nojekyll` в `public/` обязателен: без него Pages игнорирует папки с `_` в начале (а `_next` — именно такая).

