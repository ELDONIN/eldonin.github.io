import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseArticle } from '@/features/articles/lib/parse'
import { articles } from './articles.meta'
import { projects } from './projects'

const ROOT = process.cwd()
const PROJECTS_DIR = path.join(ROOT, 'src/content/projects')
const ARTICLES_DIR = path.join(ROOT, 'src/content/articles')
const MEDIA_DIR = path.join(ROOT, 'public/media_articles')

function walk(dir: string): string[] {
  const result: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) result.push(...walk(full))
    else result.push(full)
  }
  return result
}

describe('целостность контента', () => {
  it('папки проектов совпадают с meta.slug и содержат index.tsx', () => {
    const slugs = new Set(projects.map((p) => p.meta.slug))
    const dirs = readdirSync(PROJECTS_DIR).filter((d) => !d.startsWith('.'))
    expect(new Set(dirs)).toEqual(slugs)
    for (const slug of slugs) {
      expect(existsSync(path.join(PROJECTS_DIR, slug, 'index.tsx'))).toBe(true)
    }
  })

  it('файлы статей совпадают со slug в мете (скрытые не учитываются)', () => {
    const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'))
    const slugs = new Set(articles.map((a) => a.slug))
    expect(new Set(files.map((f) => f.replace(/\.md$/, '')))).toEqual(slugs)
  })

  it('каждая статья проходит parseArticle', () => {
    for (const a of articles) {
      const source = readFileSync(path.join(ARTICLES_DIR, `${a.slug}.md`), 'utf8')
      expect(() =>
        parseArticle(source, {
          file: `${a.slug}.md`,
          mediaDir: MEDIA_DIR,
          projectSlugs: projects.map((p) => p.meta.slug),
        }),
      ).not.toThrow()
    }
  })

  it('имена файлов медиа соответствуют правилу', () => {
    for (const name of readdirSync(MEDIA_DIR)) {
      expect(name).toMatch(/^[a-z0-9][a-z0-9._-]*$/)
    }
  })

  it('файлы в public/ не крупнее 50 МБ', () => {
    for (const file of walk(path.join(ROOT, 'public'))) {
      const size = statSync(file).size
      expect(size, `${file} крупнее 50 МБ`).toBeLessThanOrEqual(50 * 1024 * 1024)
    }
  })

  it('в public/ есть .nojekyll', () => {
    expect(existsSync(path.join(ROOT, 'public', '.nojekyll'))).toBe(true)
  })
})
