import { describe, expect, it } from 'vitest'
import { visit } from 'unist-util-visit'
import type { Element, Root } from 'hast'
import { parseArticle } from './parse'

const options = {
  file: 'test.md',
  mediaDir: '/tmp/nonexistent-media',
  projectSlugs: ['a', 'b'],
}

function collect(tree: Root, tag: string): Element[] {
  const found: Element[] = []
  visit(tree, 'element', (node) => {
    if (node.tagName === tag) found.push(node)
  })
  return found
}

describe('rehypeFixMathml: корректный MathML', () => {
  it('msub с оператором в индексе (\u005cmin, \u005cmax) имеет ровно 2 ребёнка', () => {
    const tree = parseArticle('$N_{\\min}$, $t_{\\max}$', options)
    const subs = collect(tree, 'msub')
    expect(subs.length).toBeGreaterThan(0)
    for (const sub of subs) {
      expect(sub.children.length).toBe(2)
    }
  })

  it('обычный индекс не трогается', () => {
    const tree = parseArticle('$u_{0}$', options)
    const subs = collect(tree, 'msub')
    expect(subs).toHaveLength(1)
    expect(subs[0]?.children.length).toBe(2)
  })

  it('сложный индекс u_{N-1} остаётся с двумя детьми', () => {
    const tree = parseArticle('$u_{N-1}$', options)
    const subs = collect(tree, 'msub')
    expect(subs).toHaveLength(1)
    expect(subs[0]?.children.length).toBe(2)
  })
})
