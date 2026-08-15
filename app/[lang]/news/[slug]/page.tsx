import { getDictionary } from '@/dictionaries'
import { contentService } from '@/services/content.service'
import { PageHeader } from '@/components/common/PageHeader'
import { NewsSidebar } from '@/components/news/NewsSidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { absoluteUrl, localePath } from '@/lib/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const article = await contentService.getNewsBySlug(slug, lang === 'en' ? 'en' : 'pl')

  if (!article) return {}

  return {
    title: article.meta.title,
    description: article.meta.description,
    openGraph: {
      title: article.meta.title,
      description: article.meta.description,
      type: 'article',
      url: absoluteUrl(lang, `/news/${slug}`),
      images: article.image ? [article.image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const locale = lang === 'en' ? 'en' : 'pl'
  const dict = await getDictionary(lang as any)
  const [article, news, contactInfo] = await Promise.all([
    contentService.getNewsBySlug(slug, locale),
    contentService.getNews(locale),
    contentService.getContactInfo(locale),
  ])

  if (!article) return notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    image: article.image ? [article.image] : [],
    datePublished: article.publishedAt,
    author: {
      '@type': 'Organization',
      name: article.author,
    },
  }

  return (
    <>
      <Topbar lang={lang} />
      <Header dict={dict} lang={lang} />

      <main className="bg-black min-h-screen">
        <PageHeader
          title={article.title}
          breadcrumbs={[
            { label: dict.breadcrumbs.home, href: localePath(lang, '/') },
            { label: dict.nav.news, href: localePath(lang, '/news') },
            { label: article.title },
          ]}
          dict={dict}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <section className="py-12 lg:py-20 max-w-[1320px] mx-auto px-6 lg:px-[56px]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-12 lg:gap-16 items-start">
            <article>
              {article.image ? (
                <div className="relative w-full h-[280px] lg:h-[460px] mb-10 lg:mb-12 overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    priority
                  />
                </div>
              ) : null}

              <div className="flex items-center gap-4 text-[13px] font-label uppercase tracking-[0.1em] text-orange mb-8">
                <span>
                  {dict.news.published}:{' '}
                  {new Date(article.publishedAt).toLocaleDateString(
                    lang === 'en' ? 'en-US' : lang === 'de' ? 'de-DE' : 'pl-PL',
                  )}
                </span>
                <span className="w-1 h-1 bg-stone rounded-full" />
                <span>{article.author}</span>
              </div>

              <div
                className="prose prose-invert prose-orange max-w-none prose-p:text-stone prose-p:text-[16px] prose-p:leading-[1.8] prose-headings:font-display prose-headings:text-snow prose-headings:uppercase"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <div className="mt-16 pt-8 border-t border-[rgba(245,241,231,0.1)]">
                <Link
                  href={localePath(lang, '/news')}
                  className="inline-block text-[13px] font-label text-snow uppercase tracking-[0.1em] hover:text-orange transition-colors"
                >
                  &larr; {dict.news.back}
                </Link>
              </div>
            </article>

            <NewsSidebar
              dict={dict}
              lang={lang}
              contactInfo={contactInfo}
              recent={news}
              currentSlug={article.slug}
            />
          </div>
        </section>
      </main>

      <Footer dict={dict} lang={lang} />
    </>
  )
}
