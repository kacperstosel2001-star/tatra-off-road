"use client";

import React from 'react';
import { Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { ContactInfoDTO } from '@/types/payload';
import { Button } from '../ui/button';

export function Contact({ dict, contactInfo }: { dict: any; contactInfo: ContactInfoDTO }) {
  return (
    <section className="bg-snow section-pad" id="kontakt">
      <span className="section-tag">09 / {dict.nav.contact.toUpperCase()}</span>
      <div className="wrap">
        <div className="shead">
          <span className="eyebrow">{dict.contact.eyebrow}</span>
          <h2 dangerouslySetInnerHTML={{ __html: dict.contact.headline }}></h2>
          <p>{dict.contact.subheadline}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-9 lg:gap-[60px]">
          <div className="contact-info">
            <h3 className="font-label uppercase tracking-[0.1em] text-[14px] font-bold text-stone m-0 mb-2">Dane kontaktowe</h3>
            
            <div className="flex gap-[18px] items-start py-[22px] border-t border-paper-2">
              <div className="w-11 h-11 bg-ink text-orange flex items-center justify-center flex-none">
                <MapPin className="w-5 h-5 fill-current" />
              </div>
              <div>
                <b className="block font-label text-[15px] uppercase tracking-[0.06em] mb-0.5">Adres</b>
                <span className="text-[15px] text-[#4a4638]">{contactInfo.address}</span>
              </div>
            </div>
            
            <div className="flex gap-[18px] items-start py-[22px] border-t border-paper-2">
              <div className="w-11 h-11 bg-ink text-orange flex items-center justify-center flex-none">
                <Phone className="w-5 h-5 fill-current" />
              </div>
              <div>
                <b className="block font-label text-[15px] uppercase tracking-[0.06em] mb-0.5">Telefon</b>
                <span className="text-[15px] text-[#4a4638]">{contactInfo.phones.join(' · ')}</span>
              </div>
            </div>
            
            <div className="flex gap-[18px] items-start py-[22px] border-t border-paper-2">
              <div className="w-11 h-11 bg-ink text-orange flex items-center justify-center flex-none">
                <Mail className="w-5 h-5 fill-current" />
              </div>
              <div>
                <b className="block font-label text-[15px] uppercase tracking-[0.06em] mb-0.5">E-mail</b>
                <span className="text-[15px] text-[#4a4638]">{contactInfo.email}</span>
              </div>
            </div>
            
            <div className="flex gap-[18px] items-start py-[22px] border-y border-paper-2">
              <div className="w-11 h-11 bg-ink text-orange flex items-center justify-center flex-none">
                <Clock className="w-5 h-5 fill-current" />
              </div>
              <div>
                <b className="block font-label text-[15px] uppercase tracking-[0.06em] mb-0.5">Godziny</b>
                <span className="text-[15px] text-[#4a4638]">{contactInfo.hours}</span>
              </div>
            </div>
            
            <div className="mt-[26px] h-[240px] bg-paper relative overflow-hidden border border-stone-line">
              <svg viewBox="0 0 500 240" preserveAspectRatio="none" className="w-full h-full">
                <rect width="500" height="240" fill="#ECE6D6" />
                <path d="M0 60 H500 M0 120 H500 M0 180 H500" stroke="#C9BFA9" strokeWidth="1" />
                <path d="M60 0 V240 M180 0 V240 M280 0 V240 M380 0 V240" stroke="#C9BFA9" strokeWidth="1" />
                <path d="M-10 40 Q 120 10 260 60 T 510 40" stroke="#3E4B39" strokeWidth="3" fill="none" opacity=".6" />
                <path d="M-10 120 Q 140 90 280 130 T 510 100" stroke="#3E4B39" strokeWidth="2.5" fill="none" opacity=".4" />
                <path d="M-10 200 Q 100 170 250 200 T 510 190" stroke="#A79C89" strokeWidth="2" fill="none" />
              </svg>
              <div className="map-pin"></div>
            </div>
          </div>
          
          <form className="bg-paper p-6 lg:p-[44px] flex flex-col gap-[18px] relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-[80px] before:h-[4px] before:bg-orange">
            <h3 className="font-display font-normal text-[34px] uppercase m-0 mb-[10px] tracking-[0.005em]">{dict.contact.formTitle}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="font-label uppercase tracking-[0.08em] text-[11.5px] font-bold text-stone mb-1.5 block">{dict.contact.name}</label>
                <input type="text" placeholder="Jan Kowalski" required className="w-full border border-stone-line bg-snow p-[14px] font-body text-[15px] text-ink focus:outline-2 focus:outline-orange focus:outline-offset-1" />
              </div>
              <div>
                <label className="font-label uppercase tracking-[0.08em] text-[11.5px] font-bold text-stone mb-1.5 block">Telefon</label>
                <input type="tel" placeholder="+48 ___ ___ ___" required className="w-full border border-stone-line bg-snow p-[14px] font-body text-[15px] text-ink focus:outline-2 focus:outline-orange focus:outline-offset-1" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="font-label uppercase tracking-[0.08em] text-[11.5px] font-bold text-stone mb-1.5 block">Data wyprawy</label>
                <input type="date" className="w-full border border-stone-line bg-snow p-[14px] font-body text-[15px] text-ink focus:outline-2 focus:outline-orange focus:outline-offset-1" />
              </div>
              <div>
                <label className="font-label uppercase tracking-[0.08em] text-[11.5px] font-bold text-stone mb-1.5 block">Pakiet</label>
                <select className="w-full border border-stone-line bg-snow p-[14px] font-body text-[15px] text-ink focus:outline-2 focus:outline-orange focus:outline-offset-1 appearance-none rounded-none">
                  <option>Wycieczka 1 godzinna</option>
                  <option>Wycieczka 2 godzinna</option>
                  <option>Grupa / Firma</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="font-label uppercase tracking-[0.08em] text-[11.5px] font-bold text-stone mb-1.5 block">Liczba osób</label>
              <input type="number" min="1" defaultValue="2" className="w-full border border-stone-line bg-snow p-[14px] font-body text-[15px] text-ink focus:outline-2 focus:outline-orange focus:outline-offset-1" />
            </div>
            
            <div>
              <label className="font-label uppercase tracking-[0.08em] text-[11.5px] font-bold text-stone mb-1.5 block">{dict.contact.message}</label>
              <textarea placeholder="Dodatkowe informacje o wyprawie, terminie, grupie..." className="w-full border border-stone-line bg-snow p-[14px] font-body text-[15px] text-ink min-h-[100px] resize-y focus:outline-2 focus:outline-orange focus:outline-offset-1"></textarea>
            </div>
            
            <Button variant="primary" type="submit" className="mt-2 w-fit">
              {dict.common.sendInquiry} <ArrowRight className="w-4 h-4" />
            </Button>
            
            <div className="text-[12.5px] text-stone flex items-center gap-2">
              <CheckCircle className="w-[14px] h-[14px] fill-orange text-orange flex-none" />
              {dict.contact.finePrint}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
