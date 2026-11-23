export const SITE_URL = 'https://eldonin.github.io'
export const SITE_NAME = 'Gnozila'
// Год последней сборки: Next.js подставляет NEXT_PUBLIC_BUILD_YEAR только при
// записи через точку (раздел 11). Фолбэк — на случай запуска вне сборки (тесты).
export const SITE_YEAR = process.env.NEXT_PUBLIC_BUILD_YEAR ?? String(new Date().getFullYear())
