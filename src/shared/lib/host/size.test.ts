import { describe, expect, it } from 'vitest'
import { computeBufferSize } from './size'

describe('computeBufferSize', () => {
  it('dpr=1 — размер без изменений', () => {
    expect(computeBufferSize(100, 200, 1)).toEqual({ width: 100, height: 200, dpr: 1 })
  })

  it('dpr=2 — размер удваивается', () => {
    expect(computeBufferSize(100, 200, 2)).toEqual({ width: 200, height: 400, dpr: 2 })
  })

  it('dpr ограничен значением 2', () => {
    expect(computeBufferSize(100, 200, 3)).toEqual({ width: 200, height: 400, dpr: 2 })
  })

  it('округление вверх', () => {
    expect(computeBufferSize(100.4, 200.6, 1)).toEqual({ width: 101, height: 201, dpr: 1 })
  })
})
