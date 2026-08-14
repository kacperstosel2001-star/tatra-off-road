import type { CollectionConfig } from 'payload'

export const GalleryItems: CollectionConfig = {
  slug: 'gallery-items',
  labels: { singular: 'Zdjęcie galerii', plural: 'Galeria' },
  admin: {
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'layout', 'sortOrder'],
    group: 'Treść',
  },
  access: { read: () => true },
  fields: [
    { name: 'caption', type: 'text', required: true, localized: true, label: 'Podpis' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Zdjęcie' },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'URL zdjęcia (opcjonalnie)',
      admin: { description: 'Używane, gdy nie ma uploadu w Media.' },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: '1x1',
      options: [
        { label: '1×1', value: '1x1' },
        { label: '2×1', value: '2x1' },
        { label: '1×2', value: '1x2' },
        { label: '2×2', value: '2x2' },
        { label: '3×1', value: '3x1' },
      ],
      label: 'Układ w siatce',
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Kolejność' },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Aktywne' },
  ],
}
