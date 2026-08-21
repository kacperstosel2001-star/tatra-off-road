import { getDictionary } from '@/dictionaries'
import { PageHeader } from '@/components/common/PageHeader'
import { Topbar } from '@/components/layout/Topbar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CheckoutClient } from '@/components/booking/CheckoutClient'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { localePath } from '@/lib/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const isEn = lang === 'en'
  return {
    title: isEn
      ? 'Checkout — pay deposit | Tatra Off-Road'
      : 'Kasa — opłać zaliczkę | Tatra Off-Road',
    description: isEn
      ? 'Confirm your ATV tour by paying the deposit.'
      : 'Potwierdź rezerwację wyprawy quadowej przez opłacenie zaliczki.',
    robots: { index: false, follow: false },
    alternates: {
      canonical: `https://tatraoffroad.pl/${lang}/kasa`,
    },
  }
}

export default async function CheckoutPage({
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
          title={isEn ? 'Checkout' : 'Kasa'}
          description={
            isEn
              ? 'Pay the deposit by BLIK or bank transfer. The rest is paid on site.'
              : 'Opłać zaliczkę BLIK-iem lub przelewem. Resztę zapłacisz na miejscu.'
          }
          breadcrumbs={[
            { label: dict.breadcrumbs.home, href: localePath(lang, '/') },
            {
              label: isEn ? 'Booking' : 'Rezerwacja',
              href: localePath(lang, '/rezerwacja'),
            },
            { label: isEn ? 'Checkout' : 'Kasa' },
          ]}
          dict={dict}
        />
        <section className="section-pad bg-snow">
          <div className="wrap">
            <Suspense
              fallback={
                <div className="py-10 text-stone">
                  {isEn ? 'Loading checkout…' : 'Ładowanie kasy…'}
                </div>
              }
            >
              <CheckoutClient bookingId={id} lang={lang} />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer dict={dict} lang={lang} />
    </>
  )
}
