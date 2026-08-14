import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { pl } from '@payloadcms/translations/languages/pl'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Trips } from './collections/Trips'
import { Bookings } from './collections/Bookings'
import { FleetVehicles } from './collections/content/FleetVehicles'
import { TourRoutes } from './collections/content/TourRoutes'
import { Features } from './collections/content/Features'
import { ProcessSteps } from './collections/content/ProcessSteps'
import { Reviews } from './collections/content/Reviews'
import { FaqItems } from './collections/content/FaqItems'
import { GalleryItems } from './collections/content/GalleryItems'
import { NewsPosts } from './collections/content/NewsPosts'
import { BookingSettings } from './globals/BookingSettings'
import { SiteSettings } from './globals/SiteSettings'
import { HomePage } from './globals/pages/HomePage'
import { FlotaPage } from './globals/pages/FlotaPage'
import { TrasyPage } from './globals/pages/TrasyPage'
import { CennikPage } from './globals/pages/CennikPage'
import { AboutPage } from './globals/pages/AboutPage'
import { ContactPage } from './globals/pages/ContactPage'
import { seedSiteContent } from './lib/content/seed'
import { applyInitialSchema } from './lib/db/ensure-schema'
import { postgresConnection } from './lib/db/connection'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const { connectionString, sslRequired } = postgresConnection()

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — Tatra Off-Road',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Trips,
    Bookings,
    FleetVehicles,
    TourRoutes,
    Features,
    ProcessSteps,
    Reviews,
    FaqItems,
    GalleryItems,
    NewsPosts,
  ],
  globals: [
    BookingSettings,
    SiteSettings,
    HomePage,
    FlotaPage,
    TrasyPage,
    CennikPage,
    AboutPage,
    ContactPage,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'tatra-off-road-dev-secret',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString,
      max: 10,
      ...(sslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
    },
    // Payload ignores `push` when NODE_ENV=production. Schema is applied in onInit.
    push: false,
  }),
  sharp,
  i18n: {
    supportedLanguages: { pl },
    fallbackLanguage: 'pl',
  },
  localization: {
    locales: [
      { code: 'pl', label: 'Polski' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'pl',
    fallback: true,
  },
  onInit: async (payload) => {
    if (process.env.NEXT_PHASE === 'phase-production-build') return
    try {
      await applyInitialSchema()
      await seedSiteContent(payload)
    } catch (error) {
      console.error('[tatra] Database bootstrap failed', error)
      payload.logger.error({ err: error }, 'Database bootstrap failed')
    }
  },
})
