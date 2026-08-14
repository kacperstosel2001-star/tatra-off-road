import { getDictionary } from '@/dictionaries'
import { PageHeader } from '@/components/common/PageHeader'
import { Topbar } from '@/components/layout/Topbar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Fleet } from '@/components/home/Fleet'
import { TrustBar } from '@/components/home/TrustBar'
import { contentService } from '@/services/content.service'
import { Metadata } from 'next'
import { ShieldCheck, Wrench, Sparkles, Fuel } from 'lucide-react'
import Link from 'next/link'
import { absoluteUrl, hreflangAlternates, localePath } from '@/lib/i18n'
import type { Locale } from '@/types/payload'

const icons = {
  shield: ShieldCheck,
  sparkles: Sparkles,
  fuel: Fuel,
  wrench: Wrench,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = (lang === 'en' ? 'en' : 'pl') as Locale
  const page = await contentService.getFlotaPage(locale)
  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: {
      canonical: absoluteUrl(lang, '/flota'),
      languages: hreflangAlternates('/flota'),
    },
  }
}

export default async function FleetPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = (lang === 'en' ? 'en' : 'pl') as Locale
  const dict = await getDictionary(locale)
  const [fleet, page] = await Promise.all([
    contentService.getFleet(locale),
    contentService.getFlotaPage(locale),
  ])

  return (
    <>
      <Topbar lang={locale} />
      <Header dict={dict} lang={locale} />

      <main className="bg-ink min-h-screen">
        <PageHeader
          title={page.header.title}
          description={page.header.description}
          breadcrumbs={[
            { label: dict.breadcrumbs.home, href: localePath(locale, '/') },
            { label: dict.nav.fleet },
          ]}
          dict={dict}
        />

        <Fleet dict={dict} fleet={fleet} />

        <section className="bg-granite-2 text-snow section-pad border-t border-[rgba(245,241,231,0.1)]">
          <div className="wrap">
            <div className="shead">
              <span className="eyebrow">{page.equipment.eyebrow}</span>
              <h2 className="whitespace-pre-line">{page.equipment.title}</h2>
              <p className="text-stone">{page.equipment.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {page.equipment.items.map((item, i) => {
                const Icon = icons[item.iconName as keyof typeof icons] || ShieldCheck
                return (
                  <div key={i} className="bg-granite p-8 border border-[rgba(245,241,231,0.12)]">
                    <div className="w-12 h-12 bg-orange text-ink flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-[22px] uppercase mb-3">{item.title}</h3>
                    <p className="text-[14.5px] text-stone leading-[1.6]">{item.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-14 p-8 bg-ink border border-orange flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h4 className="font-display text-[26px] uppercase text-snow mb-2">{page.cta.title}</h4>
                <p className="text-stone text-[15px] m-0">{page.cta.description}</p>
              </div>
              <Link href={localePath(locale, '/rezerwacja')} className="btn btn-primary whitespace-nowrap">
                {page.cta.buttonLabel}
              </Link>
            </div>
          </div>
        </section>

        <TrustBar dict={dict} />
      </main>

      <Footer dict={dict} lang={locale} />
    </>
  )
}
