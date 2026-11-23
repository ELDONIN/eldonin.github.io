import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const compat = new FlatCompat({ baseDirectory: __dirname })

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'references/**',
      'public/**',
      'next-env.d.ts',
      'eslint.config.mjs',
      'vitest.config.mts',
      // старые файлы проекта, перенесённые в legacy/
      'legacy/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
]

