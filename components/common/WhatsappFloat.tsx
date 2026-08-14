'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'
import { useContact, waHref } from '@/components/providers/ContactProvider'

export function WhatsappFloat() {
  const contact = useContact()
  const phone = contact.whatsapp || contact.phones[0]
  if (!phone) return null

  return (
    <a
      href={waHref(phone)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-[calc(var(--site-sticky-cta)+16px)] lg:bottom-[30px] right-4 sm:right-[30px] w-[52px] h-[52px] lg:w-[60px] lg:h-[60px] bg-[#25D366] text-white rounded-full flex items-center justify-center z-[55] shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:scale-105"
    >
      <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7 fill-current" />
    </a>
  )
}
