import type { CollectionConfig } from 'payload'

function sanitizeUploadFilename(filename: string) {
  const cleaned = String(filename || 'upload')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
  return cleaned || `upload-${Date.now()}`
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media', plural: 'Media' },
  admin: {
    group: 'System',
    description:
      'Zdjęcia i filmy (MP4/WebM). Przy skonfigurowanym Supabase Storage (S3_*) pliki przeżywają redeploy Hostingera. Bez S3 lokalny dysk Hostingera czyści uploady po deployu.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeOperation: [
      ({ operation, req }) => {
        if ((operation === 'create' || operation === 'update') && req.file?.name) {
          req.file.name = sanitizeUploadFilename(req.file.name)
        }
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        console.log('[tatra] media saved', {
          operation,
          id: doc.id,
          filename: doc.filename,
          url: doc.url,
          mimeType: doc.mimeType,
        })
      },
    ],
    afterError: [
      ({ error }) => {
        const cause = (error as Error & { cause?: { code?: string; detail?: string; message?: string } }).cause
        console.error('[tatra] media afterError', error.message, cause?.code, cause?.detail || cause?.message || cause)
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Tekst alternatywny / opis',
    },
  ],
  upload: {
    staticDir: 'media',
    mimeTypes: [
      'image/*',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ],
  },
}
