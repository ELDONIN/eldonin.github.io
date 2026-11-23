export interface EntryMeta {
  slug: string
  title: string
  description: string
  createDate: string // 'YYYY-MM-DD'
  updateDate: string // 'YYYY-MM-DD', >= createDate
  tags: readonly [string, ...string[]]
}
