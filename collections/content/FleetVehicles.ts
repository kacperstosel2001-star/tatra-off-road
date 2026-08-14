import type { CollectionConfig } from 'payload'

export const FleetVehicles: CollectionConfig = {
  slug: 'fleet-vehicles',
  labels: { singular: 'Quad / pojazd', plural: 'Flota' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'year', 'sortOrder'],
    group: 'Treść',
    description: 'Wspólna flota — strona główna + /flota. Edytuj raz.',
  },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true, label: 'Nazwa' },
    { name: 'type', type: 'text', localized: true, label: 'Typ (np. Solo Ride)' },
    { name: 'badge', type: 'text', localized: true, label: 'Badge (np. 1-osobowy)' },
    {
      type: 'row',
      fields: [
        { name: 'power', type: 'text', label: 'Moc', admin: { width: '25%' } },
        { name: 'drive', type: 'text', label: 'Napęd', admin: { width: '25%' } },
        { name: 'seats', type: 'text', label: 'Miejsca', admin: { width: '25%' } },
        { name: 'year', type: 'text', label: 'Rok', admin: { width: '25%' } },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Zdjęcie',
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'URL zdjęcia (opcjonalnie)',
      admin: { description: 'Używane, gdy nie ma uploadu w Media.' },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Kolejność' },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Aktywny' },
  ],
}
