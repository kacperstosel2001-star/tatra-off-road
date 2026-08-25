import type { Metadata } from 'next'
import { Anton, Barlow_Condensed, Barlow_Semi_Condensed, JetBrains_Mono } from 'next/font/google'
import { absoluteUrl, hreflangAlternates } from '@/lib/i18n'
import { contentService } from '@/services/content.service'
import { ContactProvider } from '@/components/providers/ContactProvider'
import '../globals.css'

const anton = Anton({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-anton',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

const barlowSemiCondensed = Barlow_Semi_Condensed({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-barlow-semi-condensed',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const isEn = lang === 'en'
  return {
    title: {
      default: isEn
        ? 'Tatra Off-Road — Quad Tours in Podhale'
        : 'Tatra Off-Road — Wyprawy quadami po Podhalu',
      template: '%s | Tatra Off-Road',
    },
    description: isEn
      ? 'Guided Can-Am quad tours in Podhale. Book online with live availability.'
      : 'Wyprawy quadowe Can-Am na Podhalu. Rezerwacja online z żywą dostępnością.',
    metadataBase: new URL('https://tatraoffroad.pl'),
    alternates: {
      canonical: absoluteUrl(lang, '/'),
      languages: hreflangAlternates('/'),
    },
    openGraph: {
      title: isEn
        ? 'Tatra Off-Road — Quad Tours in Podhale'
        : 'Tatra Off-Road — Wyprawy quadami po Podhalu',
      description: isEn
        ? 'Guided Can-Am quad tours near Ząb. Book online.'
        : 'Wyprawy quadowe Can-Am w okolicach Zębu. Rezerwacja online.',
      url: absoluteUrl(lang, '/'),
      siteName: 'Tatra Off-Road',
      locale: isEn ? 'en_GB' : 'pl_PL',
      type: 'website',
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const htmlLang = lang === 'en' ? 'en' : 'pl'
  const contact = await contentService.getContactInfo(htmlLang === 'en' ? 'en' : 'pl')
  const phone = contact.phones[0] || '+48530198735'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Tatra Off-Road',
    image: 'https://tatraoffroad.pl/site-media/photo-02.jpeg',
    '@id': 'https://tatraoffroad.pl',
    url: 'https://tatraoffroad.pl',
    telephone: phone.replace(/\s/g, ''),
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address,
      addressLocality: 'Ząb',
      postalCode: '34-521',
      addressCountry: 'PL',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '08:00',
      closes: '20:00',
    },
  }

  return (
    <html
      lang={htmlLang}
      className={`${anton.variable} ${barlowCondensed.variable} ${barlowSemiCondensed.variable} ${jetBrainsMono.variable}`}
    >
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ContactProvider value={contact}>{children}</ContactProvider>
      </body>
    </html>
  )
}
