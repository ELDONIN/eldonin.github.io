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
      'next-env.d.ts',
      'eslint.config.mjs',
      'vitest.config.mts',
      // legacy: старые проекты до переноса в src/content/projects/<slug>/
      'strange_attractors/**',
      'imposing_clocks/**',
      'game_of_life_on_toroid_gpu/**',
      'ascii_collection/**',
      'parasocial_silly_cat/**',
      'spoc_virtualbox/**',
      'afterlife_experiment/**',
      'cool_links/**',
      '-backgrounds/**',
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

