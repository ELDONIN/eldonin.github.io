import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Header } from './Header'
import { SITE_NAME, SITE_URL } from '@/shared/config/site'
import './globals.css'
import 'katex/dist/katex.min.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: 'Интерактивные веб-визуализации, статьи и ссылки.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){}})()",
          }}
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
