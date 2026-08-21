import { absoluteUrl, hreflangAlternates, localePath } from '@/lib/i18n'
import { getDictionary } from '@/dictionaries'
import { PageHeader } from '@/components/common/PageHeader'
import { Topbar } from '@/components/layout/Topbar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Contact } from '@/components/home/Contact'
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
  const page = await contentService.getContactPage(locale)
  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: {
      canonical: absoluteUrl(lang, '/contact'),
      languages: hreflangAlternates('/contact'),
    },
  }
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = (lang === 'en' ? 'en' : 'pl') as Locale
  const dict = await getDictionary(locale)
  const [contactInfo, page] = await Promise.all([
    contentService.getContactInfo(locale),
    contentService.getContactPage(locale),
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
            { label: dict.nav.contact },
          ]}
          dict={dict}
        />
        <div className="pb-24">
          <Contact dict={dict} contactInfo={contactInfo} lang={lang} />
        </div>
      </main>

      <Footer dict={dict} lang={locale} />
    </>
  )
}
