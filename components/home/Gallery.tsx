'use client'

import React from 'react'
import Image from 'next/image'
import type { GalleryItemDTO } from '@/types/payload'

const layoutClass: Record<string, string> = {
  '1x1': 'col-span-1 row-span-1',
  '2x1': 'lg:col-span-2 lg:row-span-1 col-span-2 row-span-1',
  '1x2': 'lg:col-span-1 lg:row-span-2 col-span-1 row-span-2',
  '2x2': 'lg:col-span-2 lg:row-span-2 col-span-2 row-span-2',
  '3x1': 'lg:col-span-3 lg:row-span-1 col-span-2 row-span-1',
}

export function Gallery({ dict, items }: { dict: any; items: GalleryItemDTO[] }) {
  if (!items.length) return null

  return (
    <section className="bg-snow section-pad" id="galeria">
      <span className="section-tag">05 / {dict.nav.gallery.toUpperCase()}</span>
      <div className="wrap">
        <div className="shead">
          <span className="eyebrow">{dict.gallery.eyebrow}</span>
          <h2 dangerouslySetInnerHTML={{ __html: dict.gallery.headline }}></h2>
          <p>{dict.gallery.subheadline}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[160px] lg:auto-rows-[180px] gap-[14px]">
          {items.map((img) => (
            <div
              key={img.id}
              className={`relative overflow-hidden bg-paper group ${layoutClass[img.layout] || layoutClass['1x1']}`}
            >
              <Image
                src={img.image}
                alt={img.caption}
                fill
                className="object-cover transition-transform duration-1000 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,13,10,0)_60%,rgba(15,13,10,0.6)_100%)] opacity-0 transition-opacity duration-300 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:opacity-100"></div>
              <span className="absolute bottom-4 left-[18px] text-snow font-label uppercase text-[11px] tracking-[0.12em] font-semibold opacity-0 translate-y-1.5 transition-all duration-300 ease-[cubic-bezier(.2,.7,.2,1)] z-2 group-hover:opacity-100 group-hover:translate-y-0">
                {img.caption}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
