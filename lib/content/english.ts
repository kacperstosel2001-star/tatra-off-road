import type {
  CtaBannerDTO,
  FaqDTO,
  FeatureDTO,
  HeroDTO,
  ProcessStepDTO,
  ReviewDTO,
  RouteDTO,
} from '@/types/payload'
import { SITE_CTA_IMAGE, SITE_HERO_POSTER, SITE_HERO_VIDEO, SITE_PHOTO } from '@/lib/content/site-media'

/** Full English homepage content — used when locale is `en` so CMS PL fallback is not shown. */
export const EN_META = {
  title: 'Tatra Off-Road — Can-Am Quad Tours in Podhale',
  description:
    'Guided Can-Am ATV tours through Podhale forests and trails. Legal routes, experienced guides, book online.',
}

export const EN_HERO: HeroDTO = {
  headline: 'The best',
  highlightWord: 'adventure',
  subheadline: 'off-road',
  lead: 'Can-Am quad tours through Podhale forests and trails. Legal routes, experienced guides, 2025 fleet.',
  badges: ['Can-Am 2025', 'Google 5/5', 'Legal trails', 'Experienced guides'],
  stats: [
    { value: '8+', label: 'Years on the trail' },
    { value: '1200+', label: 'Tours' },
    { value: '100%', label: 'Legal routes' },
  ],
  mediaType: 'video',
  bgImage: SITE_HERO_POSTER,
  videoUrl: SITE_HERO_VIDEO,
  primaryCtaLabel: 'Book online',
  secondaryCtaLabel: 'See prices',
  bookingPanel: {
    eyebrow: 'Quick booking',
    title: 'Start in 4 steps',
    steps: [
      { iconName: 'clock', text: 'Choose a 1h or 2h tour' },
      { iconName: 'users', text: 'Enter number of quads and passengers' },
      { iconName: 'map', text: 'Pick a free slot from the calendar' },
      { iconName: 'shield', text: 'Pay the deposit by BLIK / transfer' },
    ],
    buttonLabel: 'Check availability',
    finePrint: 'Deposit online · rest on site · instant confirmation',
  },
}

export const EN_CTA: CtaBannerDTO = {
  eyebrow: 'Ready?',
  titleLine1: 'Your trail is waiting',
  titleHighlight: 'just around the corner',
  description:
    'Last free dates this month. Call or book online — confirmation within 30 minutes.',
  bgImage: SITE_CTA_IMAGE,
}

export const EN_MARQUEE = [
  'Can-Am 2025',
  'Podhale & Tatras',
  'Forest trails',
  'Mountain trails',
  'Helmet included',
  'Experienced guides',
]

export const EN_FEATURES: FeatureDTO[] = [
  {
    id: '1',
    title: 'Can-Am 2025',
    description:
      'We run a modern Can-Am fleet — power, comfort and reliability for first-timers and experienced riders alike.',
    iconName: 'star',
  },
  {
    id: '2',
    title: 'We know every trail',
    description:
      'No random roads. Legal, planned routes through Podhale forests and ridges — matched to weather, season and group.',
    iconName: 'map',
  },
  {
    id: '3',
    title: 'Safety without shortcuts',
    description:
      'Helmet, protectors, a pre-ride briefing and a guide with the group the whole time. NNW insurance included in every package.',
    iconName: 'shield',
  },
  {
    id: '4',
    title: 'Packages for everyone',
    description:
      'First time on a quad, a weekend ride with a partner or a company outing — we match package, distance and pace.',
    iconName: 'users',
  },
]

export const EN_ROUTES: RouteDTO[] = [
  {
    id: '1',
    title: 'Podhale Forest',
    difficulty: 'Easy',
    routeNum: 'ROUTE 01',
    description: 'Forest paths and muddy stretches just outside Ząb. Perfect for your first ATV ride.',
    distance: '8 km',
    duration: '1 h',
    image: SITE_PHOTO['03'],
  },
  {
    id: '2',
    title: 'Mountain Trail',
    difficulty: 'Medium',
    routeNum: 'ROUTE 02',
    description: 'Clear climbs and Tatra views — for anyone who wants to feel the terrain under the wheels.',
    distance: '14 km',
    duration: '2 h',
    image: SITE_PHOTO['04'],
  },
  {
    id: '3',
    title: 'Panorama Route',
    difficulty: 'Scenic',
    routeNum: 'ROUTE 03',
    description: 'Best at sunset — ridges, clearings and a view across Podhale.',
    distance: '18 km',
    duration: '2.5 h',
    image: SITE_PHOTO['05'],
  },
]

export const EN_PROCESS: ProcessStepDTO[] = [
  {
    id: '1',
    stepNum: '01',
    title: 'Booking',
    description: 'Call or send an inquiry. We confirm the date, package and group size.',
    iconName: 'phone',
  },
  {
    id: '2',
    stepNum: '02',
    title: 'Briefing',
    description: 'On site you get a helmet and protectors. The instructor shows you how to ride.',
    iconName: 'shield',
  },
  {
    id: '3',
    stepNum: '03',
    title: 'The tour',
    description: 'We ride as a group at a pace that fits everyone. The guide keeps the route safe.',
    iconName: 'map',
  },
  {
    id: '4',
    stepNum: '04',
    title: 'Memories',
    description: 'Back at base we take photos and wrap up the ride over coffee.',
    iconName: 'camera',
  },
]

export const EN_REVIEWS: ReviewDTO[] = [
  {
    id: '1',
    author: 'Michał K.',
    location: 'Kraków · August 2026',
    rating: 5,
    content:
      'Awesome adventure. First time on a quad and it was great — machines in excellent condition, friendly and professional team. I’ll be back.',
  },
  {
    id: '2',
    author: 'Kasia W.',
    location: 'Warsaw · July 2026',
    rating: 5,
    content:
      'Huge fun with the crew. Varied trails, strong quads, everything well organised from the first call. Highly recommend.',
  },
  {
    id: '3',
    author: 'Tomek R.',
    location: 'Katowice · June 2026',
    rating: 5,
    content:
      'Perfect company outing. Clear briefing, safe pace and real off-road. Booking online was easy.',
  },
]

export const EN_FAQ: FaqDTO[] = [
  {
    id: '1',
    question: 'Do I need a driving licence?',
    answer:
      'Yes — category B for the driver. Passengers from age 10 (with a guardian). Sports footwear required.',
  },
  {
    id: '2',
    question: 'What is included in the price?',
    answer: 'Quad, fuel, helmet, briefing and a guide on the trail. NNW insurance included.',
  },
  {
    id: '3',
    question: 'How does the deposit work?',
    answer: 'Online you pay only the deposit (BLIK/transfer). The rest is paid on site before the start.',
  },
  {
    id: '4',
    question: 'Can I cancel or change the date?',
    answer: 'Yes — at least 24 hours before the start. Call us and we’ll help reschedule.',
  },
  {
    id: '5',
    question: 'What should I bring?',
    answer:
      'Closed sports or trekking shoes and comfortable clothes for the weather. We provide the rest of the protective gear.',
  },
  {
    id: '6',
    question: 'Nothing free online?',
    answer:
      'Call us — we’re often on site and can check an earlier start or a newly freed spot, even if the calendar looks full.',
  },
]

export function translateTripName(name: string, locale: 'pl' | 'en'): string {
  if (locale !== 'en') return name
  const n = name.toLowerCase()
  if (n.includes('2') && (n.includes('godzin') || n.includes('hour'))) return '2-hour ATV tour'
  if (n.includes('1') && (n.includes('godzin') || n.includes('hour'))) return '1-hour ATV tour'
  if (n.includes('wyprawa')) return name.replace(/wyprawa quadowa/gi, 'ATV tour').replace(/godzinna/gi, 'hour')
  return name
}

export const EN_PAGE = {
  flota: {
    seo: {
      title: 'Can-Am Fleet 2025 | Tatra Off-Road',
      description: 'See our Can-Am ATV fleet for guided tours in Podhale.',
    },
    header: {
      title: 'Can-Am fleet 2025',
      description:
        'Modern off-road machines in the heart of Podhale — reliable, powerful and comfortable for solo riders and pairs.',
    },
    equipment: {
      eyebrow: 'Gear',
      title: 'What you get',
      description: 'Protective gear and a briefing are always included.',
      items: [] as { title: string; description: string; iconName: string }[],
    },
  },
  trasy: {
    seo: {
      title: 'ATV Routes in Podhale | Tatra Off-Road',
      description: 'Forest, mountain and panoramic Can-Am trails near Ząb.',
    },
    header: {
      title: 'Our routes',
      description: 'Every ride follows a legal trail matched to weather and group level.',
    },
  },
  cennik: {
    seo: {
      title: 'ATV Tour Prices | Tatra Off-Road',
      description: '1h and 2h Can-Am tour prices — deposit online, rest on site.',
    },
    header: {
      title: 'Pricing',
      description: 'Current Can-Am tour prices — deposit online, the rest on site.',
    },
  },
  about: {
    seo: {
      title: 'About Us | Tatra Off-Road',
      description: 'Local crew, legal trails and Can-Am 2025 in Podhale.',
    },
    header: {
      title: 'About Tatra Off-Road',
      description: 'A local team, legal trails and Can-Am 2025.',
    },
  },
  contact: {
    seo: {
      title: 'Contact & Booking | Tatra Off-Road',
      description: 'Call or write — Ząb, Podhale. Book your Can-Am tour.',
    },
    header: {
      title: 'Contact',
      description: 'Call or write — we are available every day after booking.',
    },
  },
} as const
