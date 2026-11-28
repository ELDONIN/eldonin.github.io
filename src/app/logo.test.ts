import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

function faviconParts(): { path: string; radius: string } {
  const source = readFileSync(path.join(ROOT, 'public/favicon.svg'), 'utf8')
  const logoPath = /<path[^>]*\sd="([^"]+)"/.exec(source)?.[1]
  const radius = /<circle[^>]*\sr="([^"]+)"/.exec(source)?.[1]
  if (!logoPath || !radius) throw new Error('favicon.svg: не найдены path или circle')
  return { path: logoPath, radius }
}

function headerParts(): { path: string; radius: string } {
  const source = readFileSync(path.join(ROOT, 'src/app/Header.tsx'), 'utf8')
  const logoPath = /const LOGO_PATH =\n {2}'([^']+)'/.exec(source)?.[1]
  const radius = /<circle[^>]*\sr="([^"]+)"/.exec(source)?.[1]
  if (!logoPath || !radius) throw new Error('Header.tsx: не найдены LOGO_PATH или circle')
  return { path: logoPath, radius }
}

describe('логотип в шапке', () => {
  it('совпадает по геометрии с public/favicon.svg', () => {
    expect(headerParts()).toEqual(faviconParts())
  })
})
