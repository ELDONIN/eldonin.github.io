export type MediaKind = 'image' | 'video' | 'audio'

const VIDEO = new Set(['mp4', 'webm'])
const AUDIO = new Set(['mp3', 'ogg', 'wav', 'm4a'])

/** Определяет вид медиа по расширению файла (раздел 16.3). */
export function mediaKind(url: string): MediaKind {
  const ext = url.split('.').pop()?.toLowerCase() ?? ''
  if (VIDEO.has(ext)) return 'video'
  if (AUDIO.has(ext)) return 'audio'
  return 'image'
}
