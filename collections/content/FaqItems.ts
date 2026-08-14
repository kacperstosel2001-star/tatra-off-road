import type { CollectionConfig } from 'payload'

export const FaqItems: CollectionConfig = {
  slug: 'faq-items',
  labels: { singular: 'Pytanie FAQ', plural: 'FAQ' },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'sortOrder'],
    group: 'Treść',
    description: 'Wspólne FAQ — home + cennik. Edytuj raz.',
  },
  access: { read: () => true },
  fields: [
    { name: 'question', type: 'text', required: true, localized: true, label: 'Pytanie' },
    { name: 'answer', type: 'textarea', required: true, localized: true, label: 'Odpowiedź' },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Kolejność' },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Aktywne' },
  ],
}
