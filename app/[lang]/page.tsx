import React from 'react'
import { getDictionary } from '@/dictionaries'
import { Locale } from '@/types/payload'
import { contentService } from '@/services/content.service'
import { getActiveTrips } from '@/lib/booking'
import { absoluteUrl, hreflangAlternates } from '@/lib/i18n'
import type { Metadata } from 'next'

import { Topbar } from '@/components/layout/Topbar'
import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/home/Hero'
import { Marquee } from '@/components/home/Marquee'
import { TrustBar } from '@/components/home/TrustBar'
import { WhyUs } from '@/components/home/WhyUs'
import { Fleet } from '@/components/home/Fleet'
import { Routes } from '@/components/home/Routes'
import { Pricing } from '@/components/home/Pricing'
import { Process } from '@/components/home/Process'
import { Gallery } from '@/components/home/Gallery'
import { FAQ } from '@/components/home/FAQ'
import { Testimonials } from '@/components/home/Testimonials'
import { CtaBanner } from '@/components/home/CtaBanner'
import { Contact } from '@/components/home/Contact'
import { Footer } from '@/components/layout/Footer'
import { StickyMobileCta } from '@/components/common/StickyMobileCta'
import { WhatsappFloat } from '@/components/common/WhatsappFloat'
import { SeoContent } from '@/components/common/SeoContent'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = (lang === 'en' ? 'en' : 'pl') as Locale
  const meta = await contentService.getMeta(locale)
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: absoluteUrl(lang, '/'),
      languages: hreflangAlternates('/'),
    },
  }
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = (lang === 'en' ? 'en' : 'pl') as Locale
  const dict = await getDictionary(locale)

  const [hero, marquee, features, fleet, routes, trips, steps, reviews, contactInfo, faq, gallery, ctaBanner] =
    await Promise.all([
      contentService.getHero(locale),
      contentService.getMarquee(locale),
      contentService.getFeatures(locale),
      contentService.getFleet(locale),
      contentService.getRoutes(locale),
      getActiveTrips(locale),
      contentService.getProcessSteps(locale),
      contentService.getReviews(locale),
      contentService.getContactInfo(locale),
      contentService.getFaq(locale),
      contentService.getGallery(locale),
      contentService.getCtaBanner(locale),
    ])

  return (
    <>
      <Topbar lang={locale} />
      <Header dict={dict} lang={locale} />

      <main>
        <Hero dict={dict} content={hero} lang={locale} />
        <Marquee phrases={marquee} />
        <TrustBar dict={dict} />
        <WhyUs dict={dict} features={features} />
        <Fleet dict={dict} fleet={fleet} />
        <Routes dict={dict} routes={routes} />
        <Pricing dict={dict} trips={trips} lang={locale} />
        <Process dict={dict} steps={steps} />
        <Gallery dict={dict} items={gallery} />
        <FAQ dict={dict} items={faq} phone={contactInfo.phones[0]} />
        <Testimonials dict={dict} reviews={reviews} />
        <CtaBanner dict={dict} contactInfo={contactInfo} content={ctaBanner} lang={locale} />
        <SeoContent
          lang={locale}
          title={
            locale === 'en'
              ? 'ATV adventures in the Polish Tatra foothills'
              : 'Przygoda off-road u stóp Tatr'
          }
          paragraphs={
            locale === 'en'
              ? [
                  'From our base in Ząb we lead small groups on Can-Am quads through forests, mud and mountain viewpoints. Rides last one or two hours and always include a briefing, helmet and guide.',
                  'Availability is checked against Google Calendar so you only see free slots. After booking you pay a deposit online and settle the rest before the start.',
                  'Looking for a company outing or stag party? Call us — we scale the number of quads to your group.',
                ]
              : [
                  'Z bazy w Zębie prowadzimy małe grupy na quadach Can-Am przez lasy, błoto i górskie punkty widokowe. Wyprawy trwają godzinę lub dwie i zawsze obejmują briefing, kask oraz przewodnika.',
                  'Dostępność sprawdzamy z Google Calendar — widzisz tylko wolne terminy. Po rezerwacji płacisz zaliczkę online, a resztę rozliczasz przed startem.',
                  'Wieczór kawalerski albo wyjazd firmowy? Zadzwoń — dopasujemy liczbę quadow do grupy.',
                ]
          }
        />
        <Contact dict={dict} contactInfo={contactInfo} />
      </main>

      <Footer dict={dict} lang={locale} />
      <WhatsappFloat />
      <StickyMobileCta dict={dict} lang={locale} />
    </>
  )
}
