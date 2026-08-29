'use client'

import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'

type TestResult = {
  ok: boolean
  message: string
}

export function GcalTestButton() {
  const [loadingTest, setLoadingTest] = useState(false)
  const [loadingSync, setLoadingSync] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const onTest = async () => {
    setLoadingTest(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/gcal-test', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = (await res.json()) as TestResult
      setResult({
        ok: Boolean(data.ok),
        message: data.message || (data.ok ? 'OK' : 'Błąd połączenia'),
      })
    } catch (error) {
      setResult({
        ok: false,
        message: error instanceof Error ? error.message : 'Nie udało się wywołać testu',
      })
    } finally {
      setLoadingTest(false)
    }
  }

  const onSync = async () => {
    setLoadingSync(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/gcal-sync', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysBack: 30, daysForward: 90 }),
      })
      const data = (await res.json()) as TestResult
      setResult({
        ok: Boolean(data.ok),
        message: data.message || (data.ok ? 'Synchronizacja OK' : 'Błąd synchronizacji'),
      })
    } catch (error) {
      setResult({
        ok: false,
        message: error instanceof Error ? error.message : 'Nie udało się wywołać synchronizacji',
      })
    } finally {
      setLoadingSync(false)
    }
  }

  const busy = loadingTest || loadingSync

  return (
    <div style={{ marginTop: 8, marginBottom: 16 }}>
      <p style={{ marginBottom: 10, opacity: 0.8, fontSize: 13 }}>
        Zapisz ustawienia (Calendar ID + JSON), przetestuj połączenie, potem zsynchronizuj
        wydarzenia z Google do listy Rezerwacje. Usunięcie w kalendarzu usuwa też wpis w panelu
        (przy sprawdzaniu terminów lub po kliknięciu synchronizacji).
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button type="button" buttonStyle="secondary" disabled={busy} onClick={onTest}>
          {loadingTest ? 'Testuję…' : 'Test połączenia'}
        </Button>
        <Button type="button" buttonStyle="primary" disabled={busy} onClick={onSync}>
          {loadingSync ? 'Synchronizuję…' : 'Synchronizuj z Google Calendar'}
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

export default GcalTestButton
