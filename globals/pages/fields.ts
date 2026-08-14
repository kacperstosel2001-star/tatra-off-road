import type { Field } from 'payload'

export const pageSeoFields: Field[] = [
  {
    type: 'group',
    name: 'seo',
    label: 'SEO',
    fields: [
      { name: 'title', type: 'text', localized: true, label: 'Meta title' },
      { name: 'description', type: 'textarea', localized: true, label: 'Meta description' },
      { name: 'image', type: 'upload', relationTo: 'media', label: 'Obraz OG' },
    ],
  },
]

export const pageHeaderFields: Field[] = [
  {
    type: 'group',
    name: 'header',
    label: 'Nagłówek strony',
    fields: [
      { name: 'title', type: 'text', localized: true, label: 'Tytuł' },
      { name: 'description', type: 'textarea', localized: true, label: 'Opis pod tytułem' },
    ],
  },
]
