import { localePath } from '@/lib/i18n'
import { getDictionary } from '@/dictionaries'
import { PageHeader } from '@/components/common/PageHeader'
import { Topbar } from '@/components/layout/Topbar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ThankYouClient } from '@/components/booking/ThankYouClient'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const isEn = lang === 'en'
  return {
    title: isEn
      ? 'Thank you — booking confirmed | Tatra Off-Road'
      : 'Dziękujemy — rezerwacja potwierdzona | Tatra Off-Road',
    description: isEn
      ? 'Booking summary and paid deposit.'
      : 'Podsumowanie rezerwacji i opłaconej zaliczki.',
    robots: { index: false, follow: false },
  }
}

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params
  const isEn = lang === 'en'
  const dict = await getDictionary((isEn ? 'en' : 'pl') as 'pl' | 'en')

  return (
    <>
      <Topbar lang={lang} />
      <Header dict={dict} lang={lang} />
      <main className="bg-paper min-h-screen">
        <PageHeader
          title={isEn ? 'Thank you' : 'Dziękujemy'}
          description={
            isEn
              ? 'Booking confirmation and payment summary.'
              : 'Potwierdzenie rezerwacji i podsumowanie płatności.'
          }
          breadcrumbs={[
            { label: dict.breadcrumbs.home, href: localePath(lang, '/') },
            {
              label: isEn ? 'Booking' : 'Rezerwacja',
              href: localePath(lang, '/rezerwacja'),
            },
            { label: isEn ? 'Thank you' : 'Dziękujemy' },
          ]}
          dict={dict}
        />
        <section className="section-pad bg-snow">
          <div className="wrap">
            <ThankYouClient bookingId={id} lang={lang} />
          </div>
        </section>
      </main>
      <Footer dict={dict} lang={lang} />
    </>
  )
}
