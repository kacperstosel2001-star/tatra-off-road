'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  Smartphone,
  Building2,
} from 'lucide-react'
import Link from 'next/link'
import { localePath } from '@/lib/i18n'
import { bookingUi } from '@/lib/content/booking-ui'
import { translateTripName } from '@/lib/content/english'

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
  expiresAt?: string | null
  trip?: { name: string } | null
}

type PayMethod = {
  id: 'blik' | 'transfer'
  label: string
  description: string
}

function formatDate(value: string) {
  const d = String(value).slice(0, 10)
  const [y, m, day] = d.split('-')
  if (!y || !m || !day) return d
  return `${day}.${m}.${y}`
}

function useCountdown(expiresAt?: string | null) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!expiresAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return useMemo(() => {
    if (!expiresAt) return null
    const ms = new Date(expiresAt).getTime() - now
    if (ms <= 0) return { expired: true, label: '00:00' }
    const totalSec = Math.floor(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return {
      expired: false,
      label: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
    }
  }, [expiresAt, now])
}

export function CheckoutClient({ bookingId, lang = 'pl' }: { bookingId: string; lang?: string }) {
  const ui = bookingUi(lang).checkout
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<BookingPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [method, setMethod] = useState<'blik' | 'transfer'>('blik')
  const [methods, setMethods] = useState<PayMethod[]>([
    { id: 'blik', label: 'BLIK', description: '' },
    { id: 'transfer', label: 'Transfer', description: '' },
  ])
  const [cashbillMode, setCashbillMode] = useState<'test' | 'live'>('test')
  const countdown = useCountdown(booking?.status === 'pending' ? booking.expiresAt : null)

  useEffect(() => {
    fetch('/api/payments/cashbill/methods')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.methods) && data.methods.length) {
          setMethods(
            data.methods.map((m: PayMethod) => ({
              id: m.id,
              label: m.id === 'blik' ? ui.blik : m.id === 'transfer' ? ui.transfer : m.label,
              description: m.id === 'blik' ? ui.blikDesc : m.id === 'transfer' ? ui.transferDesc : m.description,
            })),
          )
        } else {
          setMethods([
            { id: 'blik', label: ui.blik, description: ui.blikDesc },
            { id: 'transfer', label: ui.transfer, description: ui.transferDesc },
          ])
        }
        if (data.mode === 'live' || data.mode === 'test') setCashbillMode(data.mode)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const paymentParam = searchParams.get('payment')
    if (paymentParam === 'return') {
      window.location.replace(localePath(lang, `/kasa/${bookingId}/dziekujemy`))
      return
    }

    fetch(`/api/booking/${bookingId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.booking) {
          setError(data.message || ui.notFound)
          return
        }
        const b = data.booking
        if (b?.trip?.name) b.trip.name = translateTripName(b.trip.name, lang === 'en' ? 'en' : 'pl')
        setBooking(b)
        setFirstName(data.booking.customerFirstName || '')
        setLastName(data.booking.customerLastName || '')
        setEmail(data.booking.customerEmail || '')
        if (data.booking.paymentStatus === 'deposit_paid' || data.booking.status === 'deposit_paid') {
          window.location.replace(localePath(lang, `/kasa/${bookingId}/dziekujemy`))
        } else if (paymentParam === 'cancel') {
          setError(ui.cancelled)
        }
      })
      .catch(() => setError(ui.loadError))
      .finally(() => setLoading(false))
  }, [bookingId, searchParams, lang])

  async function pay(e: React.FormEvent) {
    e.preventDefault()
    setPaying(true)
    setError('')
    try {
      const res = await fetch(`/api/booking/${bookingId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, firstName, lastName, email, lang }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || ui.payFail)
        return
      }
      if (data.alreadyPaid) {
        setDone(true)
        return
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
        return
      }
      setError(ui.noUrl)
    } catch {
      setError(ui.connection)
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="booking-shell animate-pulse">
        <div className="h-10 bg-stone-line/50 w-1/3 mb-6" />
        <div className="h-48 bg-stone-line/40 mb-4" />
        <div className="h-14 bg-stone-line/50" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="booking-shell">
        <p className="text-[#b32d2e] m-0">{error || 'Brak rezerwacji.'}</p>
        <Link href={localePath(lang, '/rezerwacja')} className="btn btn-primary mt-6 inline-flex">
          {ui.backToBooking}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 lg:gap-8 items-start pb-[calc(var(--site-sticky-cta)+1rem)] lg:pb-0">
      <div className="booking-shell min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-6 text-[11px] sm:text-[12px] font-label uppercase tracking-[0.08em] sm:tracking-[0.1em] text-stone">
          <span className="text-ink font-bold">{ui.stepBooking}</span>
          <span aria-hidden>→</span>
          <span className="text-orange font-bold">{ui.stepPay}</span>
          <span aria-hidden>→</span>
          <span>3. Potwierdzenie</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
          <h1 className="font-display text-[28px] sm:text-[36px] lg:text-[44px] uppercase m-0 leading-[0.95]">
            {ui.payDeposit}
          </h1>
          {cashbillMode === 'test' ? (
            <span className="font-label text-[11px] uppercase tracking-[0.1em] px-3 py-1.5 bg-ink text-snow self-start flex-none">
              Tryb testowy
            </span>
          ) : null}
        </div>
        <p className="text-[#4a4638] m-0 mb-8 text-[15px]">
          {ui.restOnSite.replace('{amount}', String(booking.remainingAmount ?? 0))}
        </p>

        {countdown && booking.status === 'pending' ? (
          <div
            className={`mb-6 border px-4 py-3 flex items-center gap-3 text-[14px] ${
              countdown.expired
                ? 'border-[#b32d2e] bg-[rgba(179,45,46,0.06)] text-[#b32d2e]'
                : 'border-orange bg-[rgba(255,105,13,0.08)]'
            }`}
          >
            <Clock size={18} className="flex-none" />
            {countdown.expired ? (
              <span>{ui.holdExpiredLong}</span>
            ) : (
              <span>
                Trzymamy termin jeszcze <strong className="font-mono text-[16px]">{countdown.label}</strong>
              </span>
            )}
          </div>
        ) : null}

        <div className="grid gap-0 text-[15px] mb-8">
          <div className="flex justify-between border-b border-stone-line py-3 gap-3">
            <span className="text-stone">{ui.trip}</span>
            <strong className="text-right">{booking.trip?.name || ui.trip}</strong>
          </div>
          <div className="flex justify-between border-b border-stone-line py-3 gap-3">
            <span className="text-stone">Termin</span>
            <strong>
              {formatDate(booking.bookingDate)} · {String(booking.bookingTime).slice(0, 5)}
              {booking.reservationEndTime ? `–${String(booking.reservationEndTime).slice(0, 5)}` : ''}
            </strong>
          </div>
          <div className="flex justify-between border-b border-stone-line py-3 gap-3">
            <span className="text-stone">Uczestnicy</span>
            <strong>
              {ui.driversPassengers.replace('{drivers}', String(booking.drivers)).replace('{passengers}', String(booking.passengers))}
            </strong>
          </div>
          <div className="flex justify-between border-b border-stone-line py-3 gap-3">
            <span className="text-stone">{ui.fullPrice}</span>
            <strong>{booking.fullPrice ?? 0} zł</strong>
          </div>
          <div className="flex justify-between border-b border-stone-line py-3 gap-3">
            <span className="text-stone">{ui.depositNow}</span>
            <strong className="text-orange text-[24px] font-display">{booking.depositAmount ?? 0} zł</strong>
          </div>
          <div className="flex justify-between py-3 gap-3">
            <span className="text-stone">{ui.remainingLabel}</span>
            <strong>{booking.remainingAmount ?? 0} zł</strong>
          </div>
        </div>

        {done ? (
          <div className="bg-ink text-snow p-6 flex gap-4 items-start">
            <CheckCircle2 className="text-orange flex-none mt-1" />
            <div>
              <h2 className="font-display text-[28px] uppercase m-0 mb-2">{ui.confirmed}</h2>
              <p className="m-0 text-[15px] opacity-90">
                {ui.accepted.replace('{id}', String(booking.id))}
              </p>
              <Link
                href={localePath(lang, `/kasa/${bookingId}/dziekujemy`)}
                className="inline-flex mt-4 text-orange font-label uppercase tracking-[0.08em] font-bold text-[13px]"
              >
                Zobacz potwierdzenie →
              </Link>
            </div>
          </div>
        ) : countdown?.expired ? (
          <Link href={localePath(lang, '/rezerwacja')} className="btn btn-primary">
            {ui.newDate}
          </Link>
        ) : (
          <form onSubmit={pay} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-label text-[12px] uppercase tracking-[0.08em] font-bold">{ui.firstName}</span>
                <input
                  className="booking-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-label text-[12px] uppercase tracking-[0.08em] font-bold">{ui.lastName}</span>
                <input
                  className="booking-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="font-label text-[12px] uppercase tracking-[0.08em] font-bold">
                {ui.email}
              </span>
              <input
                type="email"
                className="booking-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <span className="text-[12px] text-stone">{ui.emailHint}</span>
            </label>

            <fieldset className="m-0 p-0 border-0">
              <legend className="font-label text-[12px] uppercase tracking-[0.08em] font-bold mb-3">
                {ui.method}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {methods.map((m) => {
                  const active = method === m.id
                  const Icon = m.id === 'blik' ? Smartphone : Building2
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`booking-choice ${active ? 'is-active' : ''}`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <Icon className={active ? 'text-orange' : 'text-ink'} size={20} />
                        <strong className="font-label uppercase tracking-[0.06em] text-[14px]">{m.label}</strong>
                      </div>
                      <p className="m-0 text-[13px] text-[#4a4638]">{m.description}</p>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {error ? (
              <p className="text-[#b32d2e] m-0 text-[14px]" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={paying} className="btn btn-primary justify-center w-full sm:w-auto">
              {paying ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
              {ui.payDepositAmount.replace('{amount}', String(booking.depositAmount ?? 0))}
            </button>
            <p className="text-[13px] text-stone m-0">
              Bezpieczne przekierowanie do CashBill
              {cashbillMode === 'test' ? ui.testEnv : ''}.
            </p>
            <Link
              href={localePath(lang, '/rezerwacja')}
              className="inline-flex items-center gap-2 text-[13px] font-label uppercase tracking-[0.08em] font-bold text-stone hover:text-ink"
            >
              <ArrowLeft size={14} /> {ui.changeDate}
            </Link>
          </form>
        )}
      </div>

      <aside className="bg-ink text-snow p-6 lg:p-8 h-fit lg:sticky lg:top-[calc(var(--site-header)+var(--site-tread)+1rem)]">
        <p className="font-label text-[11px] uppercase tracking-[0.12em] text-orange m-0 mb-3">
          {ui.bookingHash.replace('{id}', String(booking.id))}
        </p>
        <h2 className="font-display text-[28px] uppercase m-0 mb-4 leading-none">Podsumowanie</h2>
        <p className="m-0 mb-2 opacity-80 text-[14px]">
          {ui.phone}: <strong>{booking.customerPhone}</strong>
        </p>
        <p className="m-0 mb-6 opacity-80 text-[14px]">
          {booking.customerFirstName} {booking.customerLastName}
        </p>
        <div className="border-t border-[rgba(245,241,231,0.12)] pt-5 grid gap-2 text-[14px]">
          <div className="flex justify-between">
            <span className="opacity-60">{ui.depositLabel}</span>
            <strong className="text-orange text-[22px] font-display">{booking.depositAmount ?? 0} zł</strong>
          </div>
          <div className="flex justify-between opacity-80">
            <span>{ui.remainingLabel}</span>
            <strong>{booking.remainingAmount ?? 0} zł</strong>
          </div>
        </div>
        <ul className="mt-6 mb-0 pl-4 text-[13px] opacity-75 grid gap-2">
          <li>{ui.afterPay}</li>
          <li>{ui.arriveEarly}</li>
          <li>{ui.cancelRule}</li>
        </ul>
      </aside>
    </div>
  )
}
