import { getActiveTrips } from '@/lib/booking'
import { getDictionary } from '@/dictionaries'
import { PageHeader } from '@/components/common/PageHeader'
import { Topbar } from '@/components/layout/Topbar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Pricing } from '@/components/home/Pricing'
import { FAQ } from '@/components/home/FAQ'
import { SeoContent } from '@/components/common/SeoContent'
import { contentService } from '@/services/content.service'
import { Metadata } from 'next'
import { PhoneCall } from 'lucide-react'
import Link from 'next/link'
import { absoluteUrl, hreflangAlternates, localePath } from '@/lib/i18n'
import type { Locale } from '@/types/payload'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = (lang === 'en' ? 'en' : 'pl') as Locale
  const page = await contentService.getCennikPage(locale)
  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: {
      canonical: absoluteUrl(lang, '/cennik'),
      languages: hreflangAlternates('/cennik'),
    },
  }
}

export default async function PricingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = (lang === 'en' ? 'en' : 'pl') as Locale
  const dict = await getDictionary(locale)
  const [trips, page, faq, contactInfo] = await Promise.all([
    getActiveTrips(locale),
    contentService.getCennikPage(locale),
    contentService.getFaq(locale),
    contentService.getContactInfo(locale),
  ])

  return (
    <>
      <Topbar lang={locale} />
      <Header dict={dict} lang={locale} />

      <main className="bg-paper min-h-screen">
        <PageHeader
          title={page.header.title}
          description={page.header.description}
          breadcrumbs={[
            { label: dict.breadcrumbs.home, href: localePath(locale, '/') },
            { label: dict.nav.pricing },
          ]}
          dict={dict}
        />

        <Pricing dict={dict} trips={trips} lang={locale} />

        <section className="bg-snow section-pad border-t border-stone-line">
          <div className="wrap">
            <div className="bg-ink text-snow p-8 lg:p-12 border-l-4 border-orange grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-center">
              <div>
                <p className="font-label uppercase text-[12px] font-bold tracking-widest text-orange m-0 mb-2">
                  {locale === 'en' ? 'Groups & companies' : 'Grupy i firmy'}
                </p>
                <h2 className="font-display text-[30px] uppercase mb-3 mt-0">
                  {locale === 'en'
                    ? 'Planning a stag party or team trip?'
                    : 'Planujesz wieczór kawalerski lub wyjazd firmowy?'}
                </h2>
                <p className="text-stone text-[15px] leading-[1.6] m-0">
                  {locale === 'en'
                    ? 'For larger groups call us — we will arrange timing and the number of quads around your schedule.'
                    : 'Przy większej grupie zadzwoń — dopasujemy termin i liczbę quadow do Waszego planu.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                <Link
                  href={localePath(locale, '/rezerwacja')}
                  className="btn btn-primary justify-center text-center"
                >
                  {dict.common.book}
                </Link>
                <a
                  href={`tel:${(contactInfo.phones[0] || '+48888254223').replace(/\s/g, '')}`}
                  className="btn btn-outline justify-center text-center"
                >
                  <PhoneCall className="w-4 h-4 mr-2" /> {contactInfo.phones[0] || '+48 888 254 223'}
                </a>
              </div>
            </div>
          </div>
        </section>

        <SeoContent
          lang={locale}
          title={
            locale === 'en'
              ? 'Quad rental and guided tours in Podhale'
              : 'Wypożyczenie quadów i wyprawy z przewodnikiem na Podhalu'
          }
          paragraphs={
            locale === 'en'
              ? [
                  'Tatra Off-Road runs guided Can-Am ATV rides near Ząb and Nowy Targ. Routes follow legal forest and mountain trails adapted to weather and group level.',
                  'Online booking shows live availability synced with our calendar. You pay a deposit by BLIK or bank transfer; the remaining amount is settled on site before the ride.',
                  'Every price listed on this page comes from trips configured in our admin panel — duration, solo and duo rates, and deposit per quad.',
                ]
              : [
                  'Tatra Off-Road prowadzi wyprawy quadowe Can-Am w okolicach Zębu i Nowego Targu. Trasy prowadzimy legalnymi szlakami leśnymi i górskimi, dopasowanymi do pogody i poziomu grupy.',
                  'Rezerwacja online pokazuje realną dostępność zsynchronizowaną z kalendarzem. Zaliczkę płacisz BLIK-iem lub przelewem; resztę rozliczamy na miejscu przed startem.',
                  'Ceny na tej stronie pochodzą wyłącznie z wypraw ustawionych w panelu — czas trwania, stawka solo i duo oraz zaliczka za quada.',
                ]
          }
        />

        <FAQ dict={dict} items={faq} phone={contactInfo.phones[0]} />
      </main>

      <Footer dict={dict} lang={locale} />
    </>
  )
}
