import type { Locale } from '@/types/payload'

export const defaultLocale: Locale = 'pl'
/** Public locales with URL prefix (PL has no prefix). */
export const prefixedLocales = ['en'] as const
export const supportedLocales: Locale[] = ['pl', 'en']

export function isLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale)
}

/** Normalize path to always start with `/` and never end with `/` (except root). */
export function normalizePath(path = '/'): string {
  if (!path || path === '/') return '/'
  const withSlash = path.startsWith('/') ? path : `/${path}`
  return withSlash.replace(/\/+$/, '') || '/'
}

/**
 * Public URL path for a locale.
 * PL: `/cennik`  |  EN: `/en/cennik`
 */
export function localePath(lang: string, path = '/'): string {
  const clean = normalizePath(path)
  if (lang === 'pl' || !lang) return clean
  if (clean === '/') return `/${lang}`
  return `/${lang}${clean}`
}

/** Strip `/en` (or legacy `/pl|/de`) prefix from pathname. */
export function stripLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(pl|en|de)(?=\/|$)/)
  if (!match) return pathname || '/'
  const rest = pathname.slice(match[0].length)
  return rest || '/'
}

/** Detect locale from public pathname (after middleware rewrite, internal is /pl/...). */
export function localeFromPathname(pathname: string): Locale {
  if (pathname === '/en' || pathname.startsWith('/en/')) return 'en'
  return 'pl'
}

/** Switch language keeping the same page path. */
export function switchLocalePath(pathname: string, targetLang: Locale): string {
  const bare = stripLocaleFromPathname(pathname)
  return localePath(targetLang, bare)
}

export function absoluteUrl(lang: string, path = '/'): string {
  const base = 'https://tatraoffroad.pl'
  const p = localePath(lang, path)
  return p === '/' ? base : `${base}${p}`
}

export function hreflangAlternates(path = '/') {
  return {
    pl: absoluteUrl('pl', path),
    en: absoluteUrl('en', path),
    'x-default': absoluteUrl('pl', path),
  }
}
