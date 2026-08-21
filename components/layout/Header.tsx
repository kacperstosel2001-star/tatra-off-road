'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { localePath, stripLocaleFromPathname } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { telHref, useContact } from '@/components/providers/ContactProvider'

export function Header({ dict, lang }: { dict: any; lang: string }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname() || '/'
  const contact = useContact()
  const primaryPhone = contact.phones[0] || '+48 888 254 223'

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isMobileMenuOpen])

  const bare = stripLocaleFromPathname(pathname)
  const isHome = bare === '/'
  // Home at top: transparent over dark hero. After scroll / other pages: solid ink.
  const solid = isScrolled || !isHome || isMobileMenuOpen

  const navLinks = [
    { href: localePath(lang, '/'), label: dict.nav.home },
    { href: localePath(lang, '/trasy'), label: dict.nav.routes },
    { href: localePath(lang, '/cennik'), label: dict.nav.pricing },
    { href: localePath(lang, '/about'), label: dict.nav.about },
    { href: localePath(lang, '/contact'), label: dict.nav.contact },
  ]

  return (
    <>
      <header
        className={`site-header sticky top-0 left-0 w-full z-50 transition-[background,box-shadow] duration-300 ${
          solid
            ? 'bg-[rgba(15,13,10,0.97)] backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.22)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1320px] mx-auto px-5 sm:px-6 lg:px-[56px] h-[var(--site-header-mobile)] lg:h-[var(--site-header)] flex justify-between items-center gap-3">
          <Link
            href={localePath(lang, '/')}
            className="font-display text-[22px] sm:text-[24px] lg:text-[28px] text-snow uppercase tracking-[0.05em] leading-[0.95] relative z-[55] group"
          >
            Tatra
            <br />
            <span className="text-orange transition-colors group-hover:text-snow">Off-Road</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || bare === stripLocaleFromPathname(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] font-label uppercase tracking-[0.12em] font-semibold transition-colors duration-200 relative py-1 ${
                    isActive
                      ? 'text-orange font-bold after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-orange'
                      : 'text-snow hover:text-orange'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <LanguageSwitcher lang={lang} />
            <Link href={localePath(lang, '/rezerwacja')} className="btn btn-primary text-[13px] py-3 px-6">
              {dict.common.book}
            </Link>
          </nav>

          <div className="lg:hidden flex items-center gap-2 relative z-[55]">
            <a
              href={telHref(primaryPhone)}
              className="flex items-center justify-center w-10 h-10 text-snow"
              aria-label={lang === 'en' ? 'Call' : 'Zadzwoń'}
            >
              <Phone className="w-5 h-5 text-orange" />
            </a>
            <LanguageSwitcher lang={lang} />
            <button
              type="button"
              className="text-snow p-2 -mr-1 focus:outline-none"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label={
                isMobileMenuOpen
                  ? lang === 'en'
                    ? 'Close menu'
                    : 'Zamknij menu'
                  : lang === 'en'
                    ? 'Open menu'
                    : 'Otwórz menu'
              }
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={26} className="text-orange" /> : <Menu size={26} />}
            </button>
          </div>
        </div>
        <div className="nav-tread" aria-hidden />
      </header>

      <div
        className={`lg:hidden fixed inset-0 z-[80] bg-[#0F0D0A] flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex items-center justify-between px-5 h-[var(--site-header-mobile)] border-b border-[rgba(245,241,231,0.1)]">
          <Link
            href={localePath(lang, '/')}
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-display text-[22px] text-snow uppercase tracking-[0.05em] leading-[0.95]"
          >
            Tatra
            <br />
            <span className="text-orange">Off-Road</span>
          </Link>
          <button
            type="button"
            className="text-snow p-2 -mr-1"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Zamknij menu"
          >
            <X size={26} className="text-orange" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || bare === stripLocaleFromPathname(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3.5 text-[26px] font-display uppercase tracking-[0.08em] border-b border-[rgba(245,241,231,0.08)] ${
                  isActive ? 'text-orange' : 'text-snow'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 border-t border-[rgba(245,241,231,0.1)] space-y-3">
          <a
            href={telHref(primaryPhone)}
            className="flex items-center justify-center gap-2 py-3 text-snow font-label uppercase tracking-[0.1em] text-[13px] font-semibold"
          >
            <Phone className="w-4 h-4 text-orange" />
            {primaryPhone}
          </a>
          <Link
            href={localePath(lang, '/rezerwacja')}
            className="btn btn-primary w-full justify-center text-[14px] py-4"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {dict.common.book}
          </Link>
        </div>
      </div>
    </>
  )
}
