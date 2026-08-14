import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/i18n'

const paths = ['/', '/cennik', '/flota', '/trasy', '/rezerwacja', '/about', '/contact', '/news']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const path of paths) {
    entries.push({
      url: absoluteUrl('pl', path),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: path === '/' ? 1 : 0.8,
      alternates: {
        languages: {
          pl: absoluteUrl('pl', path),
          en: absoluteUrl('en', path),
        },
      },
    })
    entries.push({
      url: absoluteUrl('en', path),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: path === '/' ? 0.9 : 0.7,
      alternates: {
        languages: {
          pl: absoluteUrl('pl', path),
          en: absoluteUrl('en', path),
        },
      },
    })
  }

  return entries
}
