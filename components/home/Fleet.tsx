"use client";

import React from 'react';
import Image from 'next/image';
import { FleetDTO } from '@/types/payload';

export function Fleet({ dict, fleet }: { dict: any; fleet: FleetDTO[] }) {
  return (
    <section className="bg-granite text-snow overflow-hidden section-pad" id="flota">
      <span className="section-tag">02 / {dict.nav.fleet.toUpperCase()}</span>
      <div className="wrap">
        <div className="shead">
          <span className="eyebrow">{dict.fleet.eyebrow}</span>
          <h2 dangerouslySetInnerHTML={{ __html: dict.fleet.headline }} className="text-snow"></h2>
          <p className="text-stone">{dict.fleet.subheadline}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-[28px]">
          {fleet.map((item) => (
            <div key={item.id} className="bg-granite-2 overflow-hidden relative flex flex-col transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5 group">
              <div className="aspect-[16/10] overflow-hidden relative">
                <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-1000 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]" referrerPolicy="no-referrer" />
                <span className="absolute top-[18px] left-[18px] bg-orange text-ink py-2 px-[14px] font-label uppercase text-[11px] font-bold tracking-[0.1em]">{item.badge}</span>
                <span className="absolute bottom-[18px] right-[18px] font-display text-snow text-[32px] leading-none bg-[rgba(15,13,10,0.7)] py-2 px-[14px]">&apos;{item.year.slice(2)}</span>
              </div>
              <div className="py-[26px] px-[22px] lg:py-[36px] lg:px-[34px]">
                <span className="text-orange font-label uppercase tracking-[0.14em] text-[12px] font-semibold mb-[26px] block">{item.type}</span>
                <h3 className="font-display font-normal text-[34px] uppercase m-0 mb-2 tracking-[0.005em]">{item.name}</h3>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-[14px] lg:gap-0 border-t border-[rgba(245,241,231,0.14)] pt-[22px] mt-6">
                  <div className="lg:border-r border-[rgba(245,241,231,0.14)] lg:px-[14px] font-label pl-0">
                    <span className="text-[10.5px] uppercase tracking-[0.1em] text-stone block">{dict.fleet.power}</span>
                    <span className="font-display text-[22px] text-snow leading-none mt-1 block">{item.power}</span>
                  </div>
                  <div className="lg:border-r border-[rgba(245,241,231,0.14)] lg:px-[14px] font-label">
                    <span className="text-[10.5px] uppercase tracking-[0.1em] text-stone block">{dict.fleet.drive}</span>
                    <span className="font-display text-[22px] text-snow leading-none mt-1 block">{item.drive}</span>
                  </div>
                  <div className="lg:border-r border-[rgba(245,241,231,0.14)] lg:px-[14px] font-label pl-0 lg:pl-[14px]">
                    <span className="text-[10.5px] uppercase tracking-[0.1em] text-stone block">{dict.fleet.seats}</span>
                    <span className="font-display text-[22px] text-snow leading-none mt-1 block">{item.seats}</span>
                  </div>
                  <div className="lg:px-[14px] font-label border-r-0">
                    <span className="text-[10.5px] uppercase tracking-[0.1em] text-stone block">{dict.fleet.year}</span>
                    <span className="font-display text-[22px] text-snow leading-none mt-1 block">{item.year}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
