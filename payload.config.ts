import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
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
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || `file:${path.resolve(dirname, 'payload.db')}`,
    },
    push: true,
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
