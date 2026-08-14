import { absoluteUrl, hreflangAlternates, localePath } from '@/lib/i18n'
import { getDictionary } from '@/dictionaries'
import { PageHeader } from '@/components/common/PageHeader'
import { Topbar } from '@/components/layout/Topbar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BookingWizard } from '@/components/booking/BookingWizard'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isEn = lang === 'en'
  return {
    title: isEn ? 'Book a quad tour' : 'Rezerwacja wyprawy',
    description: isEn
      ? 'Book a Can-Am quad tour online in 4 steps. Live availability, deposit by BLIK or transfer.'
      : 'Zarezerwuj wyprawę quadową online w 4 krokach. Żywa dostępność, zaliczka BLIK lub przelew.',
    alternates: {
      canonical: absoluteUrl(lang, '/rezerwacja'),
      languages: hreflangAlternates('/rezerwacja'),
    },
  }
}

export default async function BookingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = lang === 'en' ? 'en' : 'pl'
  const dict = await getDictionary(locale)

  return (
    <>
      <Topbar lang={locale} />
      <Header dict={dict} lang={locale} />
      <main className="bg-snow min-h-screen">
        <PageHeader
          title={locale === 'en' ? 'Booking' : 'Rezerwacja'}
          description={
            locale === 'en'
              ? 'Trip → riders → date & time → details. Deposit at checkout.'
              : 'Wyprawa → uczestnicy → termin → dane. Zaliczkę opłacisz w kasie.'
          }
          breadcrumbs={[
            { label: dict.breadcrumbs.home, href: localePath(locale, '/') },
            { label: locale === 'en' ? 'Booking' : 'Rezerwacja' },
          ]}
          dict={dict}
        />
        <section className="py-10 lg:py-14 px-6 lg:px-14">
          <div className="wrap">
            <BookingWizard lang={locale} />
          </div>
        </section>
      </main>
      <Footer dict={dict} lang={locale} />
    </>
  )
}
