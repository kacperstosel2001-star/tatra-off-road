import type { Plugin } from 'payload'
import { s3Storage } from '@payloadcms/storage-s3'

export function isS3MediaEnabled() {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      process.env.S3_ENDPOINT,
  )
}

/** Public CDN/base URL for files in a public Supabase bucket. */
export function s3PublicBaseUrl() {
  const explicit = String(process.env.S3_PUBLIC_BASE_URL || '').replace(/\/$/, '')
  if (explicit) return explicit

  const bucket = process.env.S3_BUCKET
  const endpoint = process.env.S3_ENDPOINT || ''
  // https://PROJECT.supabase.co/storage/v1/s3 → https://PROJECT.supabase.co/storage/v1/object/public/BUCKET
  const match = endpoint.match(/^(https?:\/\/[^/]+)\/storage\/v1\/s3\/?$/i)
  if (match && bucket) {
    return `${match[1]}/storage/v1/object/public/${bucket}`
  }
  return ''
}

export function createMediaStoragePlugin(): Plugin[] {
  if (!isS3MediaEnabled()) {
    console.warn(
      '[tatra] S3 media storage disabled — uploads stay on local disk and will vanish on Hostinger redeploy. Set S3_* env vars (Supabase Storage).',
    )
    return []
  }

  const bucket = process.env.S3_BUCKET as string
  const publicBase = s3PublicBaseUrl()

  console.log('[tatra] S3 media storage enabled', { bucket, endpoint: process.env.S3_ENDPOINT })

  return [
    s3Storage({
      enabled: true,
      bucket,
      collections: {
        media: {
          // Serve files from public Supabase URL instead of Hostinger disk /api/media.
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => {
            const parts = [prefix, filename].filter(Boolean).join('/')
            if (publicBase) return `${publicBase}/${parts}`
            return `/api/media/file/${parts}`
          },
        },
      },
      config: {
        forcePathStyle: true,
        region: process.env.S3_REGION || 'eu-central-1',
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
        },
      },
    }),
  ]
}
