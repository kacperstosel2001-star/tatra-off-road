"use client";

import React from 'react';
import { ArrowRight, Phone, Shield, Map, Camera } from 'lucide-react';
import { ProcessStepDTO } from '@/types/payload';

export function Process({ dict, steps }: { dict: any; steps: ProcessStepDTO[] }) {
  const getIcon = (name: string) => {
    switch (name) {
      case 'phone': return <Phone className="w-[30px] h-[30px] fill-current" />;
      case 'shield': return <Shield className="w-[30px] h-[30px] fill-current" />;
      case 'map': return <Map className="w-[30px] h-[30px] fill-current" />;
      case 'camera': return <Camera className="w-[30px] h-[30px] fill-current" />;
      default: return <Map className="w-[30px] h-[30px] fill-current" />;
    }
  };

  return (
    <section className="bg-ink text-snow section-pad">
      <span className="section-tag" style={{ color: 'var(--color-stone)' }}>05 / {dict.process.eyebrow.toUpperCase()}</span>
      <div className="wrap">
        <div className="shead">
          <span className="eyebrow">{dict.process.eyebrow}</span>
          <h2 dangerouslySetInnerHTML={{ __html: dict.process.headline }} className="text-snow"></h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 relative">
          {steps.map((step, idx) => (
            <div key={step.id} className="py-[26px] lg:p-[36px_26px_36px_0] lg:border-r border-b lg:border-b-0 border-[rgba(245,241,231,0.14)] relative last:border-r-0 last:border-b-0">
              <div className="font-mono text-[12px] text-orange tracking-[0.15em] mb-[22px]">{step.stepNum} / {dict.process.step}</div>
              <div className="w-[56px] h-[56px] bg-orange text-ink flex items-center justify-center mb-[22px]">
                {getIcon(step.iconName)}
              </div>
              <h3 className="font-display font-normal text-[24px] uppercase m-0 mb-3 leading-none">{step.title}</h3>
              <p className="text-[14.5px] leading-[1.6] text-[#E7E1D0] m-0 lg:mr-[26px]">{step.description}</p>
              
              {idx < steps.length - 1 && (
                <div className="absolute right-[-8px] top-[70px] text-orange hidden lg:block">
                  <ArrowRight className="w-4 h-4 text-orange" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
