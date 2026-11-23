import { InView } from '@/shared/ui/InView/InView'
import { PaneLoader } from '@/shared/ui/PaneLoader/PaneLoader'
import { ProjectView } from './ProjectView'
import { WidgetView } from './WidgetView'
import { projects } from './projects'
import { widgets } from './widgets'
import styles from './Project.module.css'

interface ProjectProps {
  slug: string
  height?: number
}

/**
 * Блок, встраиваемый в статью: Playground-проект (canvas, фиксированная высота)
 * или виджет статьи (DOM, минимальная высота). Монтируется при приближении к области видимости.
 */
export function Project({ slug, height = 400 }: ProjectProps) {
  const isProject = projects.some((p) => p.meta.slug === slug)
  const isWidget = widgets.some((w) => w.slug === slug)
  if (!isProject && !isWidget) throw new Error(`Unknown project: ${slug}`)
  return (
    <div
      className={isWidget ? styles.widget : styles.root}
      style={isWidget ? { minHeight: height } : { height }}
    >
      <InView fallback={<PaneLoader />}>
        {isProject ? <ProjectView slug={slug} /> : <WidgetView slug={slug} />}
      </InView>
    </div>
  )
}

