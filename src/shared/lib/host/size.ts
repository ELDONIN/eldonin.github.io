export interface BufferSize {
  width: number
  height: number
  dpr: number
}

/** Размер буфера холста: ceil(css × dpr), dpr ограничен 2 (раздел 17). */
export function computeBufferSize(
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
): BufferSize {
  const dpr = Math.min(devicePixelRatio, 2)
  return {
    width: Math.ceil(cssWidth * dpr),
    height: Math.ceil(cssHeight * dpr),
    dpr,
  }
}
