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
      ({ error }) => {
        const cause = (error as Error & { cause?: { code?: string; detail?: string; message?: string } }).cause
        console.error('[tatra] users afterError', error.message, cause?.code, cause?.detail || cause?.message || cause)
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
