import { getDictionary } from '@/dictionaries'
import { PageHeader } from '@/components/common/PageHeader'
import { Topbar } from '@/components/layout/Topbar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Routes } from '@/components/home/Routes'
import { Process } from '@/components/home/Process'
import { contentService } from '@/services/content.service'
import { Metadata } from 'next'
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
  const page = await contentService.getTrasyPage(locale)
  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: {
      canonical: absoluteUrl(lang, '/trasy'),
      languages: hreflangAlternates('/trasy'),
    },
  }
}

export default async function RoutesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = (lang === 'en' ? 'en' : 'pl') as Locale
  const dict = await getDictionary(locale)
  const [routes, processSteps, page] = await Promise.all([
    contentService.getRoutes(locale),
    contentService.getProcessSteps(locale),
    contentService.getTrasyPage(locale),
  ])

  return (
    <>
      <Topbar lang={locale} />
      <Header dict={dict} lang={locale} />

      <main className="bg-snow min-h-screen">
        <PageHeader
          title={page.header.title}
          description={page.header.description}
          breadcrumbs={[
            { label: dict.breadcrumbs.home, href: localePath(locale, '/') },
            { label: dict.nav.routes },
          ]}
          dict={dict}
        />

        <Routes dict={dict} routes={routes} />

        <section className="bg-ink text-snow section-pad border-t border-[rgba(245,241,231,0.1)]">
          <div className="wrap flex flex-col lg:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="font-display text-[32px] uppercase mt-2 mb-3">
                {locale === 'en' ? 'Pick a route and book a slot' : 'Wybierz trasę i zarezerwuj termin'}
              </h3>
              <p className="text-stone max-w-[600px] m-0">
                {locale === 'en'
                  ? 'Call us or book online — we help match the trail to your experience.'
                  : 'Zadzwoń lub zarezerwuj online — pomożemy dobrać trasę do doświadczenia.'}
              </p>
            </div>
            <Link href={localePath(locale, '/rezerwacja')} className="btn btn-primary whitespace-nowrap">
              {dict.common.book}
            </Link>
          </div>
        </section>

        <Process dict={dict} steps={processSteps} />
      </main>

      <Footer dict={dict} lang={locale} />
    </>
  )
}
