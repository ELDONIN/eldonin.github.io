import { InView } from '@/shared/ui/InView/InView'
import { PaneLoader } from '@/shared/ui/PaneLoader/PaneLoader'
import { ProjectView } from './ProjectView'
import { projects } from './projects'
import styles from './Project.module.css'

interface ProjectProps {
  slug: string
  height?: number
}

/** Проект, встроенный в статью: монтируется при приближении к области видимости. */
export function Project({ slug, height = 400 }: ProjectProps) {
  if (!projects.some((p) => p.meta.slug === slug)) throw new Error(`Unknown project: ${slug}`)
  return (
    <div className={styles.root} style={{ height }}>
      <InView fallback={<PaneLoader />}>
        <ProjectView slug={slug} />
      </InView>
    </div>
  )
}
