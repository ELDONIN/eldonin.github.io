import type { ReactNode } from 'react'
import { projects } from '@/content/projects'
import { SplitLayout } from '@/features/collection/SplitLayout'

export default function PlaygroundLayout({ children }: { children: ReactNode }) {
  return (
    <SplitLayout entries={projects.map((p) => p.meta)} basePath="/playground" app>
      {children}
    </SplitLayout>
  )
}
