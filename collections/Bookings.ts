import type { CollectionConfig } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: {
    singular: 'Rezerwacja',
    plural: 'Rezerwacje',
  },
  admin: {
    useAsTitle: 'customerPhone',
    defaultColumns: [
      'bookingDate',
      'bookingTime',
      'customerFirstName',
      'customerLastName',
      'drivers',
      'status',
      'source',
      'depositAmount',
    ],
    group: 'Rezerwacje',
    description: 'Rezerwacje online i ręczne (administracyjne).',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'trip',
      type: 'relationship',
      relationTo: 'trips',
      label: 'Wyprawa',
      admin: {
        description: 'Opcjonalne dla rezerwacji administracyjnej bez przypisanej wyprawy.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'bookingDate',
          type: 'date',
          required: true,
          label: 'Data',
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' },
            width: '33%',
          },
        },
        {
          name: 'bookingTime',
          type: 'text',
          required: true,
          label: 'Godzina startu (HH:MM)',
          admin: { width: '33%' },
        },
        {
          name: 'reservationEndTime',
          type: 'text',
          label: 'Godzina końca (HH:MM)',
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'durationHours',
      type: 'number',
      required: true,
      defaultValue: 1,
      label: 'Czas trwania (h)',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'drivers',
          type: 'number',
          required: true,
          defaultValue: 1,
          min: 1,
          label: 'Kierowcy (quady)',
          admin: { width: '33%' },
        },
        {
          name: 'passengers',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          label: 'Pasażerowie',
          admin: { width: '33%' },
        },
        {
          name: 'people',
          type: 'number',
          label: 'Razem osób',
          admin: {
            width: '33%',
            readOnly: true,
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customerFirstName',
          type: 'text',
          label: 'Imię',
          admin: { width: '50%' },
        },
        {
          name: 'customerLastName',
          type: 'text',
          label: 'Nazwisko',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customerPhone',
          type: 'text',
          required: true,
          label: 'Telefon',
          admin: { width: '50%' },
        },
        {
          name: 'customerEmail',
          type: 'email',
          label: 'E-mail',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'customerNotes',
      type: 'textarea',
      label: 'Uwagi',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'select',
          required: true,
          defaultValue: 'website',
          label: 'Źródło',
          options: [
            { label: 'Strona WWW', value: 'website' },
            { label: 'Admin (ręczne)', value: 'manual_admin' },
            { label: 'Telefon', value: 'phone' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          label: 'Status',
          options: [
            { label: 'Oczekująca (pending)', value: 'pending' },
            { label: 'Potwierdzona', value: 'confirmed' },
            { label: 'Anulowana', value: 'cancelled' },
            { label: 'Wygasła', value: 'expired' },
            { label: 'Opłacona zaliczka', value: 'deposit_paid' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'fullPrice',
          type: 'number',
          label: 'Cena pełna (zł)',
          admin: { width: '33%' },
        },
        {
          name: 'depositAmount',
          type: 'number',
          label: 'Zaliczka (zł)',
          admin: { width: '33%' },
        },
        {
          name: 'remainingAmount',
          type: 'number',
          label: 'Reszta na miejscu (zł)',
          admin: { width: '33%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'paymentStatus',
          type: 'select',
          defaultValue: 'unpaid',
          label: 'Status płatności',
          options: [
            { label: 'Nieopłacona', value: 'unpaid' },
            { label: 'Zaliczka opłacona', value: 'deposit_paid' },
            { label: 'Opłacona w całości', value: 'paid' },
            { label: 'Zwrot', value: 'refunded' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'paymentMethod',
          type: 'select',
          label: 'Metoda płatności',
          options: [
            { label: 'BLIK', value: 'blik' },
            { label: 'Przelew (CashBill)', value: 'transfer' },
            { label: 'Online (inne)', value: 'online' },
            { label: 'Gotówka', value: 'cash' },
            { label: 'Karta na miejscu', value: 'card_onsite' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'cashbillPaymentId',
      type: 'text',
      label: 'CashBill Payment ID',
      admin: { position: 'sidebar' },
    },
    {
      name: 'cashbillChannel',
      type: 'text',
      label: 'CashBill kanał',
      admin: { position: 'sidebar' },
    },
    {
      name: 'sessionId',
      type: 'text',
      label: 'ID sesji',
      admin: { position: 'sidebar' },
    },
    {
      name: 'gcalEventId',
      type: 'text',
      label: 'Google Calendar Event ID',
      admin: { position: 'sidebar' },
    },
    {
      name: 'confirmationEmailSentAt',
      type: 'date',
      label: 'Mail potwierdzenia wysłany',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Wygasa',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const drivers = Math.max(0, Number(data.drivers ?? 0))
        const passengers = Math.max(0, Number(data.passengers ?? 0))
        data.people = drivers + passengers
        return data
      },
    ],
  },
}
