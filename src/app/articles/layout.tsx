import type { ReactNode } from 'react'
import { articles } from '@/content/articles.meta'
import { SplitLayout } from '@/features/collection/SplitLayout'

export default function ArticlesLayout({ children }: { children: ReactNode }) {
  return (
    <SplitLayout entries={articles} basePath="/articles">
      {children}
    </SplitLayout>
  )
}
