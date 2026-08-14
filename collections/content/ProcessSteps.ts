import type { CollectionConfig } from 'payload'

export const ProcessSteps: CollectionConfig = {
  slug: 'process-steps',
  labels: { singular: 'Krok', plural: 'Jak to działa' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['stepNum', 'title', 'sortOrder'],
    group: 'Treść',
  },
  access: { read: () => true },
  fields: [
    { name: 'stepNum', type: 'text', required: true, label: 'Numer (np. 01)' },
    { name: 'title', type: 'text', required: true, localized: true, label: 'Tytuł' },
    { name: 'description', type: 'textarea', localized: true, label: 'Opis' },
    {
      name: 'iconName',
      type: 'select',
      defaultValue: 'phone',
      options: [
        { label: 'Telefon', value: 'phone' },
        { label: 'Tarcza', value: 'shield' },
        { label: 'Mapa', value: 'map' },
        { label: 'Aparat', value: 'camera' },
        { label: 'Gwiazda', value: 'star' },
        { label: 'Ludzie', value: 'users' },
      ],
      label: 'Ikona',
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Kolejność' },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Aktywny' },
  ],
}
