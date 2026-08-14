'use client'

import React from 'react'
import Image from 'next/image'
import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react'
import { LinkButton } from '../ui/link-button'
import type { ContactInfoDTO, CtaBannerDTO } from '@/types/payload'
import { localePath } from '@/lib/i18n'
import { telHref } from '@/components/providers/ContactProvider'

export function CtaBanner({
  dict,
  contactInfo,
  content,
  lang = 'pl',
}: {
  dict: any
  contactInfo: ContactInfoDTO
  content: CtaBannerDTO
  lang?: string
}) {
  const phone = contactInfo.phones[0] || ''

  return (
    <section className="relative overflow-hidden text-snow">
      <div className="absolute inset-0 z-0">
        <Image
          src={content.bgImage}
          alt=""
          fill
          className="object-cover brightness-[0.35] saturate-[1.1]"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="relative z-2 py-[70px] px-6 lg:py-[120px] lg:px-14 max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-[60px] items-center">
        <div>
          <span className="eyebrow">{content.eyebrow}</span>
          <h2 className="font-display font-normal text-[48px] lg:text-[72px] leading-[0.95] uppercase my-[16px_0_22px] tracking-[-0.005em]">
            {content.titleLine1}
            <br />
            <span className="text-orange">{content.titleHighlight}</span>
          </h2>
          <p className="text-[18px] leading-[1.6] text-[#E7E1D0] max-w-[520px] mb-8">{content.description}</p>
          <div className="flex gap-4 flex-wrap">
            <LinkButton href={localePath(lang, '/rezerwacja')} variant="primary">
              {dict.common.bookNow} <ArrowRight className="w-4 h-4" />
            </LinkButton>
            {phone ? (
              <LinkButton href={telHref(phone)} variant="outline">
                {dict.common.call}
              </LinkButton>
            ) : null}
          </div>
        </div>

        <div className="bg-[rgba(15,13,10,0.6)] backdrop-blur-[20px] border border-[rgba(245,241,231,0.15)] p-[34px]">
          <h4 className="font-display font-normal text-[22px] uppercase m-0 mb-[22px] tracking-[0.005em]">
            {dict.nav.contact}
          </h4>
          {phone ? (
            <div className="flex items-center gap-[14px] py-[14px] border-b border-[rgba(245,241,231,0.14)]">
              <div className="w-9 h-9 bg-orange text-ink flex items-center justify-center flex-none">
                <Phone className="w-[18px] h-[18px] fill-current" />
              </div>
              <div>
                <b className="block font-label uppercase tracking-[0.06em] text-[13px] text-snow">Telefon</b>
                <span className="text-[13px] text-stone">{phone}</span>
              </div>
            </div>
          ) : null}
          {contactInfo.email ? (
            <div className="flex items-center gap-[14px] py-[14px] border-b border-[rgba(245,241,231,0.14)]">
              <div className="w-9 h-9 bg-orange text-ink flex items-center justify-center flex-none">
                <Mail className="w-[18px] h-[18px] fill-current" />
              </div>
              <div>
                <b className="block font-label uppercase tracking-[0.06em] text-[13px] text-snow">Email</b>
                <span className="text-[13px] text-stone">{contactInfo.email}</span>
              </div>
            </div>
          ) : null}
          {contactInfo.address ? (
            <div className="flex items-center gap-[14px] py-[14px]">
              <div className="w-9 h-9 bg-orange text-ink flex items-center justify-center flex-none">
                <MapPin className="w-[18px] h-[18px] fill-current" />
              </div>
              <div>
                <b className="block font-label uppercase tracking-[0.06em] text-[13px] text-snow">Adres</b>
                <span className="text-[13px] text-stone">{contactInfo.address}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
