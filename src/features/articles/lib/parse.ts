import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeKatex from 'rehype-katex'
import rehypeCallouts from 'rehype-callouts'
import type { Root } from 'hast'
import { remarkArticleRules } from './remarkArticleRules'
import { rehypeMedia } from './rehypeMedia'
import { rehypeFixMathml } from './rehypeFixMathml'
import { rehypeUnwrapProject } from './rehypeUnwrapProject'

export interface ParseOptions {
  file: string
  mediaDir: string
  projectSlugs: readonly string[]
}

/** Единый конвейер Markdown → hast (раздел 16.1). */
export function parseArticle(source: string, options: ParseOptions): Root {
  if (source.startsWith('---')) throw new Error(`${options.file}: frontmatter запрещён`)

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkArticleRules, options)
    .use(remarkRehype)
    .use(rehypeUnwrapProject)
    .use(rehypeSlug)
    .use(rehypeKatex)
    .use(rehypeFixMathml)
    .use(rehypeCallouts, { theme: 'obsidian' })
    .use(rehypeMedia, options)

  return processor.runSync(processor.parse(source))
}
