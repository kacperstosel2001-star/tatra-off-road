"use client";

import React from 'react';
import Image from 'next/image';
import { Shield, Map, Users, Star } from 'lucide-react';
import { FeatureDTO } from '@/types/payload';

export function WhyUs({ dict, features }: { dict: any; features: FeatureDTO[] }) {
  const getIcon = (name: string) => {
    switch (name) {
      case 'star': return <Star className="w-8 h-8 fill-current" />;
      case 'map': return <Map className="w-8 h-8 fill-current" />;
      case 'shield': return <Shield className="w-8 h-8 fill-current" />;
      case 'users': return <Users className="w-8 h-8 fill-current" />;
      default: return <Star className="w-8 h-8 fill-current" />;
    }
  };

  return (
    <section className="bg-snow section-pad" id="o-nas">
      <span className="section-tag">01 / {dict.nav.whyUs.toUpperCase()}</span>
      <div className="wrap">
        <div className="shead">
          <span className="eyebrow">{dict.why.eyebrow}</span>
          <h2 dangerouslySetInnerHTML={{ __html: dict.why.headline }}></h2>
          <p>{dict.why.subheadline}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-9 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-[calc(var(--site-header)+var(--site-tread)+1.5rem)]">
            <div className="aspect-[4/5] overflow-hidden relative group">
              <Image src="https://images.unsplash.com/photo-1701602078164-89eaa64496db?fm=jpg&q=80&w=1200&auto=format&fit=crop" alt="Quad" fill className="object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]" referrerPolicy="no-referrer" />
              <div className="absolute top-5 right-5 bg-orange text-ink py-[14px] px-[18px] font-display uppercase text-[14px] tracking-[0.05em]">EST. 2018</div>
              <div className="absolute bottom-5 left-5 bg-snow py-4 px-5 font-label uppercase tracking-[0.1em] text-[12px] font-bold flex items-center gap-[10px]">
                <Shield className="w-[14px] h-[14px] fill-orange text-orange" />
                {dict.why.tag}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col">
            {features.map((feature, idx) => (
              <div key={feature.id} className="grid grid-cols-[78px_1fr] gap-[26px] py-8 border-t border-paper-2 relative hover:bg-paper hover:pl-5 transition-all duration-300 ease-[cubic-bezier(.2,.7,.2,1)] group border-b last:border-b-paper-2 last:border-b">
                <div className="w-16 h-16 bg-ink text-orange flex items-center justify-center">
                  {getIcon(feature.iconName)}
                </div>
                <div>
                  <h3 className="font-label uppercase tracking-[0.06em] text-[22px] font-bold m-0 mb-[10px] flex items-center gap-[14px]">
                    <span className="font-mono text-[12px] text-stone font-medium">0{idx + 1}</span>
                    {feature.title}
                  </h3>
                  <p className="text-[15.5px] leading-[1.6] text-[#4a4638] m-0">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
