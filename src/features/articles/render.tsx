import type { ComponentType, ReactNode } from 'react'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { toJsxRuntime, type Components } from 'hast-util-to-jsx-runtime'
import type { Root } from 'hast'

export interface GnozilaProjectProps {
  slug: string
  boxHeight: number
}

export type ArticleComponents = Partial<Components> & {
  'gnozila-project'?: ComponentType<GnozilaProjectProps>
}

/** Превращает hast-дерево статьи в React-элементы (раздел 16.4). */
export function renderArticle(tree: Root, components: ArticleComponents): ReactNode {
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components,
    passNode: true,
  }) as ReactNode
}
