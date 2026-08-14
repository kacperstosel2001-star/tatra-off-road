import { absoluteUrl, hreflangAlternates, localePath } from '@/lib/i18n'
import { getDictionary } from '@/dictionaries'
import { PageHeader } from '@/components/common/PageHeader'
import { Topbar } from '@/components/layout/Topbar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhyUs } from '@/components/home/WhyUs'
import { Process } from '@/components/home/Process'
import { TrustBar } from '@/components/home/TrustBar'
import { contentService } from '@/services/content.service'
import { Metadata } from 'next'
import type { Locale } from '@/types/payload'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = (lang === 'en' ? 'en' : 'pl') as Locale
  const page = await contentService.getAboutPage(locale)
  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: {
      canonical: absoluteUrl(lang, '/about'),
      languages: hreflangAlternates('/about'),
    },
  }
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = (lang === 'en' ? 'en' : 'pl') as Locale
  const dict = await getDictionary(locale)

  const [features, processSteps, page] = await Promise.all([
    contentService.getFeatures(locale),
    contentService.getProcessSteps(locale),
    contentService.getAboutPage(locale),
  ])

  return (
    <>
      <Topbar lang={locale} />
      <Header dict={dict} lang={locale} />

      <main className="bg-black min-h-screen">
        <PageHeader
          title={page.header.title}
          description={page.header.description}
          breadcrumbs={[
            { label: dict.breadcrumbs.home, href: localePath(locale, '/') },
            { label: dict.nav.about },
          ]}
          dict={dict}
        />
        <WhyUs dict={dict} features={features} />
        <TrustBar dict={dict} />
        <Process dict={dict} steps={processSteps} />
      </main>

      <Footer dict={dict} lang={locale} />
    </>
  )
}
