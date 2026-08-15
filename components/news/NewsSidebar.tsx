'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { localePath } from '@/lib/i18n'
import { LinkButton } from '@/components/ui/link-button'
import { telHref } from '@/components/providers/ContactProvider'
import type { ContactInfoDTO, NewsDTO } from '@/types/payload'

export function NewsSidebar({
  dict,
  lang,
  contactInfo,
  recent,
  currentSlug,
}: {
  dict: any
  lang: string
  contactInfo: ContactInfoDTO
  recent: NewsDTO[]
  currentSlug?: string
}) {
  const phone = contactInfo.phones[0] || ''
  const others = recent.filter((item) => item.slug !== currentSlug).slice(0, 4)

  return (
    <aside className="space-y-10 lg:sticky lg:top-[120px]">
      <div className="relative overflow-hidden border border-[rgba(245,241,231,0.12)] bg-[#16130f] px-6 py-8 lg:px-7 lg:py-9">
        <div className="absolute inset-y-0 left-0 w-[3px] bg-orange" aria-hidden />
        <div className="relative z-1 pl-1">
          <p className="eyebrow text-orange mb-3">{dict.news.sidebarEyebrow}</p>
          <h3 className="font-display text-[28px] lg:text-[32px] uppercase leading-[0.95] text-snow m-0 mb-4 tracking-[-0.01em]">
            {dict.news.sidebarTitle}
          </h3>
          <p className="text-stone text-[15px] leading-[1.65] m-0 mb-7">{dict.news.sidebarDesc}</p>
          <div className="flex flex-col gap-3">
            <LinkButton href={localePath(lang, '/rezerwacja')} variant="primary" className="w-full justify-center">
              {dict.common.bookNow} <ArrowRight className="w-4 h-4" />
            </LinkButton>
            {phone ? (
              <LinkButton href={telHref(phone)} variant="outline" className="w-full justify-center">
                <Phone className="w-4 h-4" /> {dict.common.call}
              </LinkButton>
            ) : null}
          </div>
        </div>
      </div>

      {others.length > 0 ? (
        <div>
          <h4 className="font-display text-[18px] uppercase text-snow tracking-[0.02em] m-0 mb-5">
            {dict.news.sidebarRecent}
          </h4>
          <ul className="m-0 p-0 list-none divide-y divide-[rgba(245,241,231,0.08)] border-y border-[rgba(245,241,231,0.08)]">
            {others.map((item) => (
              <li key={item.id}>
                <Link
                  href={localePath(lang, `/news/${item.slug}`)}
                  className="group flex flex-col gap-1 py-4 no-underline"
                >
                  <span className="text-[11px] font-label uppercase tracking-[0.14em] text-orange">
                    {new Date(item.publishedAt).toLocaleDateString(
                      lang === 'en' ? 'en-US' : lang === 'de' ? 'de-DE' : 'pl-PL',
                    )}
                  </span>
                  <span className="font-display text-[17px] uppercase leading-[1.15] text-snow group-hover:text-orange transition-colors">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="border-t border-[rgba(245,241,231,0.1)] pt-6">
        <p className="text-[12px] font-label uppercase tracking-[0.14em] text-stone m-0 mb-2">
          {dict.nav.contact}
        </p>
        {contactInfo.address ? (
          <p className="text-snow text-[14px] leading-[1.5] m-0 mb-1">{contactInfo.address}</p>
        ) : null}
        {contactInfo.hours ? (
          <p className="text-stone text-[13px] m-0">{contactInfo.hours}</p>
        ) : null}
      </div>
    </aside>
  )
}
