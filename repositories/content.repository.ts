import type {
  HeroDTO,
  FeatureDTO,
  FleetDTO,
  RouteDTO,
  PricingPlanDTO,
  ProcessStepDTO,
  ReviewDTO,
  ContactInfoDTO,
  NewsDTO,
  MetaDTO,
  FaqDTO,
  GalleryItemDTO,
  FlotaPageDTO,
  SimplePageDTO,
  CtaBannerDTO,
  Locale,
} from '@/types/payload'

export interface ContentRepository {
  getMeta(locale?: Locale): Promise<MetaDTO>
  getHero(locale?: Locale): Promise<HeroDTO>
  getMarquee(locale?: Locale): Promise<string[]>
  getCtaBanner(locale?: Locale): Promise<CtaBannerDTO>
  getFeatures(locale?: Locale): Promise<FeatureDTO[]>
  getFleet(locale?: Locale): Promise<FleetDTO[]>
  getRoutes(locale?: Locale): Promise<RouteDTO[]>
  getPricingPlans(locale?: Locale): Promise<PricingPlanDTO[]>
  getProcessSteps(locale?: Locale): Promise<ProcessStepDTO[]>
  getReviews(locale?: Locale): Promise<ReviewDTO[]>
  getFaq(locale?: Locale): Promise<FaqDTO[]>
  getGallery(locale?: Locale): Promise<GalleryItemDTO[]>
  getNews(locale?: Locale): Promise<NewsDTO[]>
  getNewsBySlug(slug: string, locale?: Locale): Promise<NewsDTO | null>
  getContactInfo(locale?: Locale): Promise<ContactInfoDTO>
  getFlotaPage(locale?: Locale): Promise<FlotaPageDTO>
  getTrasyPage(locale?: Locale): Promise<SimplePageDTO>
  getCennikPage(locale?: Locale): Promise<SimplePageDTO>
  getAboutPage(locale?: Locale): Promise<SimplePageDTO>
  getContactPage(locale?: Locale): Promise<SimplePageDTO>
}
