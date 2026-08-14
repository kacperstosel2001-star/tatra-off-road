'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  HardHat,
  Info,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { localePath } from '@/lib/i18n'

type Trip = {
  id: string | number
  name: string
  durationHours: number
  price1: number
  price2: number
  deposit: number
  description?: string | null
}

type Price = {
  total: number
  deposit: number
  remaining: number
}

type StepId = 'trip' | 'party' | 'schedule' | 'details'

const STEPS: { id: StepId; label: string }[] = [
  { id: 'trip', label: 'Wyprawa' },
  { id: 'party', label: 'Uczestnicy' },
  { id: 'schedule', label: 'Termin' },
  { id: 'details', label: 'Dane' },
]

const BOOKING_FAQ = [
  {
    q: 'Co obejmuje cena?',
    a: 'Quad, paliwo, kask, briefing i opiekę przewodnika na trasie.',
  },
  {
    q: 'Jak działa zaliczka?',
    a: 'Online płacisz tylko zaliczkę (BLIK/przelew). Resztę dopłacasz na miejscu przed startem.',
  },
  {
    q: 'Anulowanie',
    a: 'Zmiana terminu lub anulacja minimum 24h przed startem — oddzwonimy i pomożemy.',
  },
  {
    q: 'Wymagania',
    a: 'Prawo jazdy kat. B dla kierowcy. Pasażer od 10 lat (z opiekunem). Sportowe obuwie.',
  },
]

function sessionKey() {
  if (typeof window === 'undefined') return ''
  const key = 'quad_booking_session'
  let value = localStorage.getItem(key)
  if (!value) {
    value = crypto.randomUUID()
    localStorage.setItem(key, value)
  }
  return value
}

function draftKey() {
  return 'quad_booking_draft_v1'
}

function minDateISO() {
  const d = new Date()
  d.setDate(d.getDate())
  return d.toISOString().slice(0, 10)
}

export function BookingWizard({ lang = 'pl' }: { lang?: string }) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [times, setTimes] = useState<{ time: string; availableQuads: number }[]>([])
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [step, setStep] = useState<StepId>('trip')
  const [openFaq, setOpenFaq] = useState(0)

  const [tripId, setTripId] = useState('')
  const [drivers, setDrivers] = useState(1)
  const [passengers, setPassengers] = useState(0)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  useEffect(() => {
    fetch('/api/booking/trips')
      .then((r) => r.json())
      .then((data) => {
        const list: Trip[] = data.trips || []
        setTrips(list)

        try {
          const raw = localStorage.getItem(draftKey())
          if (raw) {
            const draft = JSON.parse(raw)
            if (draft.tripId && list.some((t) => String(t.id) === String(draft.tripId))) {
              setTripId(String(draft.tripId))
            } else if (list[0]) {
              setTripId(String(list[0].id))
            }
            if (draft.drivers) setDrivers(Number(draft.drivers) || 1)
            if (typeof draft.passengers === 'number') setPassengers(draft.passengers)
            if (draft.date) setDate(draft.date)
            if (draft.time) setTime(draft.time)
            if (draft.firstName) setFirstName(draft.firstName)
            if (draft.lastName) setLastName(draft.lastName)
            if (draft.phone) setPhone(draft.phone)
            if (draft.step && STEPS.some((s) => s.id === draft.step)) setStep(draft.step)
          } else if (list[0]) {
            setTripId(String(list[0].id))
          }
        } catch {
          if (list[0]) setTripId(String(list[0].id))
        }
      })
      .catch(() => setError('Nie udało się załadować wypraw.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading) return
    try {
      localStorage.setItem(
        draftKey(),
        JSON.stringify({
          step,
          tripId,
          drivers,
          passengers,
          date,
          time,
          firstName,
          lastName,
          phone,
        }),
      )
    } catch {
      /* ignore */
    }
  }, [loading, step, tripId, drivers, passengers, date, time, firstName, lastName, phone])

  const selectedTrip = useMemo(
    () => trips.find((t) => String(t.id) === String(tripId)),
    [trips, tripId],
  )

  const previewPrice: Price | null = useMemo(() => {
    if (!selectedTrip) return null
    const p = Math.max(0, Math.min(passengers, drivers))
    const total = p * selectedTrip.price2 + (drivers - p) * selectedTrip.price1
    const deposit = Math.min(selectedTrip.deposit * drivers, total || selectedTrip.deposit * drivers)
    return { total, deposit, remaining: Math.max(0, total - deposit) }
  }, [selectedTrip, drivers, passengers])

  useEffect(() => {
    if (!tripId || !date) {
      setTimes([])
      return
    }
    setLoadingTimes(true)
    setError('')
    fetch('/api/booking/times', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId,
        date,
        drivers,
        sessionId: sessionKey(),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const slots =
          Array.isArray(data.slots) && data.slots.length
            ? data.slots
            : (data.times || []).map((t: string) => ({ time: t, availableQuads: drivers }))
        setTimes(slots)
        setTime((prev) => (slots.some((s: { time: string }) => s.time === prev) ? prev : ''))
        if (!slots.length) {
          setError('Brak wolnych godzin na ten dzień przy wybranej liczbie quadow.')
        }
      })
      .catch(() => setError('Nie udało się pobrać dostępnych godzin.'))
      .finally(() => setLoadingTimes(false))
  }, [tripId, date, drivers])

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  function canGoNext(): boolean {
    if (step === 'trip') return Boolean(tripId)
    if (step === 'party') return drivers >= 1 && passengers >= 0 && passengers <= drivers
    if (step === 'schedule') return Boolean(date && time)
    return Boolean(firstName.trim() && lastName.trim() && phone.trim().length >= 9)
  }

  function goNext() {
    setError('')
    if (!canGoNext()) {
      if (step === 'schedule') setError('Wybierz datę i dostępną godzinę.')
      if (step === 'details') setError('Uzupełnij imię, nazwisko i telefon.')
      return
    }
    const next = STEPS[stepIndex + 1]
    if (next) setStep(next.id)
  }

  function goBack() {
    setError('')
    const prev = STEPS[stepIndex - 1]
    if (prev) setStep(prev.id)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step !== 'details') {
      goNext()
      return
    }
    if (!canGoNext()) {
      setError('Uzupełnij imię, nazwisko i telefon.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/booking/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          drivers,
          passengers,
          phone,
          firstName,
          lastName,
          date,
          time,
          sessionId: sessionKey(),
          lang,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Nie udało się zarezerwować.')
        return
      }
      try {
        localStorage.removeItem(draftKey())
      } catch {
        /* ignore */
      }
      window.location.href = data.checkoutUrl || localePath(lang, `/kasa/${data.bookingId || data.booking?.id}`)
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="booking-shell animate-pulse">
        <div className="h-3 bg-stone-line/60 w-2/3 mb-8" />
        <div className="h-40 bg-stone-line/40 mb-4" />
        <div className="h-40 bg-stone-line/40 mb-4" />
        <div className="h-14 bg-stone-line/50" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-8 lg:gap-10 items-start">
      <form onSubmit={onSubmit} className="booking-shell">
        <div className="mb-8">
          <p className="eyebrow m-0 mb-3">Rezerwacja online</p>
          <h1 className="font-display text-[34px] lg:text-[44px] uppercase m-0 tracking-[0.005em] leading-[0.95]">
            Zarezerwuj wyprawę
          </h1>
          <p className="text-[#4a4638] text-[15.5px] mt-3 mb-0 max-w-[52ch]">
            4 krótkie kroki. Zaliczkę opłacisz bezpiecznie online — resztę na miejscu.
          </p>
        </div>

        <nav aria-label="Postęp rezerwacji" className="booking-steps mb-8">
          {STEPS.map((s, i) => {
            const done = i < stepIndex
            const active = i === stepIndex
            return (
              <button
                key={s.id}
                type="button"
                className={`booking-step ${done ? 'is-done' : ''} ${active ? 'is-active' : ''}`}
                onClick={() => {
                  if (i <= stepIndex) setStep(s.id)
                }}
                aria-current={active ? 'step' : undefined}
              >
                <span className="booking-step-num">{done ? <Check size={14} /> : i + 1}</span>
                <span className="booking-step-label">{s.label}</span>
              </button>
            )
          })}
        </nav>

        {step === 'trip' && (
          <section className="grid gap-3" aria-labelledby="step-trip">
            <h2 id="step-trip" className="font-label text-[13px] uppercase tracking-[0.1em] font-bold m-0 mb-1">
              Wybierz wyprawę
            </h2>
            {trips.map((trip) => {
              const active = String(trip.id) === String(tripId)
              return (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => setTripId(String(trip.id))}
                  className={`booking-choice text-left ${active ? 'is-active' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-display text-[22px] lg:text-[26px] uppercase leading-none mb-2">
                        {trip.name}
                      </div>
                      <div className="flex flex-wrap gap-3 text-[13px] text-[#4a4638]">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={14} className="text-orange" /> {trip.durationHours} h
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={14} className="text-orange" /> do 4 quadow
                        </span>
                      </div>
                      {trip.description ? (
                        <p className="m-0 mt-2 text-[14px] text-[#4a4638]">{trip.description}</p>
                      ) : null}
                    </div>
                    <div className="text-right flex-none">
                      <div className="font-mono text-[18px] font-semibold">{trip.price1} zł</div>
                      <div className="text-[11px] uppercase tracking-[0.08em] text-stone">od / 1 os.</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </section>
        )}

        {step === 'party' && (
          <section aria-labelledby="step-party" className="grid gap-6">
            <h2 id="step-party" className="font-label text-[13px] uppercase tracking-[0.1em] font-bold m-0">
              Ilu jedziecie?
            </h2>
            <p className="m-0 text-[14.5px] text-[#4a4638] -mt-3">
              1 kierowca = 1 quad. Pasażer jedzie z Tyłem (cena 2 os. na quadzie).
            </p>

            <div>
              <div className="font-label text-[12px] uppercase tracking-[0.08em] font-bold mb-3">
                Kierowcy (quady)
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`booking-chip ${drivers === n ? 'is-active' : ''}`}
                    onClick={() => {
                      setDrivers(n)
                      setPassengers((p) => Math.min(p, n))
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="font-label text-[12px] uppercase tracking-[0.08em] font-bold mb-3">
                Pasażerowie (0–{drivers})
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: drivers + 1 }, (_, n) => n).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`booking-chip ${passengers === n ? 'is-active' : ''}`}
                    onClick={() => setPassengers(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {previewPrice && (
              <div className="bg-snow border border-stone-line p-4 text-[14px] text-[#4a4638]">
                {drivers} × quad · {passengers} pasażerów · razem{' '}
                <strong className="text-ink">{previewPrice.total} zł</strong>
              </div>
            )}
          </section>
        )}

        {step === 'schedule' && (
          <section aria-labelledby="step-schedule" className="grid gap-5">
            <h2 id="step-schedule" className="font-label text-[13px] uppercase tracking-[0.1em] font-bold m-0">
              Wybierz termin
            </h2>
            <p className="m-0 text-[14.5px] text-[#4a4638] -mt-2">
              Godziny uwzględniają zajętość z Google Calendar i wolne quady.
            </p>

            <label className="flex flex-col gap-1.5">
              <span className="font-label text-[12px] uppercase tracking-[0.08em] font-bold">Data</span>
              <input
                type="date"
                min={minDateISO()}
                className="booking-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>

            <div>
              <div className="font-label text-[12px] uppercase tracking-[0.08em] font-bold mb-3">
                Godzina startu
              </div>
              {!date ? (
                <div className="booking-empty">Najpierw wybierz datę — pokażemy wolne godziny.</div>
              ) : loadingTimes ? (
                <div className="booking-empty inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Sprawdzamy dostępność…
                </div>
              ) : times.length === 0 ? (
                <div className="booking-empty">
                  Brak wolnych godzin tego dnia. Wybierz inną datę albo zmniejsz liczbę quadow.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {times.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      className={`booking-slot ${time === slot.time ? 'is-active' : ''}`}
                      onClick={() => setTime(slot.time)}
                    >
                      <strong className="font-display text-[22px] leading-none">{slot.time}</strong>
                      <span className="text-[11px] uppercase tracking-[0.06em] text-stone mt-1">
                        wolne: {slot.availableQuads}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {step === 'details' && (
          <section aria-labelledby="step-details" className="grid gap-5">
            <h2 id="step-details" className="font-label text-[13px] uppercase tracking-[0.1em] font-bold m-0">
              Dane rezerwującego
            </h2>
            <p className="m-0 text-[14.5px] text-[#4a4638] -mt-2">
              Potwierdzenie i kontakt w sprawie wyprawy.
            </p>

            <div className="bg-ink text-snow p-4 grid gap-2 text-[14px]">
              <div className="flex justify-between gap-3">
                <span className="opacity-70">Wyprawa</span>
                <strong className="text-right">{selectedTrip?.name}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="opacity-70">Termin</span>
                <strong>
                  {date} · {time}
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="opacity-70">Uczestnicy</span>
                <strong>
                  {drivers} kier. / {passengers} pas.
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-label text-[12px] uppercase tracking-[0.08em] font-bold">Imię</span>
                <input
                  className="booking-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-label text-[12px] uppercase tracking-[0.08em] font-bold">Nazwisko</span>
                <input
                  className="booking-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  required
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="font-label text-[12px] uppercase tracking-[0.08em] font-bold">Telefon</span>
              <input
                className="booking-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+48 ___ ___ ___"
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </label>
          </section>
        )}

        {error ? <p className="text-[#b32d2e] m-0 mt-5 text-[14px]" role="alert">{error}</p> : null}

        <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-stone-line">
          {stepIndex > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={goBack}>
              <ArrowLeft size={16} /> Wstecz
            </button>
          ) : null}

          {step !== 'details' ? (
            <button
              type="button"
              className="btn btn-primary ml-auto"
              onClick={goNext}
              disabled={!canGoNext()}
            >
              Dalej <ArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" className="btn btn-primary ml-auto" disabled={submitting || !canGoNext()}>
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              Przejdź do płatności
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </form>

      <aside className="booking-aside xl:sticky xl:top-[calc(var(--site-header)+var(--site-tread)+1rem)]">
        <div className="bg-ink text-snow p-6 lg:p-7">
          <p className="font-label text-[11px] uppercase tracking-[0.12em] text-orange m-0 mb-3">
            Podsumowanie
          </p>
          <h2 className="font-display text-[28px] uppercase m-0 mb-5 leading-none">
            {selectedTrip?.name || 'Wybierz wyprawę'}
          </h2>

          <ul className="m-0 p-0 list-none grid gap-3 text-[14px] opacity-90 mb-6">
            <li className="flex justify-between gap-3 border-b border-[rgba(245,241,231,0.12)] pb-3">
              <span className="opacity-60">Czas</span>
              <strong>{selectedTrip ? `${selectedTrip.durationHours} h` : '—'}</strong>
            </li>
            <li className="flex justify-between gap-3 border-b border-[rgba(245,241,231,0.12)] pb-3">
              <span className="opacity-60">Quady / pasażerowie</span>
              <strong>
                {drivers} / {passengers}
              </strong>
            </li>
            <li className="flex justify-between gap-3 border-b border-[rgba(245,241,231,0.12)] pb-3">
              <span className="opacity-60">Termin</span>
              <strong className="text-right">
                {date && time ? `${date} ${time}` : '—'}
              </strong>
            </li>
          </ul>

          {previewPrice ? (
            <div className="grid gap-2 mb-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[13px] opacity-60 uppercase tracking-[0.08em]">Razem</span>
                <span className="font-display text-[36px] leading-none">{previewPrice.total} zł</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-orange">Zaliczka teraz</span>
                <strong>{previewPrice.deposit} zł</strong>
              </div>
              <div className="flex justify-between text-[14px] opacity-80">
                <span>Na miejscu</span>
                <strong>{previewPrice.remaining} zł</strong>
              </div>
            </div>
          ) : null}

          <div className="mt-6 pt-5 border-t border-[rgba(245,241,231,0.12)] grid gap-3 text-[13px] opacity-85">
            <div className="flex gap-2 items-start">
              <ShieldCheck size={16} className="text-orange flex-none mt-0.5" />
              Bezpieczna płatność CashBill (BLIK / przelew)
            </div>
            <div className="flex gap-2 items-start">
              <HardHat size={16} className="text-orange flex-none mt-0.5" />
              Kask, briefing i przewodnik w cenie
            </div>
            <div className="flex gap-2 items-start">
              <MapPin size={16} className="text-orange flex-none mt-0.5" />
              Start: okolice Nowego Targu / Podhale
            </div>
          </div>
        </div>

        <div className="bg-paper border border-stone-line border-t-0 p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info size={16} className="text-orange" />
            <h3 className="font-label text-[12px] uppercase tracking-[0.1em] font-bold m-0">
              Warto wiedzieć
            </h3>
          </div>
          <div className="grid gap-2">
            {BOOKING_FAQ.map((item, i) => (
              <button
                key={item.q}
                type="button"
                className="text-left border border-stone-line bg-snow px-3 py-3"
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                aria-expanded={openFaq === i}
              >
                <div className="font-label text-[12px] uppercase tracking-[0.06em] font-bold">
                  {item.q}
                </div>
                {openFaq === i ? (
                  <p className="m-0 mt-2 text-[13.5px] text-[#4a4638] leading-snug">{item.a}</p>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
