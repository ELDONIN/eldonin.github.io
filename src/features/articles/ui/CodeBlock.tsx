import type { Element } from 'hast'
import { createHighlighter, type Highlighter } from 'shiki'
import { Mermaid } from './Mermaid'

const LANGS = [
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'css',
  'html',
  'bash',
  'python',
  'yaml',
  'md',
  'diff',
  'text',
]

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({ themes: ['github-dark'], langs: LANGS })
  return highlighterPromise
}

function findCodeElement(node: Element | undefined): Element | undefined {
  if (!node) return undefined
  return node.children.find(
    (child): child is Element => child.type === 'element' && child.tagName === 'code',
  )
}

function extractText(node: Element | undefined): string {
  if (!node) return ''
  let text = ''
  for (const child of node.children) {
    if (child.type === 'text') text += child.value
    else if (child.type === 'element') text += extractText(child)
  }
  return text
}

function extractLanguage(node: Element | undefined): string | undefined {
  const className = node?.properties.className
  const list = Array.isArray(className)
    ? className
    : typeof className === 'string'
      ? [className]
      : []
  const langClass = list.find(
    (c): c is string => typeof c === 'string' && c.startsWith('language-'),
  )
  return langClass?.slice('language-'.length).toLowerCase()
}

/** Подключён как `pre`: подсвечивает код через shiki (раздел 16.6). */
export async function CodeBlock({ node }: { node?: Element }) {
  const codeEl = findCodeElement(node)
  const lang = extractLanguage(codeEl)
  const text = extractText(codeEl)

  if (lang === 'mermaid') {
    return <Mermaid code={text} />
  }

  if (lang && LANGS.includes(lang)) {
    const highlighter = await getHighlighter()
    const html = highlighter.codeToHtml(text, { lang, theme: 'github-dark' })
    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <pre>
      <code>{text}</code>
    </pre>
  )
}
