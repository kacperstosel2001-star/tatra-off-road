'use client'

import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'

type TestResult = {
  ok: boolean
  message: string
}

export function GcalTestButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const onTest = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 8, marginBottom: 16 }}>
      <p style={{ marginBottom: 10, opacity: 0.8, fontSize: 13 }}>
        Zapisz ustawienia (Calendar ID + JSON), potem sprawdź połączenie. Konto serwisowe musi mieć
        dostęp do kalendarza.
      </p>
      <Button type="button" buttonStyle="secondary" disabled={loading} onClick={onTest}>
        {loading ? 'Testuję…' : 'Test połączenia z Google Calendar'}
      </Button>
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
