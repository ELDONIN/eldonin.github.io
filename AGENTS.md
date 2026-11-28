# AGENTS.md

Правила и контекст для AI-ассистентов, работающих с этим репозиторием.

## Обязательно

- Требования — в `docs/REQUIREMENTS.md`, реализация — в `docs/IMPLEMENTATION.md`. При расхождении с кодом правильными считаются **требования**.
- Единственная команда проверки — `pnpm check` (lint + typecheck + test + build). Перед завершением любой правки запускай её и добивайся нуля ошибок. Отдельных скриптов-проверок не создавай.
- Не меняй `slug` существующих проектов/статей/виджетов после публикации — ломаются URL и ссылки.
- Медиа статей — только в `public/media_articles/`, имена `^[a-z0-9][a-z0-9._-]*$`.

## Архитектура (слои импортов)

```
app → content → features → shared
```

- `app` — маршруты, layout, шапка, страницы ошибок/404. Импортирует всё.
- `content` — контент и метаданные (`projects.ts`, `widgets.ts`, `articles.meta.ts`, `links.ts`, чтение статей). Импортирует `features` и `shared`, не импортирует `app`. Код проектов `content/projects/<slug>/**` импортирует **только `shared`**.
- `features` — переиспользуемая логика (`collection`, `articles`, `links`). Импортирует только `shared`; фичи не импортируют друг друга и не импортируют `content` — нужное передаётся параметрами.
- `shared` — общее (`CanvasHost`, `Footer`, `InView`, `PaneLoader`, `VisuallyHidden`, хуки хоста, SEO). Ничего не знает о верхних слоях.
- `node:fs` — только в `features/articles/lib/` и `content/articles.source.ts` (выполняется при сборке).

## Контент

- **Статья** — Markdown в `content/articles/<slug>.md`. Запрещено: frontmatter, `#` (h1), HTML, `[[wikilinks]]`. Медиа — `/media_articles/<имя>`. Встраивание проекта/виджета — ```` ```project slug=<slug> height=<px> ````.
- **Проект (Playground)** — React-компонент. Canvas — через `shared/ui/CanvasHost` (фабрика `createSketch`); DOM/SVG — через хуки `shared/lib/host` (`useElementSize`, `useActive`). Прямое использование `requestAnimationFrame`/`ResizeObserver`/`IntersectionObserver` в `content/projects/**` запрещено линтером (исключение — `eslint-disable` с причиной). Самодостаточные legacy-приложения допустимо запускать в iframe из `public/projects/<slug>/`, если портирование в React нецелесообразно.
- **Виджет статьи** — `content/widgets/<slug>/index.tsx` (клиентский компонент; в реестре только `slug` и `load`, без меты). Встраивается блоком ```` ```project ````, в Playground не попадает.

## Стиль

- Цвета и размеры — только через токены из `src/app/globals.css` (`--bg`, `--fg`, `--muted`, `--border`, `--accent`, `--code-bg`, `--callout-*`, `--space-*`, `--radius`, `--header-h`, `--font-*`, `--surface-*`, `--logo-*`). Литералы не писать (кроме явно оговорённых для отдельных проектов).
- Тёмная тема по умолчанию + светлая (`:root[data-theme='light']`). Переключатель — в шапке, выбор хранится в `localStorage`.
- Проекты Playground по возможности используют те же токены и переключаются вместе с темой сайта; собственная палитра — только как часть замысла (см. `docs/REQUIREMENTS.md`).
- Один брейкпоинт: `48rem` (768px).
- `:hover` — только внутри `@media (hover: hover)`; `:focus-visible` у всех интерактивных элементов; без свечения (`text-shadow`/glow).

## Тесты

- Чистая логика — юнит-тесты рядом с кодом (`*.test.ts`).
- Целостность — `src/content/meta.test.ts` (zod-схемы на реальных манифестах) и `src/content/integrity.test.ts` (папки/файлы совпадают со слагами, статьи проходят парсер, файлы в `public/` не крупнее 50 МБ).
