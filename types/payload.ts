export type Locale = 'pl' | 'en'

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface MetaDTO {
  title: string
  description: string
  image?: string
}

export interface PageHeaderDTO {
  title: string
  description: string
}

export interface HeroDTO {
  headline: string
  highlightWord?: string
  subheadline: string
  lead?: string
  badges: string[]
  stats: { value: string; label: string }[]
  mediaType: 'image' | 'video'
  bgImage: string
  videoUrl?: string
  primaryCtaLabel?: string
  secondaryCtaLabel?: string
  bookingPanel: {
    eyebrow: string
    title: string
    steps: { iconName: string; text: string }[]
    buttonLabel: string
    finePrint: string
  }
}

export interface CtaBannerDTO {
  eyebrow: string
  titleLine1: string
  titleHighlight: string
  description: string
  bgImage: string
}

export interface FeatureDTO {
  id: string
  title: string
  description: string
  iconName: string
}

export interface FleetDTO {
  id: string
  name: string
  type: string
  power: string
  drive: string
  seats: string
  year: string
  image: string
  badge: string
}

export interface RouteDTO {
  id: string
  title: string
  difficulty: string
  routeNum: string
  description: string
  distance: string
  duration: string
  image: string
}

export interface PricingPlanDTO {
  id: string
  type: string
  title: string
  description: string
  price1Pax: string
  price2Pax: string
  features: string[]
  isHighlighted?: boolean
}

export interface ProcessStepDTO {
  id: string
  stepNum: string
  title: string
  description: string
  iconName: string
}

export interface ReviewDTO {
  id: string
  author: string
  location: string
  date?: string
  content: string
  rating: number
}

export interface ContactInfoDTO {
  address: string
  phones: string[]
  email: string
  hours: string
  whatsapp?: string
}

export interface NewsDTO {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  publishedAt: string
  image: string
  author: string
  meta: MetaDTO
}

export interface FaqDTO {
  id: string
  question: string
  answer: string
}

export interface GalleryItemDTO {
  id: string
  caption: string
  image: string
  layout: string
}

export interface EquipmentItemDTO {
  title: string
  description: string
  iconName: string
}

export interface FlotaPageDTO {
  seo: MetaDTO
  header: PageHeaderDTO
  equipment: {
    eyebrow: string
    title: string
    description: string
    items: EquipmentItemDTO[]
  }
  cta: {
    title: string
    description: string
    buttonLabel: string
  }
}

export interface SimplePageDTO {
  seo: MetaDTO
  header: PageHeaderDTO
}
