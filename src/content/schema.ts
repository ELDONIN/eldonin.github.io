import { z } from 'zod'

const slugSchema = z.string().min(1).max(64).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
const tagSchema = z.string().max(32).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => !Number.isNaN(Date.parse(s)))
const noNewline = (s: string) => !s.includes('\n')

export const entryMetaSchema = z
  .object({
    slug: slugSchema,
    title: z.string().min(1).max(120).refine(noNewline),
    description: z.string().min(1).max(300).refine(noNewline),
    createDate: dateSchema,
    updateDate: dateSchema,
    tags: z.array(tagSchema).min(1),
  })
  .refine((e) => e.updateDate >= e.createDate)
  .refine((e) => new Set(e.tags).size === e.tags.length)

export const linkEntrySchema = z.object({
  title: z.string().min(1).refine(noNewline),
  description: z.string().min(1).refine(noNewline),
  url: z.string().regex(/^https?:\/\//),
})
