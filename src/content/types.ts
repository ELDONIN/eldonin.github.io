import type { ComponentType } from 'react'
import type { EntryMeta } from '@/features/collection/model'

export type Loader = () => Promise<{ default: ComponentType }>

export interface ProjectEntry {
  meta: EntryMeta
  load: Loader
}
