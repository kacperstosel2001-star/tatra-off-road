'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { localePath } from '@/lib/i18n'
import { telHref, useContact } from '@/components/providers/ContactProvider'

export function Footer({ dict, lang }: { dict: any; lang: string }) {
  const contact = useContact()
  const addressLines = (contact.address || '').split('\n').filter(Boolean)

  return (
    <footer className="bg-[#0A0A0A] border-t border-[rgba(245,241,231,0.06)] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 py-12 lg:py-16 px-6 lg:px-[56px] max-w-[1320px] mx-auto">
        <div>
          <Link
            href={localePath(lang, '/')}
            className="font-display text-[28px] text-snow uppercase tracking-[0.05em] leading-none inline-block mb-5"
          >
            Tatra
            <br />
            <span className="text-orange">Off-Road</span>
          </Link>
          <p className="text-[14px] leading-[1.65] max-w-[280px] text-stone">{dict.footer.desc}</p>
        </div>

        <div className="lg:pl-6">
          <h4 className="font-label uppercase tracking-[0.14em] text-[12.5px] text-snow m-0 mb-[18px]">
            {dict.footer.nav}
          </h4>
          <ul className="m-0 p-0 list-none">
            <li className="mb-[11px] text-[14.5px] text-stone transition-colors duration-200 hover:text-orange">
              <Link href={localePath(lang, '/')}>{dict.nav.home}</Link>
            </li>
            <li className="mb-[11px] text-[14.5px] text-stone transition-colors duration-200 hover:text-orange">
              <Link href={localePath(lang, '/about')}>{dict.nav.about}</Link>
            </li>
            <li className="mb-[11px] text-[14.5px] text-stone transition-colors duration-200 hover:text-orange">
              <Link href={localePath(lang, '/flota')}>{dict.nav.fleet}</Link>
            </li>
            <li className="mb-[11px] text-[14.5px] text-stone transition-colors duration-200 hover:text-orange">
              <Link href={localePath(lang, '/trasy')}>{dict.nav.routes}</Link>
            </li>
            <li className="mb-[11px] text-[14.5px] text-stone transition-colors duration-200 hover:text-orange">
              <Link href={localePath(lang, '/cennik')}>{dict.nav.pricing}</Link>
            </li>
            <li className="mb-[11px] text-[14.5px] text-stone transition-colors duration-200 hover:text-orange">
              <Link href={localePath(lang, '/rezerwacja')}>{dict.common.book}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-label uppercase tracking-[0.14em] text-[12.5px] text-snow m-0 mb-[18px]">
            {dict.footer.info}
          </h4>
          <ul className="m-0 p-0 list-none">
            <li className="mb-[11px] text-[14.5px] text-stone transition-colors duration-200 hover:text-orange">
              <Link href={localePath(lang, '/news')}>{dict.nav.news}</Link>
            </li>
            <li className="mb-[11px] text-[14.5px] text-stone transition-colors duration-200 hover:text-orange">
              <Link href={localePath(lang, '/contact')}>{dict.nav.contact}</Link>
            </li>
            <li className="mb-[11px] text-[14.5px] text-stone transition-colors duration-200 hover:text-orange">
              <Link href={localePath(lang, '/privacy-policy')}>{dict.nav.privacy}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-label uppercase tracking-[0.14em] text-[12.5px] text-snow m-0 mb-[18px]">
            {dict.footer.contact}
          </h4>
          <address className="not-italic text-stone text-[14px] leading-[1.8] flex flex-col items-start">
            {addressLines.length ? (
              <span className="mb-2">
                {addressLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < addressLines.length - 1 ? <br /> : null}
                  </React.Fragment>
                ))}
              </span>
            ) : null}
            {contact.phones.map((phone) => (
              <a
                key={phone}
                href={telHref(phone)}
                className="text-snow text-[17px] font-display hover:text-orange transition-colors mt-1 inline-flex items-center gap-1"
              >
                {phone} <ArrowUpRight className="w-4 h-4 text-orange" />
              </a>
            ))}
            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-orange transition-colors mt-2 text-[13.5px]"
              >
                {contact.email}
              </a>
            ) : null}
          </address>
        </div>
      </div>

      <div className="border-t border-[rgba(245,241,231,0.06)] py-6 text-center text-[12.5px] text-stone tracking-[0.05em]">
        {dict.footer.copyright} · {dict.footer.madeWith}
      </div>
      <div className="footer-tread" />
    </footer>
  )
}
