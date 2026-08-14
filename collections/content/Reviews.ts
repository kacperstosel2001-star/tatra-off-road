import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Opinia', plural: 'Opinie' },
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'rating', 'sortOrder'],
    group: 'Treść',
  },
  access: { read: () => true },
  fields: [
    { name: 'author', type: 'text', required: true, label: 'Autor' },
    { name: 'location', type: 'text', localized: true, label: 'Lokalizacja / data' },
    { name: 'content', type: 'textarea', required: true, localized: true, label: 'Treść opinii' },
    {
      name: 'rating',
      type: 'number',
      required: true,
      defaultValue: 5,
      min: 1,
      max: 5,
      label: 'Ocena (1–5)',
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Kolejność' },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Aktywna' },
  ],
}
