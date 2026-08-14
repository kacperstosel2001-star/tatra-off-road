import type { GlobalConfig } from 'payload'
import { pageHeaderFields, pageSeoFields } from './fields'

export const TrasyPage: GlobalConfig = {
  slug: 'trasy-page',
  label: 'Trasy',
  admin: { group: 'Strony' },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    ...pageSeoFields,
    ...pageHeaderFields,
    {
      type: 'group',
      name: 'extra',
      label: 'Dodatkowa sekcja',
      fields: [
        { name: 'eyebrow', type: 'text', localized: true, label: 'Eyebrow' },
        { name: 'title', type: 'textarea', localized: true, label: 'Tytuł' },
        { name: 'description', type: 'textarea', localized: true, label: 'Opis' },
        {
          name: 'blocks',
          type: 'array',
          label: 'Bloki',
          labels: { singular: 'Blok', plural: 'Bloki' },
          fields: [
            { name: 'title', type: 'text', required: true, localized: true, label: 'Tytuł' },
            { name: 'description', type: 'textarea', localized: true, label: 'Opis' },
            { name: 'image', type: 'upload', relationTo: 'media', label: 'Zdjęcie' },
            { name: 'imageUrl', type: 'text', label: 'URL zdjęcia (opcjonalnie)' },
          ],
        },
      ],
    },
  ],
}
