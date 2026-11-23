# AGENTS.md

Правила для агентов (AI-ассистентов), работающих с этим репозиторием.

## Обязательно

- Полная спецификация — в `migration.md`. При расхождении с кодом правильной считается **Часть I** (требования).
- Перед завершением любой правки запускай `pnpm check` (lint + typecheck + test + build) и добивайся нуля ошибок.
- Единая команда проверки — только `pnpm check`. Отдельных скриптов-проверок не создавай.

## Архитектура

Слои импортов: `app → content → features → shared`.

- `content/projects/<slug>/**` импортирует только `shared`.
- `features` не импортирует `content` и другие фичи; всё нужное от контента передаётся параметрами.
- Доступ к `node:fs` — только в `features/articles/lib/` и `content/articles.source.ts`.
- `references/` — read-only, исключён из tsc, ESLint и Prettier.

## Контент

- `slug` не менять после публикации. Проекты и статьи регистрируются в метаданных
  (`content/projects.ts`, `content/articles.meta.ts`), порядок — по важности.
- Статьи — Markdown в `content/articles/` (vault Obsidian). Без frontmatter, без `# ` (h1),
  без HTML, без wikilinks, медиа только `/media_articles/<имя>`.
- Медиа кладётся в `public/media_articles/` вручную (не перетаскиванием в Obsidian).

## Стиль

- Тёмная тема, без свечения (без `text-shadow`/glow).
- Цвета и размеры только через токены из `globals.css` (литералы не писать).
- Брейкпоинт один: `48rem` (768px).
