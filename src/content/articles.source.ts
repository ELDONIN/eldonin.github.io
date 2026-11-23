import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const ARTICLES_DIR = path.join(process.cwd(), 'src/content/articles')
export const MEDIA_DIR = path.join(process.cwd(), 'public/media_articles')

export async function readArticleSource(slug: string): Promise<string> {
  return readFile(path.join(ARTICLES_DIR, `${slug}.md`), 'utf8')
}
