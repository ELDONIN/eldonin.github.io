import type { NextConfig } from 'next'

interface WebpackConfig {
  module: { rules: unknown[] }
}

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()) },
  // .txt-файлы проектов импортируются как строки: import text from './arts/foo.txt?raw'
  webpack(config: WebpackConfig) {
    config.module.rules.push({ test: /\.txt$/, resourceQuery: /raw/, type: 'asset/source' })
    return config
  },
}

export default nextConfig
