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
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Tekst alternatywny / opis',
    },
  ],
  upload: {
    mimeTypes: [
      'image/*',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ],
  },
}
