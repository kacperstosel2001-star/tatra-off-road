import type { CollectionConfig } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: {
    singular: 'Rezerwacja / blokada',
    plural: 'Rezerwacje',
  },
  admin: {
    useAsTitle: 'customerFirstName',
    defaultColumns: [
      'entryKind',
      'bookingDate',
      'blockEndDate',
      'bookingTime',
      'customerFirstName',
      'customerLastName',
      'drivers',
      'status',
      'source',
    ],
    group: 'Rezerwacje',
    description:
      'Tu dodajesz ręczne rezerwacje (telefon / admin) oraz blokady terminów (np. cały dzień albo kilka dni). Blokada zajmuje całą pulę quadów i znika z wolnych godzin na stronie.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'entryKind',
      type: 'select',
      required: true,
      defaultValue: 'booking',
      label: 'Typ wpisu',
      options: [
        { label: 'Rezerwacja klienta', value: 'booking' },
        { label: 'Blokada terminu (zajęte quady)', value: 'block' },
      ],
      admin: {
        description:
          'Blokada: ustaw datę od–do (albo jeden dzień) i godziny — strona nie pozwoli zarezerwować tych godzin.',
      },
    },
    {
      name: 'trip',
      type: 'relationship',
      relationTo: 'trips',
      label: 'Wyprawa',
      admin: {
        description: 'Opcjonalne — przy blokadzie możesz zostawić puste.',
        condition: (_, siblingData) => siblingData?.entryKind !== 'block',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'bookingDate',
          type: 'date',
          required: true,
          label: 'Data od',
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' },
            width: '33%',
          },
        },
        {
          name: 'blockEndDate',
          type: 'date',
          label: 'Data do (blokada wielodniowa)',
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' },
            width: '33%',
            description: 'Tylko przy blokadzie. Puste = jeden dzień.',
            condition: (_, siblingData) => siblingData?.entryKind === 'block',
          },
        },
        {
          name: 'bookingTime',
          type: 'text',
          required: true,
          defaultValue: '09:00',
          label: 'Godzina startu',
          admin: {
            width: '33%',
            description: 'Wybierz kafelek — koniec wyliczy się z wyprawy.',
            components: {
              Field: '/components/admin/BookingTimePicker#BookingTimePicker',
            },
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'reservationEndTime',
          type: 'text',
          defaultValue: '20:00',
          label: 'Godzina końca',
          admin: {
            width: '50%',
            description: 'Przy rezerwacji klienta ustawiana automatycznie z wyprawy.',
            condition: (_, siblingData) => siblingData?.entryKind === 'block',
          },
        },
        {
          name: 'durationHours',
          type: 'number',
          required: true,
          defaultValue: 1,
          label: 'Czas trwania (h)',
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.entryKind === 'block',
          },
        },
      ],
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
          admin: {
            width: '33%',
            description: 'Przy blokadzie ustaw liczbę zajętych quadów (zwykle cała pula).',
          },
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
          defaultValue: 'manual_admin',
          label: 'Źródło',
          options: [
            { label: 'Strona WWW', value: 'website' },
            { label: 'Admin (ręczne)', value: 'manual_admin' },
            { label: 'Telefon', value: 'phone' },
            { label: 'Google Calendar', value: 'google_calendar' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'confirmed',
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
      name: 'cashbillSyncActions',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/components/admin/CashbillSyncButton#CashbillSyncButton',
        },
      },
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
      name: 'adminNotificationEmailSentAt',
      type: 'date',
      label: 'Powiadomienie admina wysłane',
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
      async ({ data, req }) => {
        if (!data) return data

        const { calculateEndTime } = await import('@/lib/booking')

        if (data.entryKind === 'booking') {
          data.bookingTime = String(data.bookingTime || '09:00').slice(0, 5)

          let duration = Number(data.durationHours || 0)
          if (data.trip) {
            try {
              const tripId =
                typeof data.trip === 'object' && data.trip !== null && 'id' in data.trip
                  ? (data.trip as { id: string | number }).id
                  : data.trip
              const trip = await req.payload.findByID({
                collection: 'trips',
                id: tripId as string | number,
                overrideAccess: true,
              })
              duration = Math.max(1, Number((trip as { durationHours?: number }).durationHours || 1))
            } catch {
              duration = duration > 0 ? duration : 1
            }
          }
          if (duration <= 0) duration = 1

          data.durationHours = duration
          const end = calculateEndTime(String(data.bookingTime).slice(0, 5), duration)
          if (end) data.reservationEndTime = end
        }

        if (data.entryKind === 'block') {
          data.source = data.source || 'manual_admin'
          data.status = 'confirmed'
          data.customerFirstName = data.customerFirstName || 'Blokada'
          data.customerLastName = data.customerLastName || 'terminu'
          data.customerPhone = data.customerPhone || 'admin'
          data.bookingTime = data.bookingTime || '08:00'
          data.reservationEndTime = data.reservationEndTime || '20:00'
          data.passengers = Number(data.passengers || 0)

          if (!data.drivers || Number(data.drivers) < 1) {
            try {
              const settings = await req.payload.findGlobal({
                slug: 'booking-settings',
                overrideAccess: true,
              })
              data.drivers = Math.max(1, Number((settings as any)?.totalQuads || 4))
            } catch {
              data.drivers = 4
            }
          }

          const start = String(data.bookingTime).slice(0, 5)
          const end = String(data.reservationEndTime || '').slice(0, 5)
          const [sh, sm] = start.split(':').map(Number)
          const [eh, em] = end.split(':').map(Number)
          if (Number.isFinite(sh) && Number.isFinite(eh)) {
            const mins = eh * 60 + (em || 0) - (sh * 60 + (sm || 0))
            if (mins > 0) data.durationHours = Math.max(1, Math.round((mins / 60) * 10) / 10)
          }
        }

        const drivers = Math.max(0, Number(data.drivers ?? 0))
        const passengers = Math.max(0, Number(data.passengers ?? 0))
        data.people = drivers + passengers
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation, previousDoc }) => {
        if (req.context?.skipGcalSync) return doc
        if (doc.status === 'cancelled' || doc.status === 'expired') return doc
        if (doc.source === 'website' && operation === 'create') return doc

        const syncManual =
          doc.source === 'manual_admin' ||
          doc.source === 'phone' ||
          doc.entryKind === 'block'
        const syncPaidOrConfirmed =
          doc.status === 'confirmed' || doc.status === 'deposit_paid'

        if (!syncManual && !syncPaidOrConfirmed) return doc

        try {
          const { upsertBookingGoogleEvent } = await import('@/lib/gcal/client')
          const eventId = await upsertBookingGoogleEvent(doc as any)
          if (eventId && eventId !== doc.gcalEventId) {
            await req.payload.update({
              collection: 'bookings',
              id: doc.id,
              data: { gcalEventId: eventId },
              overrideAccess: true,
              context: { skipGcalSync: true },
            })
          }
        } catch (error) {
          req.payload.logger.error({ err: error, msg: 'GCal sync after admin booking failed' })
        }

        // previousDoc unused — kept for Payload hook signature clarity
        void previousDoc
        return doc
      },
    ],
  },
}
