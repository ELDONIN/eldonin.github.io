import localFont from 'next/font/local'

// Inter Variable: один файл покрывает regular и bold (ось weight 100–900),
// а также латиницу и кириллицу (раздел 14.2).
export const inter = localFont({
  src: './inter.woff2',
  weight: '100 900',
  variable: '--font-inter',
  display: 'swap',
})
