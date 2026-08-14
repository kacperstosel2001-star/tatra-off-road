import type { GlobalConfig } from 'payload'
import { pageHeaderFields, pageSeoFields } from './fields'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'O nas',
  admin: { group: 'Strony' },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [...pageSeoFields, ...pageHeaderFields],
}
