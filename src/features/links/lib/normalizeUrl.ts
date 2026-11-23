/**
 * Каноническая форма url для проверки уникальности (раздел 6.1):
 * регистр схемы и хоста не учитывается, завершающий `/` и фрагмент `#…` отбрасываются.
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  const withoutFragment = trimmed.split('#')[0] ?? trimmed
  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*:)(\/\/[^/]*)(.*)$/.exec(withoutFragment)
  if (!match) return withoutFragment
  const scheme = (match[1] ?? '').toLowerCase()
  const authority = (match[2] ?? '').toLowerCase()
  const path = (match[3] ?? '').replace(/\/+$/, '')
  return `${scheme}${authority}${path}`
}
