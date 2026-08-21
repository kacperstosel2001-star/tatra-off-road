import React from 'react'
import { Circle } from 'lucide-react'

export function Marquee({ phrases }: { phrases: string[] }) {
  const items = phrases.length
    ? phrases
    : [
        'Can-Am 2025',
        'Podhale & Tatry',
        'Trasy leśne',
        'Trasy górskie',
        'Kask w cenie',
        'Doświadczeni przewodnicy',
      ]

  return (
    <div className="bg-orange text-ink border-y-2 border-ink overflow-hidden relative z-3">
      <div className="marquee-track flex gap-14 py-[14px] whitespace-nowrap font-display uppercase text-[22px] tracking-[0.02em]">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="flex items-center gap-[22px]">
            {items[i % items.length]}
            <Circle className="w-4 h-4 fill-ink" />
          </span>
        ))}
      </div>
    </div>
  )
}
