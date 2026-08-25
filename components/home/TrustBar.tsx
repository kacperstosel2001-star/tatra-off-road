import React from 'react'
import { Clock, Star, Zap, Map } from 'lucide-react'

export function TrustBar({ dict }: { dict: any }) {
  return (
    <section className="bg-paper p-0">
      <div className="wrap grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-0 py-[30px] lg:py-12 px-6 lg:px-14">
        <div className="text-left pb-4 lg:pb-0 lg:px-[26px] lg:border-r border-b lg:border-b-0 border-stone-line flex flex-col gap-[6px] pl-0">
          <div className="w-[34px] h-[34px] text-orange mb-3">
            <Map className="w-full h-full fill-orange text-orange" />
          </div>
          <div className="font-display text-[36px] text-ink leading-none">100%</div>
          <div className="font-label uppercase tracking-[0.1em] text-[11.5px] font-semibold text-[#5a5544]">
            {dict.trust.legalTrails}
          </div>
        </div>

        <div className="text-left pb-4 lg:pb-0 lg:px-[26px] lg:border-r border-b lg:border-b-0 border-stone-line flex flex-col gap-[6px]">
          <div className="w-[34px] h-[34px] text-orange mb-3">
            <Clock className="w-full h-full fill-orange text-orange" />
          </div>
          <div className="font-display text-[36px] text-ink leading-none">30min</div>
          <div className="font-label uppercase tracking-[0.1em] text-[11.5px] font-semibold text-[#5a5544]">
            {dict.trust.response}
          </div>
        </div>

        <div className="text-left pb-4 lg:pb-0 lg:px-[26px] lg:border-r border-b lg:border-b-0 border-stone-line flex flex-col gap-[6px] border-r-0 lg:border-r">
          <div className="w-[34px] h-[34px] text-orange mb-3">
            <Star className="w-full h-full fill-orange text-orange" />
          </div>
          <div className="font-display text-[36px] text-ink leading-none">5/5</div>
          <div className="font-label uppercase tracking-[0.1em] text-[11.5px] font-semibold text-[#5a5544]">
            {dict.trust.rating}
          </div>
        </div>

        <div className="text-left pb-4 lg:pb-0 lg:px-[26px] flex flex-col gap-[6px] border-none">
          <div className="w-[34px] h-[34px] text-orange mb-3">
            <Zap className="w-full h-full fill-orange text-orange" />
          </div>
          <div className="font-display text-[36px] text-ink leading-none">2025</div>
          <div className="font-label uppercase tracking-[0.1em] text-[11.5px] font-semibold text-[#5a5544]">
            {dict.trust.newFleet}
          </div>
        </div>
      </div>
    </section>
  )
}
