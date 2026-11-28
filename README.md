# Gnozila

Статический сайт с интерактивными веб-визуализациями (**Playground**), статьями (**Articles**) и ссылками (**Links**). Публикуется на GitHub Pages.

## Стек

- **Next.js** (App Router, статический экспорт `output: 'export'`), **TypeScript** (strict).
- **pnpm** (версия зафиксирована в `package.json` → `packageManager`).
- **CSS Modules** + токены в `src/app/globals.css`.
- Статьи: **Markdown** через `unified` + KaTeX (математика), shiki (подсветка кода), mermaid (диаграммы), callouts.
- Тесты: **Vitest**. Линтинг/формат: **ESLint** (`strict-type-checked`), **Prettier**.

## Команды

```sh
pnpm install   # установка зависимостей
pnpm dev       # dev-сервер
pnpm check     # lint + typecheck + test + build — обязателен перед публикацией
pnpm build     # статический экспорт в out/
```

## Структура

```text
Gnozila/
├── .github/workflows/deploy.yml   # CI: pnpm check → публикация на GitHub Pages
├── .nvmrc                         # версия Node (единая для CI и разработки)
├── eslint.config.mjs
├── next.config.ts                 # output: 'export', trailingSlash
├── tsconfig.json
├── vitest.config.mts
├── package.json
├── pnpm-lock.yaml
├── README.md
├── AGENTS.md                      # правила для AI-ассистентов
├── docs/
│   ├── REQUIREMENTS.md            # требования (что должен делать сайт)
│   ├── IMPLEMENTATION.md          # архитектура и реализация
│   └── ROADMAP.md                 # идеи на будущее
├── public/                        # копируется в out/ как есть
│   ├── .nojekyll
│   ├── favicon.svg                # favicon
│   ├── og.png                     # 1200×630 (Open Graph)
│   ├── media_articles/            # медиа статей (картинки/видео/аудио/PDF)
│   └── projects/<slug>/           # ассеты проектов (шрифты, спрайты, v86)
├── references/                    # read-only справочные материалы (вне сборки)
└── src/
    ├── app/                       # маршруты, layout, шапка, страницы ошибок
    │   ├── globals.css            # reset + токены + каркас документа
    │   ├── layout.tsx             # <html>, <Header>, <main>
    │   ├── Header.tsx / Header.module.css
    │   ├── page.tsx               # / → /playground/
    │   ├── sitemap.ts, robots.ts
    │   ├── error.tsx, global-error.tsx, not-found.tsx
    │   ├── playground/            # Playground (список + [slug])
    │   ├── articles/              # Articles (список + [slug])
    │   └── links/                 # Links
    ├── content/                   # контент и его метаданные
    │   ├── projects.ts            # реестр проектов Playground
    │   ├── widgets.ts             # реестр виджетов статей
    │   ├── articles.meta.ts       # реестр статей
    │   ├── articles.source.ts     # чтение .md (node:fs, при сборке)
    │   ├── links.ts               # ссылки
    │   ├── schema.ts, types.ts    # zod-схемы и типы
    │   ├── ArticleBody.tsx        # рендер статьи
    │   ├── Project.tsx / ProjectView.tsx / WidgetView.tsx
    │   ├── articles/<slug>.md     # статьи (Markdown, vault Obsidian)
    │   ├── projects/<slug>/       # код проектов
    │   └── widgets/<slug>/        # код виджетов статей
    ├── features/                  # переиспользуемая функциональность
    │   ├── collection/            # теги, фильтрация, списки, SplitLayout
    │   ├── articles/              # Markdown-конвейер и его компоненты
    │   └── links/                 # список ссылок
    └── shared/                    # общее (не знает про верхние слои)
        ├── config/site.ts         # SITE_URL, SITE_NAME, SITE_YEAR
        ├── lib/host/              # useElementSize, useActive, size
        ├── lib/seo.ts             # pageMetadata, canonical
        └── ui/                    # CanvasHost, Footer, InView, PaneLoader, VisuallyHidden
```

## Как добавить контент

- **Проект (Playground):** создай `src/content/projects/<slug>/index.tsx` (`export default function Project()`), зарегистрируй в `src/content/projects.ts`, ассеты положи в `public/projects/<slug>/`.
- **Статья:** добавь `src/content/articles/<slug>.md` и запись в `src/content/articles.meta.ts`. Без frontmatter, без `#` (h1), без HTML, без `[[wikilinks]]`; медиа — `/media_articles/<имя>` (файл — в `public/media_articles/`).
- **Ссылка:** добавь запись в `src/content/links.ts`.
- **Виджет статьи:** `src/content/widgets/<slug>/index.tsx` + реестр `src/content/widgets.ts`; в статью вставляется блоком ```` ```project slug=<slug> height=<px> ````.

## Документация

- Требования — [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).
- Архитектура и реализация — [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md).
- Идеи на будущее — [`docs/ROADMAP.md`](docs/ROADMAP.md).
- Правила для AI — [`AGENTS.md`](AGENTS.md).

