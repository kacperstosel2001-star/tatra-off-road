'use client'

import React, { useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import type { Locale } from '@/types/payload'
import { SITE_RIDE_CLIPS } from '@/lib/content/site-media'

export function RideClips({ dict, lang = 'pl' }: { dict: any; lang?: Locale }) {
  const locale = lang === 'en' ? 'en' : 'pl'
  const [playingId, setPlayingId] = useState<string | null>(null)
  const refs = useRef<Record<string, HTMLVideoElement | null>>({})

  const toggle = async (id: string) => {
    const el = refs.current[id]
    if (!el) return

    if (playingId && playingId !== id) {
      const prev = refs.current[playingId]
      if (prev) {
        prev.pause()
        prev.currentTime = 0
      }
    }

    if (playingId === id && !el.paused) {
      el.pause()
      setPlayingId(null)
      return
    }

    try {
      el.muted = false
      await el.play()
      setPlayingId(id)
    } catch {
      el.muted = true
      await el.play()
      setPlayingId(id)
    }
  }

  return (
    <section className="bg-ink text-snow section-pad" id="zjazdy">
      <span className="section-tag" style={{ color: 'var(--color-stone)' }}>
        07 / {dict.rides.eyebrow.toUpperCase()}
      </span>
      <div className="wrap">
        <div className="shead">
          <span className="eyebrow">{dict.rides.eyebrow}</span>
          <h2
            dangerouslySetInnerHTML={{ __html: dict.rides.headline }}
            className="text-snow"
          />
          <p className="text-[#E7E1D0]">{dict.rides.subheadline}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          {SITE_RIDE_CLIPS.map((clip) => {
            const active = playingId === clip.id
            return (
              <article
                key={clip.id}
                className="relative overflow-hidden bg-[#1a1714] aspect-[9/16] sm:aspect-[3/4] group"
              >
                <video
                  ref={(node) => {
                    refs.current[clip.id] = node
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={clip.src}
                  poster={clip.poster}
                  playsInline
                  preload="metadata"
                  loop
                  onEnded={() => setPlayingId(null)}
                  onPause={() => {
                    if (playingId === clip.id) setPlayingId(null)
                  }}
                />
                <div
                  className={`absolute inset-0 bg-[linear-gradient(180deg,rgba(15,13,10,0.15)_0%,rgba(15,13,10,0.55)_100%)] transition-opacity duration-300 ${
                    active ? 'opacity-40' : 'opacity-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => void toggle(clip.id)}
                  className="absolute inset-0 z-2 flex flex-col items-center justify-center gap-3 cursor-pointer border-0 bg-transparent"
                  aria-label={
                    active
                      ? `${dict.rides.pause} — ${clip.label[locale]}`
                      : `${dict.rides.play} — ${clip.label[locale]}`
                  }
                >
                  <span className="flex h-14 w-14 items-center justify-center bg-orange text-ink transition-transform duration-300 group-hover:scale-105">
                    {active ? (
                      <Pause className="h-6 w-6 fill-current" />
                    ) : (
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    )}
                  </span>
                  <span className="font-label text-[11px] uppercase tracking-[0.14em] font-semibold text-snow">
                    {clip.label[locale]}
                  </span>
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
