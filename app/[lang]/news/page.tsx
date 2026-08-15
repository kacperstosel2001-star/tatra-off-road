import { absoluteUrl, hreflangAlternates, localePath } from '@/lib/i18n'
import { getDictionary } from '@/dictionaries'
import { contentService } from '@/services/content.service'
import { PageHeader } from '@/components/common/PageHeader'
import { NewsCard } from '@/components/news/NewsCard'
import { NewsSidebar } from '@/components/news/NewsSidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  return {
    title: `${dict.nav.news} | Tatra Off-Road`,
    description: 'Najnowsze informacje, relacje z tras i porady dotyczące wypraw off-road.',
    alternates: {
      canonical: absoluteUrl(lang, '/news'),
      languages: hreflangAlternates('/news'),
    },
  }
}

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = lang === 'en' ? 'en' : 'pl'
  const dict = await getDictionary(lang as any)
  const [news, contactInfo] = await Promise.all([
    contentService.getNews(locale),
    contentService.getContactInfo(locale),
  ])

  return (
    <>
      <Topbar lang={lang} />
      <Header dict={dict} lang={lang} />

      <main className="bg-black min-h-screen">
        <PageHeader
          title={dict.nav.news}
          breadcrumbs={[
            { label: dict.breadcrumbs.home, href: localePath(lang, '/') },
            { label: dict.nav.news },
          ]}
          dict={dict}
        />

        <section className="py-16 lg:py-24 max-w-[1320px] mx-auto px-6 lg:px-[56px]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-12 lg:gap-16 items-start">
            <div>
              {news.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {news.map((article) => (
                    <NewsCard key={article.id} article={article} lang={lang} dict={dict} />
                  ))}
                </div>
              ) : (
                <p className="text-stone text-[16px] m-0">{dict.news.empty}</p>
              )}
            </div>
            <NewsSidebar dict={dict} lang={lang} contactInfo={contactInfo} recent={news} />
          </div>
        </section>
      </main>

      <Footer dict={dict} lang={lang} />
    </>
  )
}
