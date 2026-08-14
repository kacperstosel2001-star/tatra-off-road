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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseUrl = process.env.DATABASE_URL || ''
if (!databaseUrl || databaseUrl.startsWith('file:')) {
  throw new Error(
    'DATABASE_URL must be a Postgres connection string, e.g. postgres://user:pass@host:5432/tatra_off_road',
  )
}

const sslRequired =
  process.env.DATABASE_SSL !== 'false' &&
  (process.env.DATABASE_SSL === 'true' ||
    /sslmode=require/i.test(databaseUrl) ||
    /\.supabase\.co/i.test(databaseUrl) ||
    process.env.NODE_ENV === 'production')

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
      connectionString: databaseUrl,
      max: 10,
      ...(sslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
    },
    // Hostinger / first deploy: create tables automatically. Set PAYLOAD_PUSH=false after schema is stable.
    push: process.env.PAYLOAD_PUSH !== 'false',
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
    await seedSiteContent(payload)
  },
})
