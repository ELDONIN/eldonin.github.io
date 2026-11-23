import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

// KaTeX генерирует MathML, в котором имя оператора в нижнем/верхнем индексе
// (\max, \min, \deg и т.п.) распадается на <mi>…</mi><mo>⁡</mo> без обёртки <mrow>.
// Из-за этого <msub>/<msup> и т.п. получают больше детей, чем допускает MathML
// (Firefox пишет «Incorrect number of children for tag <msub/>»).
// Оборачиваем лишних детей скрипта в <mrow>, приводя дерево к валидному виду.
const SCRIPT_CHILD_COUNT: Record<string, number> = {
  msub: 2,
  msup: 2,
  mover: 2,
  munder: 2,
  msubsup: 3,
  munderover: 3,
}

export function rehypeFixMathml() {
  return (tree: Root): void => {
    visit(tree, 'element', (node: Element) => {
      const expected = SCRIPT_CHILD_COUNT[node.tagName]
      if (expected === undefined) return
      if (node.children.length <= expected) return

      const baseCount = expected - 1
      const wrapped: Element = {
        type: 'element',
        tagName: 'mrow',
        properties: {},
        children: node.children.slice(baseCount),
      }
      node.children = [...node.children.slice(0, baseCount), wrapped]
    })
  }
}
