'use client'

import React from 'react'
import { Check, ArrowRight, Clock } from 'lucide-react'
import { LinkButton } from '../ui/link-button'
import { localePath } from '@/lib/i18n'
import { telHref, useContact } from '@/components/providers/ContactProvider'

export type TripPlan = {
  id: string | number
  name: string
  description?: string | null
  durationHours: number
  price1: number
  price2: number
  deposit: number
}

const FEATURES_PL = [
  'Kask i ochraniacze',
  'Paliwo w cenie',
  'Briefing + przewodnik',
  'Ubezpieczenie NNW',
]

const FEATURES_EN = [
  'Helmet and protectors',
  'Fuel included',
  'Briefing + guide',
  'NNW insurance',
]

export function Pricing({
  dict,
  trips,
  lang = 'pl',
}: {
  dict: any
  trips: TripPlan[]
  lang?: string
}) {
  const features = lang === 'en' ? FEATURES_EN : FEATURES_PL
  const person1 = lang === 'en' ? '1 person' : '1 osoba'
  const person2 = lang === 'en' ? '2 people (1 quad)' : '2 osoby (1 quad)'
  const depositLabel = lang === 'en' ? 'Deposit from' : 'Zaliczka od'
  const empty =
    lang === 'en'
      ? 'No trips published yet. Check back soon or call us.'
      : 'Brak opublikowanych wypraw. Zadzwoń lub wróć wkrótce.'
  const contact = useContact()
  const phoneNumber = contact.phones[0] || '+48 888 254 223'

  return (
    <section className="bg-paper overflow-hidden section-pad" id="cennik">
      <span className="section-tag">03 / {dict.nav.pricing.toUpperCase()}</span>
      <div className="wrap">
        <div className="shead">
          <span className="eyebrow">{dict.pricing.eyebrow}</span>
          <h2 dangerouslySetInnerHTML={{ __html: dict.pricing.headline }} />
          <p>{dict.pricing.subheadline}</p>
        </div>

        {!trips.length ? (
          <div className="booking-empty max-w-xl">{empty}</div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-6 lg:gap-6 items-stretch ${
              trips.length === 1 ? 'lg:grid-cols-1 max-w-xl' : trips.length === 2 ? 'lg:grid-cols-2 max-w-4xl' : 'lg:grid-cols-3'
            }`}
          >
            {trips.map((trip, index) => {
              const isHi = index === 0 || trips.length === 1
              return (
                <div
                  key={trip.id}
                  className={`flex flex-col relative transition-transform duration-350 ease-[cubic-bezier(.2,.7,.2,1)] ${
                    isHi
                      ? 'bg-ink text-snow border-ink lg:hover:-translate-y-1'
                      : 'bg-snow border border-stone-line hover:-translate-y-1'
                  }`}
                >
                  {isHi && trips.length > 1 ? (
                    <div className="absolute top-[-1px] right-[-1px] bg-orange text-ink font-label text-[11px] uppercase tracking-[0.1em] font-bold py-2 px-4">
                      {dict.pricing.highlight}
                    </div>
                  ) : null}

                  <div
                    className={`p-[34px_30px_24px] border-b ${
                      isHi ? 'border-[rgba(245,241,231,0.18)]' : 'border-stone-line'
                    }`}
                  >
                    <span className="label text-stone inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange" />
                      {trip.durationHours} h
                    </span>
                    <h3 className="font-display font-normal text-[30px] uppercase mt-2 mb-1.5 tracking-[0.005em]">
                      {trip.name}
                    </h3>
                    {trip.description ? (
                      <p className={`text-[14px] m-0 ${isHi ? 'text-stone' : 'text-[#4a4638]'}`}>
                        {trip.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="p-[24px_30px_30px] flex-1 flex flex-col">
                    <div
                      className={`flex justify-between items-baseline py-3 border-b border-dashed ${
                        isHi ? 'border-[rgba(245,241,231,0.2)]' : 'border-stone-line'
                      }`}
                    >
                      <span className="text-[14.5px]">{person1}</span>
                      <span className={`font-mono text-[19px] font-semibold ${isHi ? 'text-orange' : ''}`}>
                        {trip.price1} zł
                      </span>
                    </div>
                    <div
                      className={`flex justify-between items-baseline py-3 border-b border-dashed ${
                        isHi ? 'border-[rgba(245,241,231,0.2)]' : 'border-stone-line'
                      }`}
                    >
                      <span className="text-[14.5px]">{person2}</span>
                      <span className={`font-mono text-[19px] font-semibold ${isHi ? 'text-orange' : ''}`}>
                        {trip.price2} zł
                      </span>
                    </div>
                    <p className={`text-[13px] mt-3 mb-0 ${isHi ? 'text-stone' : 'text-[#4a4638]'}`}>
                      {depositLabel} <strong>{trip.deposit} zł</strong> / quad
                    </p>

                    <div className="mt-[18px] flex flex-col gap-[10px]">
                      {features.map((feat) => (
                        <div
                          key={feat}
                          className={`text-[13.5px] flex gap-[10px] items-start leading-[1.5] ${
                            isHi ? 'text-stone' : 'text-[#4a4638]'
                          }`}
                        >
                          <Check className="w-[14px] h-[14px] text-orange mt-[3px] flex-none" />
                          {feat}
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-[26px]">
                      <LinkButton
                        href={localePath(lang, '/rezerwacja')}
                        variant={isHi ? 'primary' : 'ghost'}
                        className="w-full justify-center"
                      >
                        {dict.common.book} <ArrowRight className="w-4 h-4" />
                      </LinkButton>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {dict.booking?.noSlotShort ? (
          <p className="mt-8 mb-0 max-w-2xl text-[14.5px] leading-snug text-[#4a4638]">
            {dict.booking.noSlotShort}{' '}
            <a
              href={telHref(phoneNumber)}
              className="font-label text-[12px] uppercase tracking-[0.08em] font-bold text-orange hover:text-ink transition-colors"
            >
              {dict.booking.callUs || dict.common.call}: {phoneNumber}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  )
}
