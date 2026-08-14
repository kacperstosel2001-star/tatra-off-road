type MediaLike = { url?: string | null } | string | number | null | undefined

export function resolveMediaUrl(media: MediaLike, fallbackUrl?: string | null): string {
  if (media && typeof media === 'object' && 'url' in media && media.url) {
    return media.url
  }
  if (typeof fallbackUrl === 'string' && fallbackUrl.trim()) {
    return fallbackUrl.trim()
  }
  return ''
}
