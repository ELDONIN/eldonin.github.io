import { visit } from 'unist-util-visit'
import type { Element, Root } from 'hast'

/**
 * mdast-util-to-hast применяет `data.hName` к внутреннему `<code>`, а не к `<pre>`,
 * поэтому блок ```project превращается в <pre><gnozila-project/></pre>.
 * Компонент `pre` (CodeBlock) ищет внутри `<code>` и рендерит пустой блок,
 * «проглатывая» виджет. Здесь поднимаем gnozila-project на место <pre>.
 */
export function rehypeUnwrapProject() {
  return (tree: Root): void => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || index === undefined || parent === undefined) return
      const project = node.children.find(
        (child): child is Element =>
          child.type === 'element' && child.tagName === 'gnozila-project',
      )
      if (project === undefined) return
      // Убираем служебные атрибуты, оставленные mdast-util-to-hast от <code>.
      delete project.properties.className
      delete project.data
      parent.children[index] = project
    })
  }
}
