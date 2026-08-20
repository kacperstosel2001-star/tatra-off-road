import { getPayloadClient } from '@/lib/booking'
import { resolveMediaUrl, resolveRealMediaUrl } from '@/lib/content/media'
import {
  getSiteGallery,
  SITE_CTA_IMAGE,
  SITE_HERO_POSTER,
  SITE_HERO_VIDEO,
  SITE_PHOTO,
} from '@/lib/content/site-media'
import { fixOrphansDeep } from '@/lib/typography'
import type { ContentRepository } from '@/repositories/content.repository'
import type {
  HeroDTO,
  FeatureDTO,
  FleetDTO,
  RouteDTO,
  PricingPlanDTO,
  ProcessStepDTO,
  ReviewDTO,
  ContactInfoDTO,
  MetaDTO,
  NewsDTO,
  FaqDTO,
  GalleryItemDTO,
  FlotaPageDTO,
  SimplePageDTO,
  CtaBannerDTO,
  Locale,
} from '@/types/payload'

function loc(locale?: Locale): Locale {
  return locale === 'en' ? 'en' : 'pl'
}

function t<T>(data: T): T {
  return fixOrphansDeep(data)
}

const FALLBACK_NEWS: NewsDTO[] = [
  {
    id: 'fallback-1',
    title: 'Nowe Can-Am Outlander 2025 już we flocie!',
    slug: 'nowe-can-am-outlander-2025',
    excerpt:
      'Do naszej floty dołączyły właśnie najnowsze modele Can-Am Outlander 2025. Sprawdź, co się zmieniło i dlaczego warto je przetestować.',
    content:
      '<p>W tym sezonie stawiamy na najwyższą jakość i niezawodność. Modele Can-Am Outlander z rocznika 2025 charakteryzują się ulepszonym zawieszeniem oraz jeszcze wydajniejszym układem chłodzenia.</p>',
    publishedAt: '2026-06-15T10:00:00.000Z',
    image: SITE_PHOTO['01'],
    author: 'Tatra Off-Road Team',
    meta: {
      title: 'Nowe Can-Am Outlander 2025 | Tatra Off-Road',
      description: 'Najnowsze modele Can-Am we flocie Tatra Off-Road.',
    },
  },
  {
    id: 'fallback-2',
    title: 'Jak ubrać się na wyprawę quadami w górach?',
    slug: 'jak-ubrac-sie-na-wyprawe-quadami',
    excerpt:
      'Przygotowanie do wyprawy to klucz do udanej zabawy. Zebraliśmy najważniejsze wskazówki dotyczące stroju w zależności od pory roku.',
    content:
      '<p>Niezależnie od pogody, zawsze zalecamy wygodne buty z twardą podeszwą oraz długie spodnie. Dostarczamy kaski, kominiarki i gogle.</p>',
    publishedAt: '2026-05-20T14:30:00.000Z',
    image: SITE_PHOTO['02'],
    author: 'Tatra Off-Road Team',
    meta: {
      title: 'Jak ubrać się na wyprawę quadami? | Blog Tatra Off-Road',
      description: 'Poradnik: jak dobrać strój na wycieczkę quadami w górach.',
    },
  },
  {
    id: 'fallback-3',
    title: 'Bezpieczeństwo na szlaku — co warto wiedzieć',
    slug: 'bezpieczenstwo-na-szlaku',
    excerpt: 'Kask, briefing i tempo grupy to podstawa. Opisujemy, jak dbamy o bezpieczeństwo na każdej trasie.',
    content:
      '<p>Przed startem każdy uczestnik dostaje sprzęt ochronny i krótkie szkolenie. Jedziemy tylko legalnymi trasami.</p>',
    publishedAt: '2026-07-02T09:00:00.000Z',
    image: SITE_PHOTO['03'],
    author: 'Tatra Off-Road Team',
    meta: {
      title: 'Bezpieczeństwo na szlaku | Tatra Off-Road',
      description: 'Jak wygląda bezpieczeństwo na wyprawach quadowych.',
    },
  },
  {
    id: 'fallback-4',
    title: 'Najlepsze trasy Podhala na lato 2026',
    slug: 'najlepsze-trasy-podhala-lato-2026',
    excerpt: 'Lasy, grzbiety i widoki na Tatry — zestawienie tras, które najczęściej wybieracie latem.',
    content:
      '<p>Latem najczęściej rezerwujecie trasy leśne wokół Zębu oraz dłuższe wyprawy z panoramą Tatr.</p>',
    publishedAt: '2026-07-18T11:00:00.000Z',
    image: SITE_PHOTO['04'],
    author: 'Tatra Off-Road Team',
    meta: {
      title: 'Najlepsze trasy Podhala 2026 | Tatra Off-Road',
      description: 'Polecane trasy quadowe na Podhalu.',
    },
  },
  {
    id: 'fallback-5',
    title: 'Wyprawa firmowa — integracja na quadach',
    slug: 'wyprawa-firmowa-integracja-na-quadach',
    excerpt: 'Szukacie nietuzinkowej integracji? Opisujemy, jak wygląda dzień firmowy z Can-Am.',
    content:
      '<p>Organizujemy pakiety dla zespołów: briefing, wspólna trasa i zdjęcia z wyprawy.</p>',
    publishedAt: '2026-08-01T08:30:00.000Z',
    image: SITE_PHOTO['05'],
    author: 'Tatra Off-Road Team',
    meta: {
      title: 'Integracja firmowa na quadach | Tatra Off-Road',
      description: 'Wyprawy quadowe dla firm na Podhalu.',
    },
  },
  {
    id: 'fallback-6',
    title: 'Sezon zimowy: quady po śniegu na Podhalu',
    slug: 'sezon-zimowy-quady-po-sniegu',
    excerpt: 'Zimą trasy wyglądają zupełnie inaczej. Sprawdź, kiedy jeździmy i jak się przygotować.',
    content:
      '<p>Przy odpowiedniej pokrywie śnieżnej wyruszamy na wybrane odcinki z większym naciskiem na bezpieczeństwo.</p>',
    publishedAt: '2026-01-12T12:00:00.000Z',
    image: SITE_PHOTO['06'],
    author: 'Tatra Off-Road Team',
    meta: {
      title: 'Quady zimą na Podhalu | Tatra Off-Road',
      description: 'Zimowe wyprawy quadowe Tatra Off-Road.',
    },
  },
]

const mockHero: HeroDTO = {
  headline: 'Najlepsza',
  highlightWord: 'przygoda',
  subheadline: 'w terenie',
  lead: 'Wyprawy quadami Can-Am przez lasy i szlaki Podhala. Legalne trasy, doświadczeni przewodnicy, sprzęt 2025.',
  badges: ['Can-Am 2025', 'Ocena 4.9/5', 'Legalne trasy', 'Doświadczeni przewodnicy'],
  stats: [
    { value: '8+', label: 'Lat na trasie' },
    { value: '1200+', label: 'Wypraw' },
    { value: '100%', label: 'Legalnych szlaków' },
  ],
  mediaType: 'video',
  bgImage: SITE_HERO_POSTER,
  videoUrl: SITE_HERO_VIDEO,
  primaryCtaLabel: 'Zarezerwuj online',
  secondaryCtaLabel: 'Zobacz ceny',
  bookingPanel: {
    eyebrow: 'Szybka Rezerwacja',
    title: 'Start w 4 krokach',
    steps: [
      { iconName: 'clock', text: 'Wybierz wyprawę 1h lub 2h' },
      { iconName: 'users', text: 'Podaj liczbę quadow i pasażerów' },
      { iconName: 'map', text: 'Weź wolny termin z kalendarza' },
      { iconName: 'shield', text: 'Opłać zaliczkę BLIK / przelew' },
    ],
    buttonLabel: 'Sprawdź dostępność',
    finePrint: 'Zaliczka online · reszta na miejscu · potwierdzenie od razu',
  },
}

const mockCta: CtaBannerDTO = {
  eyebrow: 'Gotowy?',
  titleLine1: 'Twoja trasa czeka',
  titleHighlight: 'tuż za rogiem',
  description:
    'Ostatnie wolne terminy w tym miesiącu. Zadzwoń lub zarezerwuj online — potwierdzenie w 30 minut.',
  bgImage: SITE_CTA_IMAGE,
}

export class PayloadContentService implements ContentRepository {
  async getMeta(locale?: Locale): Promise<MetaDTO> {
    try {
      const payload = await getPayloadClient()
      const page = await payload.findGlobal({
        slug: 'home-page',
        locale: loc(locale),
        fallbackLocale: 'pl',
      })
      const seo = (page as any).seo
      if (seo?.title) {
        return {
          title: seo.title,
          description: seo.description || '',
          image: resolveMediaUrl(seo.image) || undefined,
        }
      }
    } catch {
      /* fallback */
    }
    return {
      title: 'Tatra Off-Road — Wyprawy Quadami po Podhalu',
      description:
        'Wyprawy quadami przez lasy i szlaki Podhala. Legalne trasy, doświadczeni przewodnicy, najnowszy sprzęt Can-Am.',
    }
  }

  async getHero(locale?: Locale): Promise<HeroDTO> {
    try {
      const payload = await getPayloadClient()
      const page = await payload.findGlobal({
        slug: 'home-page',
        locale: loc(locale),
        fallbackLocale: 'pl',
        depth: 1,
      })
      const hero = (page as any).hero
      if (!hero?.headline) return mockHero
      const panel = hero.bookingPanel || {}
      const videoFromUpload = resolveMediaUrl(hero.video)
      const videoUrl = videoFromUpload || hero.videoUrl || SITE_HERO_VIDEO
      return {
        headline: hero.headline || mockHero.headline,
        highlightWord: hero.highlightWord || mockHero.highlightWord,
        subheadline: hero.subheadline || mockHero.subheadline,
        lead: hero.lead || mockHero.lead,
        badges: (hero.badges || []).map((b: any) => b.label).filter(Boolean),
        stats: (hero.stats || []).map((s: any) => ({ value: s.value, label: s.label })),
        mediaType: videoUrl ? 'video' : hero.mediaType === 'video' ? 'video' : 'image',
        bgImage: resolveRealMediaUrl(hero.bgImage, hero.bgImageUrl, SITE_HERO_POSTER),
        videoUrl,
        primaryCtaLabel: hero.primaryCtaLabel || mockHero.primaryCtaLabel,
        secondaryCtaLabel: hero.secondaryCtaLabel || mockHero.secondaryCtaLabel,
        bookingPanel: {
          eyebrow: panel.eyebrow || mockHero.bookingPanel.eyebrow,
          title: panel.title || mockHero.bookingPanel.title,
          steps:
            panel.steps?.length > 0
              ? panel.steps.map((s: any) => ({
                  iconName: s.iconName || 'clock',
                  text: s.text,
                }))
              : mockHero.bookingPanel.steps,
          buttonLabel: panel.buttonLabel || mockHero.bookingPanel.buttonLabel,
          finePrint: panel.finePrint || mockHero.bookingPanel.finePrint,
        },
      }
    } catch {
      return mockHero
    }
  }

  async getCtaBanner(locale?: Locale): Promise<CtaBannerDTO> {
    try {
      const payload = await getPayloadClient()
      const page = await payload.findGlobal({
        slug: 'home-page',
        locale: loc(locale),
        fallbackLocale: 'pl',
        depth: 1,
      })
      const cta = (page as any).ctaBanner
      if (!cta?.titleLine1 && !cta?.description) return mockCta
      return {
        eyebrow: cta.eyebrow || mockCta.eyebrow,
        titleLine1: cta.titleLine1 || mockCta.titleLine1,
        titleHighlight: cta.titleHighlight || mockCta.titleHighlight,
        description: cta.description || mockCta.description,
        bgImage: resolveRealMediaUrl(cta.bgImage, cta.bgImageUrl, SITE_CTA_IMAGE),
      }
    } catch {
      return mockCta
    }
  }

  async getMarquee(locale?: Locale): Promise<string[]> {
    try {
      const payload = await getPayloadClient()
      const page = await payload.findGlobal({
        slug: 'home-page',
        locale: loc(locale),
        fallbackLocale: 'pl',
      })
      const phrases = ((page as any).marqueePhrases || [])
        .map((p: any) => p.text)
        .filter(Boolean)
      if (phrases.length) return phrases
    } catch {
      /* fallback */
    }
    return [
      'Can-Am Outlander 2025',
      'Podhale & Tatry',
      'Trasy leśne',
      'Trasy górskie',
      'Kask w cenie',
      'Doświadczeni przewodnicy',
    ]
  }

  async getFeatures(locale?: Locale): Promise<FeatureDTO[]> {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'features',
        locale: loc(locale),
        fallbackLocale: 'pl',
        where: { active: { equals: true } },
        sort: 'sortOrder',
        limit: 50,
      })
      if (result.docs.length) {
        return result.docs.map((d: any) => ({
          id: String(d.id),
          title: d.title,
          description: d.description || '',
          iconName: d.iconName || 'star',
        }))
      }
    } catch {
      /* fallback */
    }
    return [
      {
        id: '1',
        title: 'Can-Am 2025',
        description:
          'Jako jedyni w regionie oferujemy najnowsze modele Can-Am. Moc, komfort i niezawodność — zarówno dla początkujących, jak i tych, którzy jeździli już wcześniej.',
        iconName: 'star',
      },
      {
        id: '2',
        title: 'Znamy każdy szlak',
        description:
          'Nie ruszamy przypadkowymi drogami. Legalne, zaplanowane trasy przez lasy podhalańskie i grzbiety — dopasowane do pogody, pory roku i grupy.',
        iconName: 'map',
      },
      {
        id: '3',
        title: 'Bezpieczeństwo bez kompromisów',
        description:
          'Kask, ochraniacze, briefing przed startem i przewodnik pilnujący grupy przez cały czas. Ubezpieczenie NNW jest wliczone w każdy pakiet.',
        iconName: 'shield',
      },
      {
        id: '4',
        title: 'Pakiety dla każdego',
        description:
          'Pierwszy raz na quadzie, weekendowa jazda z partnerem czy integracja firmowa — mamy dopasowany pakiet, długość trasy i tempo.',
        iconName: 'users',
      },
    ]
  }

  async getFleet(locale?: Locale): Promise<FleetDTO[]> {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'fleet-vehicles',
        locale: loc(locale),
        fallbackLocale: 'pl',
        where: { active: { equals: true } },
        sort: 'sortOrder',
        limit: 50,
        depth: 1,
      })
      if (result.docs.length) {
        return result.docs.map((d: any, idx: number) => {
          const keys = Object.keys(SITE_PHOTO) as Array<keyof typeof SITE_PHOTO>
          const fallback = SITE_PHOTO[keys[idx % keys.length]]
          return {
            id: String(d.id),
            name: d.name,
            type: d.type || '',
            power: d.power || '',
            drive: d.drive || '',
            seats: d.seats || '',
            year: d.year || '',
            badge: d.badge || '',
            image: resolveRealMediaUrl(d.image, d.imageUrl, fallback),
          }
        })
      }
    } catch {
      /* fallback */
    }
    return [
      {
        id: '1',
        name: 'Can-Am Outlander',
        type: 'Solo Ride',
        power: '82 KM',
        drive: '4x4',
        seats: '1',
        year: '2025',
        badge: '1-osobowy',
        image: SITE_PHOTO['01'],
      },
      {
        id: '2',
        name: 'Can-Am Outlander MAX',
        type: 'Duo Ride',
        power: '91 KM',
        drive: '4x4',
        seats: '2',
        year: '2025',
        badge: '2-osobowy',
        image: SITE_PHOTO['02'],
      },
    ]
  }

  async getRoutes(locale?: Locale): Promise<RouteDTO[]> {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'tour-routes',
        locale: loc(locale),
        fallbackLocale: 'pl',
        where: { active: { equals: true } },
        sort: 'sortOrder',
        limit: 50,
        depth: 1,
      })
      if (result.docs.length) {
        return result.docs.map((d: any, idx: number) => {
          const keys = Object.keys(SITE_PHOTO) as Array<keyof typeof SITE_PHOTO>
          const fallback = SITE_PHOTO[keys[(idx + 2) % keys.length]]
          return {
            id: String(d.id),
            title: d.title,
            difficulty: d.difficulty || '',
            routeNum: d.routeNum || '',
            description: d.description || '',
            distance: d.distance || '',
            duration: d.duration || '',
            image: resolveRealMediaUrl(d.image, d.imageUrl, fallback),
          }
        })
      }
    } catch {
      /* fallback */
    }
    return [
      {
        id: '1',
        title: 'Las Podhalański',
        difficulty: 'Łatwa',
        routeNum: 'TRASA 01',
        description: 'Leśne ścieżki i błotniste odcinki tuż za Zębem. Idealna na pierwszą jazdę quadem.',
        distance: '8 km',
        duration: '1 godz.',
        image: SITE_PHOTO['03'],
      },
      {
        id: '2',
        title: 'Szlak Górski',
        difficulty: 'Średnia',
        routeNum: 'TRASA 02',
        description: 'Wyraźne podjazdy i widoki na Tatry — dla tych, którzy chcą poczuć teren pod kołami.',
        distance: '14 km',
        duration: '2 godz.',
        image: SITE_PHOTO['04'],
      },
      {
        id: '3',
        title: 'Trasa Panoramiczna',
        difficulty: 'Panoramiczna',
        routeNum: 'TRASA 03',
        description: 'Najlepsza o zachodzie słońca — grzbiety, polany i widok na całe Podhale.',
        distance: '18 km',
        duration: '2,5 godz.',
        image: SITE_PHOTO['05'],
      },
    ]
  }

  async getPricingPlans(_locale?: Locale): Promise<PricingPlanDTO[]> {
    return []
  }

  async getProcessSteps(locale?: Locale): Promise<ProcessStepDTO[]> {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'process-steps',
        locale: loc(locale),
        fallbackLocale: 'pl',
        where: { active: { equals: true } },
        sort: 'sortOrder',
        limit: 50,
      })
      if (result.docs.length) {
        return result.docs.map((d: any) => ({
          id: String(d.id),
          stepNum: d.stepNum,
          title: d.title,
          description: d.description || '',
          iconName: d.iconName || 'phone',
        }))
      }
    } catch {
      /* fallback */
    }
    return [
      {
        id: '1',
        stepNum: '01',
        title: 'Rezerwacja',
        description: 'Dzwonisz lub wysyłasz zapytanie. Ustalamy termin, pakiet i liczbę osób.',
        iconName: 'phone',
      },
      {
        id: '2',
        stepNum: '02',
        title: 'Briefing',
        description: 'Na miejscu dostajesz kask i ochraniacze. Instruktor pokazuje obsługę quada.',
        iconName: 'shield',
      },
      {
        id: '3',
        stepNum: '03',
        title: 'Wyprawa',
        description: 'Jedziemy w grupie, w tempie dopasowanym do uczestników. Przewodnik pilnuje trasy.',
        iconName: 'map',
      },
      {
        id: '4',
        stepNum: '04',
        title: 'Pamiątki',
        description: 'Wracamy do bazy, robimy zdjęcia i podsumowujemy wyprawę przy kawie.',
        iconName: 'camera',
      },
    ]
  }

  async getReviews(locale?: Locale): Promise<ReviewDTO[]> {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'reviews',
        locale: loc(locale),
        fallbackLocale: 'pl',
        where: { active: { equals: true } },
        sort: 'sortOrder',
        limit: 50,
      })
      if (result.docs.length) {
        return result.docs.map((d: any) => ({
          id: String(d.id),
          author: d.author,
          location: d.location || '',
          content: d.content,
          rating: d.rating || 5,
        }))
      }
    } catch {
      /* fallback */
    }
    return [
      {
        id: '1',
        author: 'Michał K.',
        location: 'Kraków · Sierpień 2026',
        rating: 5,
        content:
          'Super przygoda. Wypożyczyłem quada pierwszy raz i było świetnie — maszyny w świetnym stanie, obsługa miła i profesjonalna. Na pewno wrócę.',
      },
      {
        id: '2',
        author: 'Kasia W.',
        location: 'Warszawa · Lipiec 2026',
        rating: 5,
        content:
          'Mega zabawa z ekipą. Trasy różnorodne, quady mocne, a wszystko dobrze zorganizowane od pierwszego telefonu. Polecam każdemu.',
      },
      {
        id: '3',
        author: 'Tomasz P.',
        location: 'Gdańsk · Czerwiec 2026',
        rating: 5,
        content:
          'Wszystko na plus — sprzęt zadbany, obsługa konkretna i pomocna. Świetny sposób, żeby zobaczyć Podhale z innej strony.',
      },
    ]
  }

  async getFaq(locale?: Locale): Promise<FaqDTO[]> {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'faq-items',
        locale: loc(locale),
        fallbackLocale: 'pl',
        where: { active: { equals: true } },
        sort: 'sortOrder',
        limit: 100,
      })
      if (result.docs.length) {
        return result.docs.map((d: any) => ({
          id: String(d.id),
          question: d.question,
          answer: d.answer,
        }))
      }
    } catch {
      /* fallback */
    }
    return []
  }

  async getGallery(locale?: Locale): Promise<GalleryItemDTO[]> {
    // Always show site photos from `zdjecia i filmiki` so every file is on the page.
    return getSiteGallery(locale)
  }

  async getNews(locale?: Locale): Promise<NewsDTO[]> {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'news-posts',
        locale: loc(locale),
        fallbackLocale: 'pl',
        where: { active: { equals: true } },
        sort: '-publishedAt',
        limit: 50,
        depth: 1,
      })
      if (result.docs.length) {
        return result.docs.map((d: any) => this.mapNews(d))
      }
    } catch {
      /* fallback */
    }
    return FALLBACK_NEWS
  }

  async getNewsBySlug(slug: string, locale?: Locale): Promise<NewsDTO | null> {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'news-posts',
        locale: loc(locale),
        fallbackLocale: 'pl',
        where: { and: [{ slug: { equals: slug } }, { active: { equals: true } }] },
        limit: 1,
        depth: 1,
      })
      if (result.docs[0]) return this.mapNews(result.docs[0])
    } catch {
      /* fallback */
    }
    return FALLBACK_NEWS.find((item) => item.slug === slug) || null
  }

  private mapNews(d: any): NewsDTO {
    return {
      id: String(d.id),
      title: d.title,
      slug: d.slug,
      excerpt: d.excerpt || '',
      content: d.content || '',
      publishedAt: d.publishedAt,
      image: resolveRealMediaUrl(d.image, d.imageUrl, SITE_PHOTO['07']),
      author: d.author || 'Tatra Off-Road Team',
      meta: {
        title: d.meta?.title || d.title,
        description: d.meta?.description || d.excerpt || '',
      },
    }
  }

  async getContactInfo(locale?: Locale): Promise<ContactInfoDTO> {
    try {
      const payload = await getPayloadClient()
      const settings = await payload.findGlobal({
        slug: 'site-settings',
        locale: loc(locale),
        fallbackLocale: 'pl',
      })
      const s = settings as any
      if (s.address || s.email || s.phones?.length) {
        const phones = (s.phones || []).map((p: any) => p.number).filter(Boolean)
        return {
          address: s.address || '',
          phones,
          email: s.email || '',
          hours: s.hours || '',
          whatsapp: s.whatsapp || phones[0] || '',
        }
      }
    } catch {
      /* fallback */
    }
    return {
      address: 'Ul. Świętej Anny 39, 34-521 Ząb',
      phones: ['+48 888 254 223', '+48 530 198 735'],
      email: 'tatraoffroad@gmail.com',
      hours: 'Wyprawy codziennie, 8:00–20:00, po rezerwacji',
      whatsapp: '+48 888 254 223',
    }
  }

  private async getSimplePage(
    slug: 'trasy-page' | 'cennik-page' | 'about-page' | 'contact-page',
    locale: Locale | undefined,
    fallback: SimplePageDTO,
  ): Promise<SimplePageDTO> {
    try {
      const payload = await getPayloadClient()
      const page = await payload.findGlobal({
        slug,
        locale: loc(locale),
        fallbackLocale: 'pl',
        depth: 1,
      })
      const p = page as any
      return {
        seo: {
          title: p.seo?.title || fallback.seo.title,
          description: p.seo?.description || fallback.seo.description,
          image: resolveMediaUrl(p.seo?.image) || undefined,
        },
        header: {
          title: p.header?.title || fallback.header.title,
          description: p.header?.description || fallback.header.description,
        },
      }
    } catch {
      return fallback
    }
  }

  async getFlotaPage(locale?: Locale): Promise<FlotaPageDTO> {
    const fallback: FlotaPageDTO = {
      seo: {
        title: 'Flota Quadów Can-Am 2025 | Tatra Off-Road',
        description: 'Zobacz naszą flotę Can-Am Outlander 2025 na Podhalu.',
      },
      header: {
        title: 'Flota Quadów Can-Am 2025',
        description:
          'Najnowszy sprzęt off-road w sercu Podhala. Maszyny Can-Am Outlander to gwarancja niezawodności, mocy oraz maksymalnego komfortu.',
      },
      equipment: {
        eyebrow: 'Wyposażenie i Bezpieczeństwo',
        title: 'Standard premium\nw cenie wyprawy',
        description: 'Każdy uczestnik wyprawy otrzymuje kompletny pakiet ochronny najwyższej klasy.',
        items: [],
      },
      cta: {
        title: 'Gotowy na jazdę?',
        description: 'Wybierz termin i zarezerwuj quada online.',
        buttonLabel: 'Zarezerwuj',
      },
    }
    try {
      const payload = await getPayloadClient()
      const page = await payload.findGlobal({
        slug: 'flota-page',
        locale: loc(locale),
        fallbackLocale: 'pl',
        depth: 1,
      })
      const p = page as any
      return {
        seo: {
          title: p.seo?.title || fallback.seo.title,
          description: p.seo?.description || fallback.seo.description,
          image: resolveMediaUrl(p.seo?.image) || undefined,
        },
        header: {
          title: p.header?.title || fallback.header.title,
          description: p.header?.description || fallback.header.description,
        },
        equipment: {
          eyebrow: p.equipment?.eyebrow || fallback.equipment.eyebrow,
          title: p.equipment?.title || fallback.equipment.title,
          description: p.equipment?.description || fallback.equipment.description,
          items: (p.equipment?.items || []).map((i: any) => ({
            title: i.title,
            description: i.description || '',
            iconName: i.iconName || 'shield',
          })),
        },
        cta: {
          title: p.cta?.title || fallback.cta.title,
          description: p.cta?.description || fallback.cta.description,
          buttonLabel: p.cta?.buttonLabel || fallback.cta.buttonLabel,
        },
      }
    } catch {
      return fallback
    }
  }

  async getTrasyPage(locale?: Locale): Promise<SimplePageDTO> {
    return this.getSimplePage('trasy-page', locale, {
      seo: {
        title: 'Trasy quadowe Podhale | Tatra Off-Road',
        description: 'Legalne trasy leśne i górskie w okolicach Zębu.',
      },
      header: {
        title: 'Nasze trasy',
        description: 'Od łatwych leśnych pętli po panoramiczne grzbiety z widokiem na Tatry.',
      },
    })
  }

  async getCennikPage(locale?: Locale): Promise<SimplePageDTO> {
    return this.getSimplePage('cennik-page', locale, {
      seo: {
        title: 'Cennik wypraw quadowych | Tatra Off-Road',
        description: 'Aktualne ceny wypraw Can-Am — zaliczka online, reszta na miejscu.',
      },
      header: {
        title: 'Cennik',
        description: 'Ceny za quada. Zaliczka online, reszta płatna na miejscu.',
      },
    })
  }

  async getAboutPage(locale?: Locale): Promise<SimplePageDTO> {
    return this.getSimplePage('about-page', locale, {
      seo: {
        title: 'O nas | Tatra Off-Road',
        description: 'Kim jesteśmy i jak prowadzimy wyprawy quadowe na Podhalu.',
      },
      header: {
        title: 'O nas',
        description: 'Lokalna ekipa, legalne trasy i Can-Am 2025.',
      },
    })
  }

  async getContactPage(locale?: Locale): Promise<SimplePageDTO> {
    return this.getSimplePage('contact-page', locale, {
      seo: {
        title: 'Kontakt | Tatra Off-Road',
        description: 'Zadzwoń lub napisz — Ząb, Podhale.',
      },
      header: {
        title: 'Kontakt',
        description: 'Jesteśmy dostępni codziennie po rezerwacji.',
      },
    })
  }
}

export const contentService = new Proxy(new PayloadContentService(), {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver)
    if (typeof value === 'function') {
      return async (...args: unknown[]) => {
        const result = await (value as (...a: unknown[]) => Promise<unknown>).apply(target, args)
        return t(result)
      }
    }
    return value
  },
}) as PayloadContentService
