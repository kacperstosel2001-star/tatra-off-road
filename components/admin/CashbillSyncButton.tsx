'use client'

import React, { useState } from 'react'
import { Button, useDocumentInfo } from '@payloadcms/ui'

type SyncResult = {
  ok: boolean
  message: string
  paid?: boolean
  cashbillStatus?: string | null
}

export function CashbillSyncButton() {
  const { id } = useDocumentInfo()
  const [loading, setLoading] = useState<'sync' | 'force' | null>(null)
  const [result, setResult] = useState<SyncResult | null>(null)

  const run = async (forcePaid: boolean) => {
    if (!id) {
      setResult({ ok: false, message: 'Najpierw zapisz rezerwację (brak ID).' })
      return
    }
    setLoading(forcePaid ? 'force' : 'sync')
    setResult(null)
    try {
      const res = await fetch(`/api/admin/bookings/${id}/sync-payment`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forcePaid }),
      })
      const data = (await res.json()) as SyncResult
      setResult({
        ok: Boolean(data.ok),
        message: data.message || (data.ok ? 'OK' : 'Błąd'),
        paid: data.paid,
        cashbillStatus: data.cashbillStatus,
      })
      if (data.ok && data.paid) {
        // Odśwież formularz, żeby widać było nowy status / gcalEventId
        window.setTimeout(() => window.location.reload(), 800)
      }
    } catch (error) {
      setResult({
        ok: false,
        message: error instanceof Error ? error.message : 'Nie udało się wywołać sync',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ marginTop: 8, marginBottom: 16 }}>
      <p style={{ marginBottom: 10, opacity: 0.8, fontSize: 13, lineHeight: 1.45 }}>
        Gdy CashBill pokazuje płatność jako opłaconą, a tu nadal „oczekująca” — dociągnij status.
        To też wrzuca rezerwację do Google Calendar i wysyła maile (jeśli jeszcze nie poszły).
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button
          type="button"
          buttonStyle="primary"
          disabled={loading !== null || !id}
          onClick={() => void run(false)}
        >
          {loading === 'sync' ? 'Synchronizuję…' : 'Dociągnij z CashBill'}
        </Button>
        <Button
          type="button"
          buttonStyle="secondary"
          disabled={loading !== null || !id}
          onClick={() => {
            if (
              window.confirm(
                'Ustawić ręcznie status „zaliczka opłacona” i wrzucić do Google Calendar? Używaj tylko gdy w CashBill na pewno jest opłacone.',
              )
            ) {
              void run(true)
            }
          }}
        >
          {loading === 'force' ? 'Zapisuję…' : 'Oznacz opłacone + GCal'}
        </Button>
      </div>
      {result ? (
        <p
          style={{
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 6,
            background: result.ok ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: result.ok ? '#047857' : '#b91c1c',
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          {result.ok ? '✓ ' : '✗ '}
          {result.message}
        </p>
      ) : null}
    </div>
  )
}

export default CashbillSyncButton
