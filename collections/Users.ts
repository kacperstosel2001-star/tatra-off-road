import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'System',
  },
  auth: true,
  hooks: {
    afterError: [
      async ({ error, result }) => {
        console.error('[tatra] users afterError', error)
        return result
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Imię i nazwisko',
    },
  ],
}
