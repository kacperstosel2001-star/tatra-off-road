'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { ReviewDTO } from '@/types/payload'

export function Testimonials({ dict, reviews }: { dict: any; reviews: ReviewDTO[] }) {
  const t = dict.testimonials || {}
  return (
    <section className="bg-forest text-snow overflow-hidden section-pad">
      <span className="section-tag" style={{ color: '#c1c4a9' }}>
        07 / {(t.eyebrow || 'OPINIE').toUpperCase()}
      </span>
      <div className="wrap">
        <div className="shead center">
          <span className="eyebrow">{t.eyebrow || 'Opinie klientów'}</span>
          <h2
            className="text-snow"
            dangerouslySetInnerHTML={{ __html: t.headline || 'Co mówią<br/>nasi goście' }}
          />
          <p className="text-[#E7E1D0]">
            {t.subheadline || 'Ocena 5/5 na Google. Kilka najświeższych opinii poniżej.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-[24px]">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[rgba(245,241,231,0.06)] border border-[rgba(245,241,231,0.14)] p-[32px_30px] relative"
            >
              <span className="absolute top-[-14px] left-[30px] font-display text-[80px] text-orange leading-none">
                &quot;
              </span>
              <div className="text-orange tracking-[0.14em] text-[16px] mb-4 mt-[14px]">
                {'★'.repeat(review.rating)}
              </div>
              <p className="text-[15px] leading-[1.65] text-[#F5F1E7] m-0 mb-6 italic">{review.content}</p>
              <div className="flex items-center gap-[14px] pt-5 border-t border-[rgba(245,241,231,0.16)]">
                <div className="w-11 h-11 bg-orange text-ink rounded-full flex items-center justify-center font-display text-[18px]">
                  {review.author[0]}
                </div>
                <div>
                  <b className="block font-label tracking-[0.06em] uppercase text-[13.5px]">{review.author}</b>
                  <span className="text-[12px] text-stone">{review.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-[14px] mt-[50px] font-label tracking-[0.1em] uppercase text-[13px] text-[#F5F1E7]">
          <ArrowRight className="w-4 h-4 fill-orange text-orange" />
          {t.googleCta || 'Zobacz opinie na Google'}
        </div>
      </div>
    </section>
  )
}
