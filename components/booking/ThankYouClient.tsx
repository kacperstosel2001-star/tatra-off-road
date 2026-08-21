'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { localePath } from '@/lib/i18n'
import { CheckCircle2, Loader2, AlertCircle, Phone, ArrowRight } from 'lucide-react'

type BookingPayload = {
  id: string | number
  status: string
  paymentStatus?: string | null
  paymentMethod?: string | null
  bookingDate: string
  bookingTime: string
  reservationEndTime?: string | null
  drivers: number
  passengers: number
  customerFirstName?: string | null
  customerLastName?: string | null
  customerPhone: string
  customerEmail?: string | null
  fullPrice?: number | null
  depositAmount?: number | null
  remainingAmount?: number | null
  cashbillPaymentId?: string | null
  trip?: { name: string } | null
}

function methodLabel(method?: string | null) {
  if (method === 'blik') return 'BLIK'
  if (method === 'transfer') return 'Przelew bankowy'
  return method || 'Online'
}

function formatDate(value: string) {
  const d = String(value).slice(0, 10)
  const [y, m, day] = d.split('-')
  if (!y || !m || !day) return d
  return `${day}.${m}.${y}`
}

export function ThankYouClient({ bookingId, lang = 'pl' }: { bookingId: string; lang?: string }) {
  const [booking, setBooking] = useState<BookingPayload | null>(null)
  const [paid, setPaid] = useState(false)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    let cancelled = false
    let tries = 0

    async function syncOnce() {
      tries += 1
      setAttempts(tries)
      const res = await fetch(`/api/booking/${bookingId}/sync-payment`, { method: 'POST' })
      const data = await res.json()
      if (cancelled) return false

      if (!res.ok || !data.ok) {
        setError(data.message || 'Nie udało się potwierdzić płatności.')
        return false
      }

      setBooking(data.booking)
      if (data.paid) {
        setPaid(true)
        setFailed(false)
        setLoading(false)
        return true
      }
      if (data.failed) {
        setFailed(true)
        setLoading(false)
        return true
      }
      return false
    }

    ;(async () => {
      try {
        const done = await syncOnce()
        if (done || cancelled) return

        // CashBill czasem aktualizuje status z lekkim opóźnieniem — dociągamy kilka razy.
        for (let i = 0; i < 6; i++) {
          await new Promise((r) => setTimeout(r, 1500))
          if (cancelled) return
          const ok = await syncOnce()
          if (ok) return
        }
        setLoading(false)
      } catch {
        if (!cancelled) {
          setError('Błąd połączenia podczas potwierdzania płatności.')
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [bookingId])

  if (loading) {
    return (
      <div className="bg-paper border border-stone-line p-8 lg:p-12 text-center">
        <Loader2 className="animate-spin mx-auto mb-4 text-orange" size={36} />
        <h1 className="font-display text-[32px] uppercase m-0 mb-2">Potwierdzamy płatność…</h1>
        <p className="text-stone m-0">
          Sprawdzamy status w CashBill{attempts > 1 ? ` (próba ${attempts})` : ''}. Chwilę…
        </p>
      </div>
    )
  }

  if (failed) {
    return (
      <div className="bg-paper border border-stone-line p-8 lg:p-12">
        <div className="flex gap-4 items-start mb-6">
          <AlertCircle className="text-[#b32d2e] flex-none mt-1" />
          <div>
            <h1 className="font-display text-[36px] uppercase m-0 mb-2">Płatność nieudana</h1>
            <p className="text-stone m-0">
              Transakcja nie została zakończona. Możesz wrócić do kasy i spróbować ponownie.
            </p>
          </div>
        </div>
        <Link
          href={localePath(lang, `/kasa/${bookingId}`)}
          className="inline-flex items-center gap-2 bg-orange text-ink font-label uppercase tracking-[0.08em] font-bold px-6 py-4"
        >
          Wróć do kasy <ArrowRight size={18} />
        </Link>
      </div>
    )
  }

  if (!paid || !booking) {
    return (
      <div className="bg-paper border border-stone-line p-8 lg:p-12">
        <div className="flex gap-4 items-start mb-6">
          <AlertCircle className="text-orange flex-none mt-1" />
          <div>
            <h1 className="font-display text-[36px] uppercase m-0 mb-2">Czekamy na potwierdzenie</h1>
            <p className="text-stone m-0 mb-3">
              {error ||
                'Płatność mogła jeszcze nie dojść do CashBill. Odśwież za chwilę albo zadzwoń — potwierdzimy ręcznie.'}
            </p>
            {booking?.cashbillPaymentId && (
              <p className="text-[13px] text-stone m-0">ID płatności: {booking.cashbillPaymentId}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-orange text-ink font-label uppercase tracking-[0.08em] font-bold px-6 py-4"
          >
            Odśwież status
          </button>
          <a
            href="tel:+48888254223"
            className="inline-flex items-center gap-2 border border-stone-line px-6 py-4 font-label uppercase tracking-[0.08em] font-bold"
          >
            <Phone size={16} /> Zadzwoń
          </a>
        </div>
      </div>
    )
  }

  const fullName = [booking.customerFirstName, booking.customerLastName].filter(Boolean).join(' ')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8">
      <div className="booking-shell">
        <div className="flex items-center gap-2 mb-6 text-[12px] font-label uppercase tracking-[0.1em] text-stone">
          <span>1. Rezerwacja</span>
          <span aria-hidden>→</span>
          <span>2. Płatność</span>
          <span aria-hidden>→</span>
          <span className="text-orange font-bold">3. Potwierdzenie</span>
        </div>
        <div className="flex gap-4 items-start mb-8">
          <CheckCircle2 className="text-orange flex-none mt-1" size={36} />
          <div>
            <p className="font-label text-[12px] uppercase tracking-[0.1em] text-orange m-0 mb-2">
              Dziękujemy
            </p>
            <h1 className="font-display text-[40px] uppercase m-0 mb-3">Rezerwacja potwierdzona</h1>
            <p className="text-[#4a4638] m-0 text-[16px]">
              Zaliczka została opłacona
              {booking.customerEmail ? ` — potwierdzenie wysłaliśmy na ${booking.customerEmail}` : ''}.
              Na miejscu zapłacisz resztę przed startem wyprawy.
            </p>
          </div>
        </div>

        <div className="grid gap-0 text-[15px]">
          <div className="flex justify-between border-b border-stone-line py-3">
            <span>Numer rezerwacji</span>
            <strong>#{booking.id}</strong>
          </div>
          <div className="flex justify-between border-b border-stone-line py-3">
            <span>Wyprawa</span>
            <strong className="text-right">{booking.trip?.name || 'Wyprawa quadowa'}</strong>
          </div>
          <div className="flex justify-between border-b border-stone-line py-3">
            <span>Termin</span>
            <strong>
              {formatDate(booking.bookingDate)} · {String(booking.bookingTime).slice(0, 5)}
              {booking.reservationEndTime ? `–${String(booking.reservationEndTime).slice(0, 5)}` : ''}
            </strong>
          </div>
          <div className="flex justify-between border-b border-stone-line py-3">
            <span>Uczestnicy</span>
            <strong>
              {booking.drivers} kier. / {booking.passengers} pas.
            </strong>
          </div>
          <div className="flex justify-between border-b border-stone-line py-3">
            <span>Klient</span>
            <strong className="text-right">
              {fullName || '—'}
              <br />
              <span className="font-normal text-stone">{booking.customerPhone}</span>
            </strong>
          </div>
          <div className="flex justify-between border-b border-stone-line py-3">
            <span>Płatność</span>
            <strong>{methodLabel(booking.paymentMethod)}</strong>
          </div>
          <div className="flex justify-between border-b border-stone-line py-3">
            <span>Zaliczka opłacona</span>
            <strong className="text-orange text-[22px]">{booking.depositAmount ?? 0} zł</strong>
          </div>
          <div className="flex justify-between border-b border-stone-line py-3">
            <span>Reszta na miejscu</span>
            <strong>{booking.remainingAmount ?? 0} zł</strong>
          </div>
          <div className="flex justify-between py-3">
            <span>Cena pełna</span>
            <strong>{booking.fullPrice ?? 0} zł</strong>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={localePath(lang, '/')}
            className="btn btn-primary"
          >
            Strona główna
          </Link>
          <a
            href="tel:+48888254223"
            className="btn btn-ghost"
          >
            <Phone size={16} /> +48 888 254 223
          </a>
        </div>
      </div>

      <aside className="bg-ink text-snow p-6 lg:p-8 h-fit">
        <h2 className="font-display text-[28px] uppercase m-0 mb-4">Co dalej?</h2>
        <ol className="m-0 pl-5 grid gap-4 text-[15px] opacity-90">
          <li>Zapisz numer rezerwacji #{booking.id}.</li>
          <li>Bądź 15 minut wcześniej na miejscu.</li>
          <li>Kierowca musi mieć prawo jazdy kat. B.</li>
          <li>Na miejscu dopłacisz {booking.remainingAmount ?? 0} zł i dostaniesz briefing.</li>
          <li>Zmiana / anulacja: zadzwoń min. 24h wcześniej.</li>
        </ol>
        {booking.cashbillPaymentId && (
          <p className="mt-6 mb-0 text-[12px] opacity-50">CashBill: {booking.cashbillPaymentId}</p>
        )}
      </aside>
    </div>
  )
}
