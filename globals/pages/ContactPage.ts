import type { GlobalConfig } from 'payload'
import { pageHeaderFields, pageSeoFields } from './fields'

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: 'Kontakt',
  admin: { group: 'Strony' },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [...pageSeoFields, ...pageHeaderFields],
}
