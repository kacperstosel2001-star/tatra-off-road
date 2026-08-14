'use client'

import React from 'react'
import { Phone } from 'lucide-react'
import { LinkButton } from '../ui/link-button'
import { localePath } from '@/lib/i18n'
import { telHref, useContact } from '@/components/providers/ContactProvider'

export function StickyMobileCta({ dict, lang = 'pl' }: { dict: any; lang?: string }) {
  const contact = useContact()
  const phone = contact.phones[0] || '+48 888 254 223'

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-[rgba(15,13,10,0.97)] backdrop-blur-md border-t border-[rgba(245,241,231,0.12)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex justify-between items-center gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
      <a
        href={telHref(phone)}
        className="font-label text-snow font-bold text-[12.5px] sm:text-[13px] flex items-center gap-1.5 min-w-0"
      >
        <Phone className="w-3.5 h-3.5 fill-orange text-orange flex-none" />
        <span className="truncate">{phone}</span>
      </a>
      <LinkButton
        href={localePath(lang, '/rezerwacja')}
        variant="primary"
        className="py-3.5 px-5 text-[12px] flex-none"
      >
        {dict.common.book}
      </LinkButton>
    </div>
  )
}
