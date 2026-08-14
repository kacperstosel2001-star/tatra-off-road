import 'server-only'
import type { Locale } from '@/types/payload'
import { fixOrphansDeep } from '@/lib/typography'

const dictionaries = {
  pl: () => import('./pl.json').then((module) => module.default),
  en: () => import('./en.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  const load = dictionaries[locale] || dictionaries.pl
  const dict = await load()
  return fixOrphansDeep(dict)
}
