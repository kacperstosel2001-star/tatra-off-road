"use client";

import React from 'react';
import Image from 'next/image';
import { RouteDTO } from '@/types/payload';
import { Clock } from 'lucide-react';

export function Routes({ dict, routes }: { dict: any; routes: RouteDTO[] }) {
  return (
    <section className="bg-snow section-pad" id="trasy">
      <span className="section-tag">02 / {dict.nav.routes.toUpperCase()}</span>
      <div className="wrap">
        <div className="shead">
          <span className="eyebrow">{dict.routes.eyebrow}</span>
          <h2 dangerouslySetInnerHTML={{ __html: dict.routes.headline }}></h2>
          <p>{dict.routes.subheadline}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-9 lg:gap-[28px]">
          {routes.map((route) => (
            <div key={route.id} className="bg-ink overflow-hidden relative text-snow flex flex-col group">
              <div className="aspect-[4/5] overflow-hidden relative after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(15,13,10,0)_20%,rgba(15,13,10,0.85)_100%)]">
                <Image src={route.image} alt={route.title} fill className="object-cover transition-transform duration-1000 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-[26px_28px] z-2">
                <div className="flex justify-between items-start mb-[14px]">
                  <span className="bg-orange text-ink py-[6px] px-3 font-label uppercase text-[11px] tracking-[0.1em] font-bold">{route.difficulty}</span>
                  <span className="font-mono text-[12px] text-stone">{route.routeNum}</span>
                </div>
                <h3 className="font-display font-normal text-[32px] uppercase m-0 mb-[10px] leading-none">{route.title}</h3>
                <p className="text-[14px] leading-[1.55] text-[#E7E1D0] m-0 mb-[18px]">{route.description}</p>
                <div className="flex gap-5 font-label uppercase text-[11.5px] tracking-[0.08em] text-stone font-semibold pt-4 border-t border-[rgba(245,241,231,0.16)]">
                  {route.duration ? (
                    <div className="flex items-center gap-[6px]">
                      <Clock className="w-3 h-3 fill-orange text-orange" />
                      {route.duration}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
