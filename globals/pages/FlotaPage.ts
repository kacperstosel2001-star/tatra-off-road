import type { GlobalConfig } from 'payload'
import { pageHeaderFields, pageSeoFields } from './fields'

export const FlotaPage: GlobalConfig = {
  slug: 'flota-page',
  label: 'Flota',
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
      name: 'equipment',
      label: 'Sekcja wyposażenia',
      fields: [
        { name: 'eyebrow', type: 'text', localized: true, label: 'Eyebrow' },
        { name: 'title', type: 'textarea', localized: true, label: 'Tytuł (może mieć enter)' },
        { name: 'description', type: 'textarea', localized: true, label: 'Opis' },
        {
          name: 'items',
          type: 'array',
          label: 'Karty wyposażenia',
          labels: { singular: 'Karta', plural: 'Karty' },
          fields: [
            { name: 'title', type: 'text', required: true, localized: true, label: 'Tytuł' },
            { name: 'description', type: 'textarea', localized: true, label: 'Opis' },
            {
              name: 'iconName',
              type: 'select',
              defaultValue: 'shield',
              options: [
                { label: 'Tarcza', value: 'shield' },
                { label: 'Iskra', value: 'sparkles' },
                { label: 'Paliwo', value: 'fuel' },
                { label: 'Klucz', value: 'wrench' },
              ],
              label: 'Ikona',
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'cta',
      label: 'CTA na dole',
      fields: [
        { name: 'title', type: 'text', localized: true, label: 'Tytuł' },
        { name: 'description', type: 'textarea', localized: true, label: 'Opis' },
        { name: 'buttonLabel', type: 'text', localized: true, label: 'Przycisk' },
      ],
    },
  ],
}
