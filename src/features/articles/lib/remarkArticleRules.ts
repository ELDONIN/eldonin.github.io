import { existsSync } from 'node:fs'
import path from 'node:path'
import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

const MEDIA_NAME = /^[a-z0-9][a-z0-9._-]*$/

export interface RemarkArticleRulesOptions {
  file: string
  mediaDir: string
  projectSlugs: readonly string[]
}

/**
 * Проверяет запреты раздела 7.4 и превращает корректный блок ```project
 * в узел с hName 'gnozila-project' (раздел 16.2).
 */
export function remarkArticleRules(options: RemarkArticleRulesOptions) {
  return (tree: Root) => {
    const fail = (line: number | undefined, message: string): never => {
      const lineText = line === undefined ? '?' : String(line)
      throw new Error(`${options.file}:${lineText}: ${message}`)
    }

    visit(tree, 'heading', (node) => {
      if (node.depth === 1) fail(node.position?.start.line, 'заголовок первого уровня (#) запрещён')
    })

    visit(tree, 'html', (node) => {
      fail(node.position?.start.line, 'HTML в Markdown запрещён')
    })

    visit(tree, 'text', (node) => {
      if (node.value.includes('[[')) fail(node.position?.start.line, 'wikilinks [[…]] запрещены')
    })

    visit(tree, 'image', (node) => {
      const url = node.url
      const match = /^\/media_articles\/([^/]+)$/.exec(url)
      if (!match) {
        fail(node.position?.start.line, `медиа должно быть вида /media_articles/<имя>, получено: ${url}`)
      }
      const name = match?.[1] ?? ''
      if (!MEDIA_NAME.test(name)) fail(node.position?.start.line, `неверное имя файла медиа: ${name}`)
      if (!existsSync(path.join(options.mediaDir, name))) {
        fail(node.position?.start.line, `файл медиа не существует: ${name}`)
      }
    })

    visit(tree, 'code', (node) => {
      if (node.lang !== 'project') return
      const line = node.position?.start.line
      if (node.value.trim() !== '') fail(line, 'блок project: тело должно быть пустым')
      const meta = parseProjectMeta(node.meta, line, fail, options.projectSlugs)
      node.data = {
        hName: 'gnozila-project',
        hProperties: { slug: meta.slug, boxHeight: meta.height },
      }
    })
  }
}

function parseProjectMeta(
  meta: string | null | undefined,
  line: number | undefined,
  fail: (line: number | undefined, message: string) => never,
  projectSlugs: readonly string[],
): { slug: string; height: number } {
  const params: Record<string, string> = {}
  if (meta) {
    for (const part of meta.trim().split(/\s+/)) {
      if (part === '') continue
      const eq = part.indexOf('=')
      if (eq < 0) fail(line, `блок project: неверный параметр «${part}»`)
      const key = part.slice(0, eq)
      const value = part.slice(eq + 1)
      params[key] = value
    }
  }

  for (const key of Object.keys(params)) {
    if (key !== 'slug' && key !== 'height') {
      fail(line, `блок project: недопустимый параметр «${key}»`)
    }
  }

  const slug = params['slug']
  if (!slug) fail(line, 'блок project: обязателен параметр slug')
  if (!projectSlugs.includes(slug)) fail(line, `блок project: неизвестный проект «${slug}»`)

  let height = 400
  if (params['height'] !== undefined) {
    const parsed = Number(params['height'])
    if (!Number.isInteger(parsed) || parsed < 100 || parsed > 2000) {
      fail(line, 'блок project: height должен быть целым числом от 100 до 2000')
    }
    height = parsed
  }

  return { slug, height }
}
