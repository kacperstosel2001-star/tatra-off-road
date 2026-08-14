'use client'

import React from 'react'
import Image from 'next/image'
import { ArrowRight, Play, Check, Shield, Users, Clock, MapPin } from 'lucide-react'
import { LinkButton } from '../ui/link-button'
import { localePath } from '@/lib/i18n'
import type { HeroDTO } from '@/types/payload'

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${u.pathname.slice(1)}&playsinline=1`
    }
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v')
      if (id)
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1`
    }
  } catch {
    /* ignore */
  }
  return null
}

function vimeoEmbed(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (!m) return null
  return `https://player.vimeo.com/video/${m[1]}?autoplay=1&muted=1&loop=1&background=1`
}

const stepIcons = {
  clock: Clock,
  users: Users,
  map: MapPin,
  shield: Shield,
}

export function Hero({ dict, content, lang = 'pl' }: { dict: any; content: HeroDTO; lang?: string }) {
  const yt = content.videoUrl ? youtubeEmbed(content.videoUrl) : null
  const vimeo = content.videoUrl && !yt ? vimeoEmbed(content.videoUrl) : null
  const useVideo = content.mediaType === 'video' && Boolean(content.videoUrl || yt || vimeo)
  const panel = content.bookingPanel

  return (
    <section
      className="relative overflow-hidden text-snow bg-ink min-h-[calc(100svh-var(--site-chrome-mobile))] lg:min-h-[calc(100vh-90px)] flex flex-col justify-center -mt-[var(--site-chrome-mobile)] lg:-mt-[calc(var(--site-header)+var(--site-tread))]"
      id="top"
    >
      <div className="absolute inset-0 z-1">
        {useVideo && (yt || vimeo) ? (
          <iframe
            src={(yt || vimeo)!}
            title="Hero video"
            className="absolute inset-0 w-full h-full object-cover scale-[1.15] pointer-events-none border-0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : useVideo && content.videoUrl ? (
          <video
            className="absolute inset-0 w-full h-full object-cover brightness-42 contrast-108 saturate-90"
            autoPlay
            muted
            loop
            playsInline
            poster={content.bgImage || undefined}
          >
            <source src={content.videoUrl} />
          </video>
        ) : (
          <Image
            src={content.bgImage}
            alt="Hero Background"
            fill
            priority
            className="object-cover brightness-42 contrast-108 saturate-90"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
      <div className="absolute inset-0 z-2 bg-[linear-gradient(180deg,rgba(15,13,10,0.55)_0%,rgba(15,13,10,0.35)_30%,rgba(15,13,10,0.7)_100%),linear-gradient(90deg,rgba(15,13,10,0.7)_0%,rgba(15,13,10,0)_60%)]" />

      <div className="relative z-5 pt-[calc(var(--site-chrome-mobile)+1.25rem)] pb-20 sm:pt-[calc(var(--site-chrome-mobile)+2rem)] sm:pb-20 lg:pt-[calc(var(--site-header)+var(--site-tread)+2.5rem)] lg:pb-[100px] px-5 sm:px-6 lg:px-14 max-w-[1320px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-[60px] items-center">
        <div>
          <div className="flex gap-2 flex-wrap mb-5 sm:mb-8">
            {(content.badges || []).slice(0, 4).map((badge, i) => (
              <span
                key={i}
                className="border border-[rgba(245,241,231,0.3)] py-1.5 sm:py-2 px-2.5 sm:px-[14px] font-label uppercase tracking-[0.1em] text-[10px] sm:text-[11px] font-semibold text-stone flex items-center gap-2"
              >
                {i < 2 ? (
                  <Check className="w-3 h-3 text-orange" />
                ) : i === 2 ? (
                  <Shield className="w-3 h-3 text-orange" />
                ) : (
                  <Users className="w-3 h-3 text-orange" />
                )}
                {badge}
              </span>
            ))}
          </div>

          <h1 className="font-display font-normal text-[44px] sm:text-[60px] lg:text-[96px] leading-[0.92] uppercase m-0 mb-6 sm:mb-[30px] tracking-[-0.005em]">
            {content.headline}
            <br />
            {content.highlightWord || 'przygoda'}
            <br />
            <span className="text-orange relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[6px] after:w-full after:bg-orange after:opacity-25">
              {content.subheadline}
            </span>
          </h1>

          <p className="text-[16px] sm:text-[19px] leading-[1.6] max-w-[520px] text-[#E7E1D0] mb-8 sm:mb-10">
            {content.lead}
          </p>

          <div className="flex items-center gap-5 flex-wrap mb-10">
            <LinkButton href={localePath(lang, '/rezerwacja')} variant="primary">
              {content.primaryCtaLabel || dict.common.book} <ArrowRight className="w-4 h-4" />
            </LinkButton>
            <a
              href="#cennik"
              className="flex items-center gap-3 font-label tracking-[0.08em] uppercase font-semibold text-[13px] text-snow hover:text-orange transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-[rgba(245,241,231,0.14)] border border-[rgba(245,241,231,0.3)] flex items-center justify-center">
                <Play className="w-[14px] h-[14px] text-snow ml-[2px] fill-snow" />
              </div>
              {content.secondaryCtaLabel || dict.nav.pricing}
            </a>
          </div>

          <div className="grid grid-cols-3 gap-9 pt-8 border-t border-[rgba(245,241,231,0.16)] w-fit">
            {(content.stats || []).map((stat, i) => (
              <div key={i}>
                <div className="font-display text-[38px] text-orange leading-none">{stat.value}</div>
                <div className="font-label uppercase tracking-[0.1em] text-[11px] text-stone mt-[6px] font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[rgba(15,13,10,0.55)] backdrop-blur-[20px] border border-[rgba(245,241,231,0.15)] p-8 relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-[60px] before:h-[4px] before:bg-orange">
          <div className="text-orange mb-2 label">{panel.eyebrow || dict.hero.quickBook}</div>
          <h3 className="font-display font-normal text-[26px] uppercase m-0 mb-4 tracking-[0.005em]">
            {panel.title}
          </h3>
          <ul className="m-0 mb-7 p-0 list-none grid gap-3 text-[14.5px] text-[#E7E1D0]">
            {(panel.steps || []).map((step, i) => {
              const Icon = stepIcons[step.iconName as keyof typeof stepIcons] || Clock
              return (
                <li key={i} className="flex gap-3 items-start">
                  <Icon className="w-4 h-4 text-orange flex-none mt-1" />
                  {step.text}
                </li>
              )
            })}
          </ul>
          <LinkButton href={localePath(lang, '/rezerwacja')} variant="primary" className="w-full justify-center">
            {panel.buttonLabel || dict.common.checkAvailability} <ArrowRight className="w-4 h-4" />
          </LinkButton>
          <div className="text-[11.5px] text-stone mt-[12px] text-center">{panel.finePrint}</div>
        </div>
      </div>

      <div className="hero-scroll">
        Scroll
        <div className="line"></div>
      </div>
    </section>
  )
}
