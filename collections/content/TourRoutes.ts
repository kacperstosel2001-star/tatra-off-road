import type { CollectionConfig } from 'payload'

export const TourRoutes: CollectionConfig = {
  slug: 'tour-routes',
  labels: { singular: 'Trasa', plural: 'Trasy' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'difficulty', 'routeNum', 'sortOrder'],
    group: 'Treść',
    description: 'Wspólne trasy — strona główna + /trasy. Edytuj raz.',
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: 'Tytuł' },
    { name: 'routeNum', type: 'text', localized: true, label: 'Numer (np. TRASA 01)' },
    { name: 'difficulty', type: 'text', localized: true, label: 'Trudność' },
    { name: 'description', type: 'textarea', localized: true, label: 'Opis' },
    {
      type: 'row',
      fields: [
        { name: 'distance', type: 'text', localized: true, label: 'Dystans', admin: { width: '50%' } },
        { name: 'duration', type: 'text', localized: true, label: 'Czas', admin: { width: '50%' } },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Zdjęcie' },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'URL zdjęcia (opcjonalnie)',
      admin: { description: 'Używane, gdy nie ma uploadu w Media.' },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Kolejność' },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Aktywna' },
  ],
}
