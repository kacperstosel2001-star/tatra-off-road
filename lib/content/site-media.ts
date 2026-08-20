import type { GalleryItemDTO, Locale } from '@/types/payload'

/** Static assets from `zdjecia i filmiki` — served from /public/site-media */
export const SITE_PHOTO = {
  '01': '/site-media/photo-01.jpeg',
  '02': '/site-media/photo-02.jpeg',
  '03': '/site-media/photo-03.jpeg',
  '04': '/site-media/photo-04.jpeg',
  '05': '/site-media/photo-05.jpeg',
  '06': '/site-media/photo-06.jpeg',
  '07': '/site-media/photo-07.jpeg',
} as const

export const SITE_HERO_VIDEO = '/site-media/ride-06.mp4'
export const SITE_HERO_POSTER = SITE_PHOTO['02']
export const SITE_CTA_IMAGE = SITE_PHOTO['01']
export const SITE_WHY_IMAGE = SITE_PHOTO['03']
export const SITE_OG_IMAGE = SITE_PHOTO['02']

const photoCaptions: Record<string, { pl: string; en: string }> = {
  '01': { pl: 'Na szlaku', en: 'On the trail' },
  '02': { pl: 'Widoki Podhala', en: 'Podhale views' },
  '03': { pl: 'Can-Am w terenie', en: 'Can-Am off-road' },
  '04': { pl: 'Przez las', en: 'Through the forest' },
  '05': { pl: 'Grupa na trasie', en: 'Group on the route' },
  '06': { pl: 'Off-road na żywo', en: 'Off-road live' },
  '07': { pl: 'Po zjeździe', en: 'After the descent' },
}

const photoLayouts: Record<string, string> = {
  '01': '2x2',
  '02': '1x1',
  '03': '1x1',
  '04': '2x1',
  '05': '1x1',
  '06': '1x1',
  '07': '2x1',
}

export function getSiteGallery(locale: Locale = 'pl'): GalleryItemDTO[] {
  const lang = locale === 'en' ? 'en' : 'pl'
  return (['01', '02', '03', '04', '05', '06', '07'] as const).map((n) => ({
    id: `site-photo-${n}`,
    caption: photoCaptions[n][lang],
    image: `/site-media/photo-${n}.jpeg`,
    layout: photoLayouts[n],
  }))
}

export type RideClip = {
  id: string
  src: string
  poster: string
  label: { pl: string; en: string }
}

export const SITE_RIDE_CLIPS: RideClip[] = [
  {
    id: 'ride-01',
    src: '/site-media/ride-01.mp4',
    poster: '/site-media/photo-03.jpeg',
    label: { pl: 'Zjazd 1', en: 'Descent 1' },
  },
  {
    id: 'ride-02',
    src: '/site-media/ride-02.mp4',
    poster: '/site-media/photo-04.jpeg',
    label: { pl: 'Zjazd 2', en: 'Descent 2' },
  },
  {
    id: 'ride-03',
    src: '/site-media/ride-03.mp4',
    poster: '/site-media/photo-05.jpeg',
    label: { pl: 'Zjazd 3', en: 'Descent 3' },
  },
  {
    id: 'ride-04',
    src: '/site-media/ride-04.mp4',
    poster: '/site-media/photo-06.jpeg',
    label: { pl: 'Zjazd 4', en: 'Descent 4' },
  },
  {
    id: 'ride-05',
    src: '/site-media/ride-05.mp4',
    poster: '/site-media/photo-07.jpeg',
    label: { pl: 'Zjazd 5', en: 'Descent 5' },
  },
  {
    id: 'ride-06',
    src: '/site-media/ride-06.mp4',
    poster: '/site-media/photo-02.jpeg',
    label: { pl: 'Zjazd 6', en: 'Descent 6' },
  },
]
