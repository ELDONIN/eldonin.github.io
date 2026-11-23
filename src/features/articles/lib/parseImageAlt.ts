export interface ImageAlt {
  alt: string
  width?: number
  height?: number
}

/**
 * Разбирает подпись картинки: `текст|300` → ширина, `текст|300x200` → ширина и высота.
 * Обычная подпись без `|` остаётся как есть; `|` без числа игнорируется (раздел 16.3).
 */
export function parseImageAlt(raw: string | null | undefined): ImageAlt {
  if (!raw) return { alt: '' }
  const pipe = raw.lastIndexOf('|')
  if (pipe < 0) return { alt: raw }
  const sizePart = raw.slice(pipe + 1)
  const match = /^(\d+)(?:x(\d+))?$/.exec(sizePart)
  if (!match) return { alt: raw }
  const width = Number(match[1])
  const height = match[2] !== undefined ? Number(match[2]) : undefined
  return { alt: raw.slice(0, pipe), width, height }
}
