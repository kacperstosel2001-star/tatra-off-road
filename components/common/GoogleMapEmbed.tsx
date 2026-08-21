import React from 'react'

const DEFAULT_ADDRESS = 'Ul. Świętej Anny 39, 34-521 Ząb'

export function googleMapsSearchUrl(address: string) {
  const q = encodeURIComponent(address.trim() || DEFAULT_ADDRESS)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

export function googleMapsEmbedUrl(address: string) {
  const q = encodeURIComponent(address.trim() || DEFAULT_ADDRESS)
  return `https://maps.google.com/maps?q=${q}&hl=pl&z=16&output=embed`
}

export function GoogleMapEmbed({
  address,
  className = '',
  title = 'Mapa dojazdu — Tatra Off-Road',
  openLabel = 'Otwórz w Google Maps',
  lang,
}: {
  address?: string | null
  className?: string
  title?: string
  openLabel?: string
  lang?: string
}) {
  const resolved = (address || DEFAULT_ADDRESS).trim() || DEFAULT_ADDRESS
  const embed = googleMapsEmbedUrl(resolved)
  const open = googleMapsSearchUrl(resolved)
  const label = openLabel || (lang === 'en' ? 'Open in Google Maps' : 'Otwórz w Google Maps')
  const mapTitle =
    title === 'Mapa dojazdu — Tatra Off-Road' && lang === 'en'
      ? 'Directions map — Tatra Off-Road'
      : title

  return (
    <div className={`relative overflow-hidden border border-stone-line bg-paper ${className}`}>
      <iframe
        title={mapTitle}
        src={embed}
        className="absolute inset-0 h-full w-full border-0 grayscale-[0.15] contrast-[1.02]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a
        href={open}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-2 bg-ink text-snow font-label text-[11px] uppercase tracking-[0.1em] font-bold px-3 py-2 hover:bg-orange hover:text-ink transition-colors"
      >
        {label}
      </a>
    </div>
  )
}
