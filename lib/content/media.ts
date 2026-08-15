type MediaLike = { url?: string | null; filename?: string | null } | string | number | null | undefined

function isBrokenLocalMediaUrl(url: string, filename?: string | null) {
  const nameFromMeta = typeof filename === 'string' ? filename : ''
  if (nameFromMeta && nameFromMeta !== nameFromMeta.trim()) return true

  try {
    const path = /^https?:\/\//i.test(url) ? new URL(url).pathname : url
    const name = decodeURIComponent(path.split('/').pop() || '')
    if (!name || name !== name.trim()) return true
  } catch {
    return true
  }
  return false
}

export function resolveMediaUrl(media: MediaLike, fallbackUrl?: string | null): string {
  let url = ''
  let filename: string | null | undefined

  if (media && typeof media === 'object' && 'url' in media && media.url) {
    url = String(media.url)
    filename = 'filename' in media ? (media.filename as string | null | undefined) : undefined
  }

  if (url && isBrokenLocalMediaUrl(url, filename)) {
    url = ''
  }

  if (url) return url

  if (typeof fallbackUrl === 'string' && fallbackUrl.trim()) {
    return fallbackUrl.trim()
  }

  return ''
}
