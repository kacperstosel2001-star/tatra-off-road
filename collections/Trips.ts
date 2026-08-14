import type { CollectionConfig } from 'payload'

export const Trips: CollectionConfig = {
  slug: 'trips',
  labels: {
    singular: 'Wyprawa',
    plural: 'Wyprawy',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'durationHours', 'price1', 'price2', 'deposit', 'active'],
    group: 'Rezerwacje',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nazwa wyprawy',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis',
    },
    {
      name: 'durationHours',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 0.5,
      label: 'Czas trwania (godziny)',
      admin: {
        step: 0.5,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price1',
          type: 'number',
          required: true,
          defaultValue: 250,
          min: 0,
          label: 'Pakiet 1-osobowy (zł)',
          admin: {
            step: 1,
            width: '33%',
          },
        },
        {
          name: 'price2',
          type: 'number',
          required: true,
          defaultValue: 300,
          min: 0,
          label: 'Pakiet 2-osobowy (zł)',
          admin: {
            step: 1,
            width: '33%',
          },
        },
        {
          name: 'deposit',
          type: 'number',
          required: true,
          defaultValue: 50,
          min: 0,
          label: 'Zadatek online / quad (zł)',
          admin: {
            step: 1,
            width: '33%',
            description: 'Reszta płatna na miejscu. Zaliczka = zadatek × liczba quadow.',
          },
        },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Aktywna (widoczna w rezerwacji)',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: 'Kolejność',
    },
  ],
}
