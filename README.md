# Gnozila

Статический сайт: интерактивные визуализации (Playground), статьи (Articles) и ссылки (Links).
Публикуется на GitHub Pages по адресу `https://eldonin.github.io`.

## Стек

Next.js (App Router, статический экспорт), TypeScript, pnpm, CSS Modules, unified + KaTeX + shiki + mermaid, Vitest.

## Команды

```sh
pnpm install       # установка зависимостей
pnpm dev           # режим разработки
pnpm check         # lint + typecheck + test + build (обязателен перед публикацией)
pnpm build         # сборка статического сайта в out/
```

## Структура

- `src/app/` — маршруты, layout, страницы ошибок.
- `src/content/` — проекты, статьи, ссылки, их метаданные.
- `src/features/` — коллекция (теги/фильтр), статьи (Markdown-конвейер), ссылки.
- `src/shared/` — общее: `CanvasHost`, `Footer`, `InView`, шрифты, SEO.
- `public/` — статика (логотип, og-картинка, медиа статей).
- `references/` — read-only справочные материалы (не входят в сборку).

Полная спецификация — в `migration.md` (часть I — требования, часть II — реализация).

