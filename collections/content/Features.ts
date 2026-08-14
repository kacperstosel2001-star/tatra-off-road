import type { CollectionConfig } from 'payload'

export const Features: CollectionConfig = {
  slug: 'features',
  labels: { singular: 'Cecha / atut', plural: 'Dlaczego my' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'iconName', 'sortOrder'],
    group: 'Treść',
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: 'Tytuł' },
    { name: 'description', type: 'textarea', localized: true, label: 'Opis' },
    {
      name: 'iconName',
      type: 'select',
      defaultValue: 'star',
      options: [
        { label: 'Gwiazda', value: 'star' },
        { label: 'Mapa', value: 'map' },
        { label: 'Tarcza', value: 'shield' },
        { label: 'Ludzie', value: 'users' },
        { label: 'Telefon', value: 'phone' },
        { label: 'Aparat', value: 'camera' },
      ],
      label: 'Ikona',
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Kolejność' },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Aktywna' },
  ],
}
