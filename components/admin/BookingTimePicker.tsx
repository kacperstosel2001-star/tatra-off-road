'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldLabel, TextInput, useField, useForm, useFormFields } from '@payloadcms/ui'

type MetaResponse = {
  ok: boolean
  slots: string[]
  durationHours: number
  tripName?: string | null
  message?: string
}

function normalizeTime(value: unknown): string {
  const raw = String(value || '').trim()
  const match = /^(\d{1,2}):(\d{2})$/.exec(raw)
  if (!match) return ''
  const h = Math.min(23, Math.max(0, Number(match[1])))
  const m = Math.min(59, Math.max(0, Number(match[2])))
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function tripIdFromValue(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return String(value)
}

export function BookingTimePicker(props: { path: string; field?: { label?: string; required?: boolean } }) {
  const { path, field } = props
  const { value, setValue } = useField<string>({ path })
  const { dispatchFields } = useForm()

  const entryKind = useFormFields(([fields]) => fields.entryKind?.value as string | undefined)
  const tripValue = useFormFields(([fields]) => fields.trip?.value)
  const endTimeValue = useFormFields(([fields]) => fields.reservationEndTime?.value as string | undefined)

  const tripId = useMemo(() => tripIdFromValue(tripValue), [tripValue])
  const isBlock = entryKind === 'block'

  const [meta, setMeta] = useState<MetaResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const applySchedule = useCallback(
    async (startTime: string, selectedTripId: string) => {
      const normalized = normalizeTime(startTime)
      if (!normalized) return

      setValue(normalized)

      if (isBlock) return

      try {
        const res = await fetch('/api/admin/booking-form-meta', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startTime: normalized, tripId: selectedTripId || undefined }),
        })
        const data = await res.json()
        if (!data.ok) return

        dispatchFields({ type: 'UPDATE', path: 'reservationEndTime', value: data.endTime })
        dispatchFields({ type: 'UPDATE', path: 'durationHours', value: data.durationHours })
      } catch {
        /* ignore */
      }
    },
    [dispatchFields, isBlock, setValue],
  )

  useEffect(() => {
    if (isBlock) return

    let cancelled = false
    setLoading(true)
    const query = tripId ? `?tripId=${encodeURIComponent(tripId)}` : ''
    fetch(`/api/admin/booking-form-meta${query}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: MetaResponse) => {
        if (!cancelled) setMeta(data.ok ? data : null)
      })
      .catch(() => {
        if (!cancelled) setMeta(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isBlock, tripId])

  useEffect(() => {
    if (isBlock || !tripId || !value) return
    void applySchedule(String(value), tripId)
  }, [tripId, isBlock]) // eslint-disable-line react-hooks/exhaustive-deps -- recalc end when trip changes

  const selected = normalizeTime(value)
  const slots = meta?.slots || []
  const duration = meta?.durationHours || 1

  if (isBlock) {
    return (
      <div>
        <FieldLabel label={field?.label || 'Godzina startu'} required={field?.required} />
        <TextInput
          path={path}
          value={String(value || '')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        />
        <p style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
          Przy blokadzie wpisz godzinę ręcznie (format HH:MM).
        </p>
      </div>
    )
  }

  return (
    <div>
      <FieldLabel label={field?.label || 'Godzina startu'} required={field?.required} />
      {!tripId ? (
        <p style={{ margin: '0 0 10px', fontSize: 13, color: '#b45309' }}>
          Najpierw wybierz wyprawę — godzina końca ustawi się automatycznie.
        </p>
      ) : (
        <p style={{ margin: '0 0 10px', fontSize: 13, opacity: 0.8 }}>
          Wyprawa: <strong>{meta?.tripName || '…'}</strong> · {duration} h
          {selected && endTimeValue ? (
            <>
              {' '}
              · koniec: <strong>{String(endTimeValue).slice(0, 5)}</strong>
            </>
          ) : null}
        </p>
      )}

      {loading ? (
        <p style={{ fontSize: 13, opacity: 0.7 }}>Ładuję godziny…</p>
      ) : slots.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {slots.map((slot) => {
            const active = selected === slot
            return (
              <button
                key={slot}
                type="button"
                onClick={() => void applySchedule(slot, tripId)}
                style={{
                  minWidth: 72,
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: active ? '2px solid var(--theme-success-500, #059669)' : '1px solid var(--theme-elevation-150)',
                  background: active ? 'rgba(16, 185, 129, 0.12)' : 'var(--theme-input-bg)',
                  color: 'var(--theme-text)',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: 15,
                }}
              >
                {slot}
              </button>
            )
          })}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: '#b91c1c' }}>
          Brak slotów — sprawdź godziny otwarcia w ustawieniach rezerwacji.
        </p>
      )}

      {selected ? (
        <p style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
          Wybrany start: <code>{selected}</code>
          {endTimeValue ? (
            <>
              {' '}
              → koniec: <code>{String(endTimeValue).slice(0, 5)}</code>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}

export default BookingTimePicker
