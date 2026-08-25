import type { GlobalConfig } from 'payload'

export const BookingSettings: GlobalConfig = {
  slug: 'booking-settings',
  label: 'Ustawienia rezerwacji',
  admin: {
    group: 'Rezerwacje',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'totalQuads',
      type: 'number',
      required: true,
      defaultValue: 4,
      min: 1,
      max: 200,
      label: 'Łączna liczba quadow',
      admin: {
        description:
          'Pula pojazdów. Rezerwacje mogą się nakładać częściowo — system liczy wolne quady w każdym momencie (np. 3 zajęte = 1 wolny na 1h lub 2h).',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'openHour',
          type: 'number',
          required: true,
          defaultValue: 8,
          min: 0,
          max: 23,
          label: 'Godzina otwarcia',
          admin: { width: '33%' },
        },
        {
          name: 'closeHour',
          type: 'number',
          required: true,
          defaultValue: 18,
          min: 1,
          max: 24,
          label: 'Godzina zamknięcia',
          admin: { width: '33%' },
        },
        {
          name: 'minBookingLeadHours',
          type: 'number',
          required: true,
          defaultValue: 5,
          min: 0,
          label: 'Min. wyprzedzenie (h)',
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'holdMinutes',
      type: 'number',
      required: true,
      defaultValue: 15,
      min: 1,
      max: 120,
      label: 'Czas trzymania pending w kasie (minuty)',
    },
    {
      type: 'collapsible',
      label: 'CashBill — płatności',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'cashbillLiveEnabled',
          type: 'checkbox',
          defaultValue: false,
          label: 'Włącz tryb LIVE (produkcja)',
          admin: {
            description:
              'Wyłączone = test (testws). Włączone = produkcja (ws). Najpierw przetestuj na testws.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'cashbillShopId',
              type: 'text',
              label: 'ID punktu płatności',
              defaultValue: 'tatraoffroad.pl',
              admin: {
                width: '50%',
                description: 'Identyfikator z panelu CashBill. Nadpisuje CASHBILL_SHOP_ID z .env.',
              },
            },
            {
              name: 'cashbillSecret',
              type: 'text',
              label: 'Klucz punktu (opcjonalnie)',
              admin: {
                width: '50%',
                description:
                  'Lepiej trzymaj klucz w .env (CASHBILL_SECRET). Pole w panelu tylko jeśli musisz nadpisać.',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'E-mail (SMTP) — potwierdzenia rezerwacji',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'smtpInfo',
          type: 'ui',
          admin: {
            components: {
              Field: '/components/admin/MailTestButton#MailTestButton',
            },
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Google Calendar',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'gcalCalendarId',
          type: 'text',
          label: 'Calendar ID',
          admin: {
            description:
              'Pełny ID, np. xxx@group.calendar.google.com (Ustawienia kalendarza → Identyfikator). Udostępnij kalendarz na client_email z JSON (prawo edycji). Zapisz przed testem.',
          },
        },
        {
          name: 'gcalServiceAccountJson',
          type: 'textarea',
          label: 'Service Account JSON',
          admin: {
            description:
              'Cały plik JSON klucza. Tytuł wydarzenia np.: REZERWACJA QUAD | 2026-08-23 | 09:00-10:00 | 1 quad 2 osoby 50 zadatku 250 dopłaty | Imię Nazwisko — system czyta quady, osoby, zadatek i dopłatę. „Synchronizuj” importuje do panelu; przy wolnych godzinach dociąga też bieżący dzień.',
          },
        },
        {
          name: 'gcalTestConnection',
          type: 'ui',
          admin: {
            components: {
              Field: '/components/admin/GcalTestButton#GcalTestButton',
            },
          },
        },
      ],
    },
  ],
}
