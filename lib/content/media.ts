type MediaLike = { url?: string | null; filename?: string | null } | string | number | null | undefined

function isUnusableMediaUrl(url: string, filename?: string | null) {
  const nameFromMeta = typeof filename === 'string' ? filename : ''
  if (nameFromMeta && nameFromMeta !== nameFromMeta.trim()) return true

  // Legacy local Payload paths — files are gone after Hostinger redeploy unless re-uploaded to S3.
  if (/\/api\/media\/file\//i.test(url)) return true

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

  // Prefer durable https URLs (Supabase public object URL, Unsplash, etc.)
  if (url && /^https?:\/\//i.test(url) && !isUnusableMediaUrl(url, filename)) {
    return url
  }

  if (typeof fallbackUrl === 'string' && fallbackUrl.trim()) {
    return fallbackUrl.trim()
  }

  if (url && !isUnusableMediaUrl(url, filename)) {
    return url
  }

  return ''
}
