import type { ExtraScale } from '../data/extraScales'
import type { MainScale } from '../data/mainScales'

export type ScaleRef =
  | { readonly kind: 'main'; readonly scale: MainScale }
  | { readonly kind: 'extra'; readonly scale: ExtraScale }
