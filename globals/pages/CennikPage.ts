import type { GlobalConfig } from 'payload'
import { pageHeaderFields, pageSeoFields } from './fields'

export const CennikPage: GlobalConfig = {
  slug: 'cennik-page',
  label: 'Cennik',
  admin: { group: 'Strony' },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [...pageSeoFields, ...pageHeaderFields],
}
