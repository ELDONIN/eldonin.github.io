/* eslint-disable @next/next/no-img-element -- изображения статичны, next/image не нужен (раздел 16.8) */
import type { JSX } from 'react'

/** Подключён как `img`: обычный <img> с lazy loading (раздел 16.8). */
export function ArticleMedia({ src, alt, title, width, height }: JSX.IntrinsicElements['img']) {
  return (
    <img
      src={src}
      alt={alt ?? ''}
      title={title}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
    />
  )
}
