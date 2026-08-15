import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media', plural: 'Media' },
  admin: {
    group: 'System',
    description: 'Zdjęcia i filmy (MP4/WebM). Podpinaj je w Stronach / Treści — nie wklejaj URL w wielu miejscach, jeśli możesz użyć uploadu.',
  },
  access: {
    read: () => true,
  },
  hooks: {
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
    mimeTypes: [
      'image/*',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ],
  },
}
