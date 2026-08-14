import type { GlobalConfig } from 'payload'
import { pageSeoFields } from './fields'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Strona główna',
  admin: {
    group: 'Strony',
    description:
      'Hero (zdjęcie lub film), marquee i baner CTA. Wspólne bloki (flota, trasy, FAQ, opinie) edytujesz w grupie „Treść” — tu ich nie powtarzaj.',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    ...pageSeoFields,
    {
      type: 'group',
      name: 'hero',
      label: 'Hero',
      fields: [
        {
          name: 'mediaType',
          type: 'select',
          defaultValue: 'image',
          label: 'Tło hero',
          options: [
            { label: 'Zdjęcie', value: 'image' },
            { label: 'Film (MP4 / YouTube / Vimeo)', value: 'video' },
          ],
          admin: { description: 'Wybierz zdjęcie albo film — nie trzeba obu naraz.' },
        },
        {
          name: 'bgImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Zdjęcie tła / poster filmu',
          admin: {
            description: 'Dla filmu: klatka startowa (poster). Dla zdjęcia: pełne tło.',
          },
        },
        {
          name: 'bgImageUrl',
          type: 'text',
          label: 'URL zdjęcia (opcjonalnie)',
          admin: { description: 'Fallback, gdy nie ma uploadu w Media.' },
        },
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          label: 'Film (upload MP4/WebM)',
          admin: {
            condition: (_, siblingData) => siblingData?.mediaType === 'video',
            description: 'Wgraj plik wideo do Media albo podaj URL poniżej.',
          },
        },
        {
          name: 'videoUrl',
          type: 'text',
          label: 'URL filmu (MP4 / YouTube / Vimeo)',
          admin: {
            condition: (_, siblingData) => siblingData?.mediaType === 'video',
            description: 'np. https://…/film.mp4 lub link YouTube/Vimeo.',
          },
        },
        { name: 'headline', type: 'text', localized: true, label: 'Nagłówek (1. linia)' },
        { name: 'highlightWord', type: 'text', localized: true, label: 'Wyróżnione słowo (środek)' },
        { name: 'subheadline', type: 'text', localized: true, label: 'Nagłówek (3. linia)' },
        { name: 'lead', type: 'textarea', localized: true, label: 'Lead pod nagłówkiem' },
        {
          name: 'primaryCtaLabel',
          type: 'text',
          localized: true,
          label: 'Przycisk główny',
          defaultValue: 'Zarezerwuj online',
        },
        {
          name: 'secondaryCtaLabel',
          type: 'text',
          localized: true,
          label: 'Przycisk drugi',
          defaultValue: 'Zobacz ceny',
        },
        {
          name: 'badges',
          type: 'array',
          label: 'Badges',
          labels: { singular: 'Badge', plural: 'Badges' },
          fields: [{ name: 'label', type: 'text', required: true, localized: true, label: 'Tekst' }],
        },
        {
          name: 'stats',
          type: 'array',
          label: 'Statystyki',
          labels: { singular: 'Statystyka', plural: 'Statystyki' },
          fields: [
            { name: 'value', type: 'text', required: true, label: 'Wartość' },
            { name: 'label', type: 'text', required: true, localized: true, label: 'Etykieta' },
          ],
        },
        {
          type: 'group',
          name: 'bookingPanel',
          label: 'Panel „Szybka rezerwacja” (prawa kolumna)',
          fields: [
            { name: 'eyebrow', type: 'text', localized: true, label: 'Eyebrow', defaultValue: 'Szybka Rezerwacja' },
            { name: 'title', type: 'text', localized: true, label: 'Tytuł', defaultValue: 'Start w 4 krokach' },
            {
              name: 'steps',
              type: 'array',
              label: 'Kroki',
              labels: { singular: 'Krok', plural: 'Kroki' },
              fields: [
                {
                  name: 'iconName',
                  type: 'select',
                  defaultValue: 'clock',
                  options: [
                    { label: 'Zegar', value: 'clock' },
                    { label: 'Ludzie', value: 'users' },
                    { label: 'Mapa', value: 'map' },
                    { label: 'Tarcza', value: 'shield' },
                  ],
                  label: 'Ikona',
                },
                { name: 'text', type: 'text', required: true, localized: true, label: 'Tekst' },
              ],
            },
            {
              name: 'buttonLabel',
              type: 'text',
              localized: true,
              label: 'Przycisk',
              defaultValue: 'Sprawdź dostępność',
            },
            {
              name: 'finePrint',
              type: 'text',
              localized: true,
              label: 'Dopisek pod przyciskiem',
              defaultValue: 'Zaliczka online · reszta na miejscu · potwierdzenie od razu',
            },
          ],
        },
      ],
    },
    {
      name: 'marqueePhrases',
      type: 'array',
      label: 'Marquee (pasek pod hero)',
      labels: { singular: 'Fraza', plural: 'Frazy' },
      fields: [{ name: 'text', type: 'text', required: true, localized: true, label: 'Tekst' }],
    },
    {
      type: 'group',
      name: 'ctaBanner',
      label: 'Baner CTA (dół strony głównej)',
      fields: [
        { name: 'eyebrow', type: 'text', localized: true, label: 'Eyebrow' },
        { name: 'titleLine1', type: 'text', localized: true, label: 'Tytuł linia 1' },
        { name: 'titleHighlight', type: 'text', localized: true, label: 'Tytuł wyróżniony' },
        { name: 'description', type: 'textarea', localized: true, label: 'Opis' },
        {
          name: 'bgImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Zdjęcie tła',
        },
        { name: 'bgImageUrl', type: 'text', label: 'URL tła (opcjonalnie)' },
      ],
    },
  ],
}
