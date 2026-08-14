'use client'

import React from 'react'
import { LinkButton } from '../ui/link-button'
import type { FaqDTO } from '@/types/payload'
import { telHref, useContact } from '@/components/providers/ContactProvider'

export function FAQ({
  dict,
  items,
  phone,
}: {
  dict: any
  items: FaqDTO[]
  phone?: string
}) {
  const contact = useContact()
  const callPhone = phone || contact.phones[0] || '+48 888 254 223'

  return (
    <section className="bg-paper section-pad" id="faq">
      <span className="section-tag">08 / {dict.nav.faq.toUpperCase()}</span>
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-9 lg:gap-[80px] items-start">
          <div className="faq-side">
            <span className="eyebrow">{dict.faq.eyebrow}</span>
            <h2 className="font-display font-normal text-[44px] lg:text-[56px] uppercase leading-[0.95] my-3 lg:my-[12px_0_22px]">
              {dict.faq.headline}
            </h2>
            <p className="text-[15.5px] leading-[1.7] text-[#4a4638]">{dict.faq.subheadline}</p>

            <div className="bg-ink text-snow p-[30px] mt-[36px]">
              <span className="label text-orange">{dict.faq.calloutTag}</span>
              <h4 className="font-display font-normal text-[26px] uppercase my-[8px_0_12px] leading-none">
                {dict.faq.calloutTitle}
              </h4>
              <p className="text-[14px] text-stone m-0 mb-4 leading-[1.6]">{dict.faq.calloutDesc}</p>
              <LinkButton href={telHref(callPhone)} variant="primary">
                {callPhone}
              </LinkButton>
            </div>
          </div>

          <div className="flex flex-col">
            {items.map((faq, i) => (
              <details
                key={faq.id}
                className="border-b border-stone-line first:border-t group"
                open={i === 0}
              >
                <summary className="cursor-pointer list-none py-7 px-1 flex justify-between items-center gap-5 font-label uppercase tracking-[0.04em] text-[17px] font-bold transition-colors duration-250 ease-[cubic-bezier(.2,.7,.2,1)] hover:text-orange-deep group-open:text-orange-deep [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="font-display text-[24px] text-orange transition-transform duration-250 ease-[cubic-bezier(.2,.7,.2,1)] flex-none group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-1 pb-7 text-[15.5px] leading-[1.7] text-[#4a4638] max-w-[680px]">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
