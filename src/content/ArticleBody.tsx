import { projects } from './projects'
import { readArticleSource, MEDIA_DIR } from './articles.source'
import { parseArticle } from '@/features/articles/lib/parse'
import { renderArticle } from '@/features/articles/render'
import { Prose } from '@/features/articles/ui/Prose'
import { CodeBlock } from '@/features/articles/ui/CodeBlock'
import { ArticleMedia } from '@/features/articles/ui/ArticleMedia'
import { Project } from './Project'

export async function ArticleBody({ slug }: { slug: string }) {
  const source = await readArticleSource(slug)
  const tree = parseArticle(source, {
    file: `${slug}.md`,
    mediaDir: MEDIA_DIR,
    projectSlugs: projects.map((p) => p.meta.slug),
  })
  return (
    <Prose>
      {renderArticle(tree, {
        pre: CodeBlock,
        img: ArticleMedia,
        'gnozila-project': ({ slug, boxHeight }) => <Project slug={slug} height={boxHeight} />,
      })}
    </Prose>
  )
}

