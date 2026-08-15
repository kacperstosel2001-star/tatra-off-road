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
      'Zdjęcia i filmy (MP4/WebM). Na Hostingerze pliki znikają po redeployu — do trwałej treści lepiej używaj pól „URL obrazu”, albo podepnij storage S3. Unikaj nazw ze spacją na początku.',
  },
  access: {
    read: () => true,
  },
  hooks: {
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
    // Relative to process.cwd() — avoid importing node:path here (breaks Next client graph).
    staticDir: 'media',
    filename: ({ filename }) => sanitizeUploadFilename(filename),
    mimeTypes: [
      'image/*',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ],
  },
}
