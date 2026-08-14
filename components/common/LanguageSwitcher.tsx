'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { switchLocalePath } from '@/lib/i18n'
import type { Locale } from '@/types/payload'

export function LanguageSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname() || '/'
  const current = (lang === 'en' ? 'en' : 'pl') as Locale

  return (
    <div
      className="inline-flex items-center border border-[rgba(245,241,231,0.25)] font-label text-[12px] uppercase tracking-[0.12em] font-bold"
      role="navigation"
      aria-label="Language"
    >
      <Link
        href={switchLocalePath(pathname, 'pl')}
        hrefLang="pl"
        className={`px-2.5 py-1.5 transition-colors ${
          current === 'pl' ? 'bg-orange text-ink' : 'text-snow hover:text-orange'
        }`}
        aria-current={current === 'pl' ? 'page' : undefined}
      >
        PL
      </Link>
      <Link
        href={switchLocalePath(pathname, 'en')}
        hrefLang="en"
        className={`px-2.5 py-1.5 transition-colors ${
          current === 'en' ? 'bg-orange text-ink' : 'text-snow hover:text-orange'
        }`}
        aria-current={current === 'en' ? 'page' : undefined}
      >
        EN
      </Link>
    </div>
  )
}
