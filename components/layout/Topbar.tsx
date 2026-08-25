'use client'

import { Phone, Clock } from 'lucide-react'
import React from 'react'
import { telHref, useContact } from '@/components/providers/ContactProvider'

export function Topbar({ lang = 'pl' }: { lang?: string }) {
  const contact = useContact()
  const hours =
    contact.hours ||
    (lang === 'en' ? 'Ząb · Mon–Sun 8:00–20:00' : 'Ząb · pn–nd 8:00–20:00')
  const phones = contact.phones.length ? contact.phones : ['+48 530 198 735']

  return (
    <div className="site-topbar hidden lg:block relative z-40 bg-ink text-stone font-label text-[12.5px] tracking-[0.06em] border-b border-[rgba(245,241,231,0.08)]">
      <div className="wrap flex justify-between items-center h-[var(--site-topbar)]">
        <div className="flex gap-3 items-center min-w-0">
          <Clock className="w-[14px] h-[14px] text-orange flex-none" />
          <span className="label text-stone truncate">{hours}</span>
        </div>
        <div className="flex gap-6 flex-none">
          {phones.slice(0, 2).map((phone) => (
            <a
              key={phone}
              href={telHref(phone)}
              className="flex items-center gap-1.5 text-snow font-semibold"
            >
              <Phone className="w-3 h-3 text-orange fill-orange" />
              {phone}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
