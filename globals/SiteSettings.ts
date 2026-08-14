import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Dane firmy (wspólne)',
  admin: {
    group: 'Strony',
    description:
      'JEDNO miejsce na telefony, e-mail, adres i WhatsApp. Używane w: topbar, menu, stopka, CTA, FAQ, sticky mobile. Nie duplikuj tych danych na innych stronach.',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'address',
      type: 'textarea',
      localized: true,
      label: 'Adres',
      admin: { description: 'Widoczny w stopce i kontakcie.' },
    },
    {
      name: 'phones',
      type: 'array',
      label: 'Telefony',
      labels: { singular: 'Telefon', plural: 'Telefony' },
      admin: {
        description: 'Pierwszy numer = główny (nagłówek, sticky CTA, przyciski „Zadzwoń”).',
      },
      fields: [{ name: 'number', type: 'text', required: true, label: 'Numer' }],
    },
    { name: 'email', type: 'email', label: 'E-mail' },
    {
      name: 'whatsapp',
      type: 'text',
      label: 'WhatsApp (numer)',
      admin: { description: 'Pływający przycisk WhatsApp. Zostaw puste = użyje pierwszego telefonu.' },
    },
    { name: 'hours', type: 'textarea', localized: true, label: 'Godziny / dostępność' },
  ],
}
