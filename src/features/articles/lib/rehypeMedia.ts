import { readFileSync } from 'node:fs'
import path from 'node:path'
import { imageSize } from 'image-size'
import { visit } from 'unist-util-visit'
import type { Root } from 'hast'
import { mediaKind } from './mediaKind'
import { parseImageAlt } from './parseImageAlt'

export interface RehypeMediaOptions {
  mediaDir: string
}

/**
 * Для каждого img: разбирает подпись (размер), определяет вид медиа, для изображений
 * читает реальные размеры и выставляет width/height, для видео/аудио заменяет элемент
 * на video/audio с controls (раздел 16.3).
 */
export function rehypeMedia(options: RehypeMediaOptions) {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return
      const src = node.properties.src
      if (typeof src !== 'string') return

      const kind = mediaKind(src)
      if (kind !== 'image') {
        node.tagName = kind
        node.properties = { src, controls: true }
        return
      }

      const props = node.properties
      const rawAlt = typeof props.alt === 'string' ? props.alt : undefined
      const parsed = parseImageAlt(rawAlt)
      if (typeof props.alt === 'string') props.alt = parsed.alt

      const fileName = src.replace(/^\/media_articles\//, '')
      let naturalWidth: number | undefined
      let naturalHeight: number | undefined
      try {
        const dims = imageSize(readFileSync(path.join(options.mediaDir, fileName)))
        naturalWidth = dims.width
        naturalHeight = dims.height
      } catch {
        naturalWidth = undefined
        naturalHeight = undefined
      }

      if (parsed.width !== undefined && parsed.height !== undefined) {
        props.width = parsed.width
        props.height = parsed.height
      } else if (
        parsed.width !== undefined &&
        naturalWidth !== undefined &&
        naturalHeight !== undefined
      ) {
        props.width = parsed.width
        props.height = Math.round((naturalHeight * parsed.width) / naturalWidth)
      } else if (naturalWidth !== undefined && naturalHeight !== undefined) {
        props.width = naturalWidth
        props.height = naturalHeight
      }
    })
  }
}
