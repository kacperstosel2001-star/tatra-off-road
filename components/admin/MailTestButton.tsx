'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@payloadcms/ui'

type TestResult = {
  ok: boolean
  message: string
  config?: {
    configured: boolean
    host: string | null
    port: number
    user: string | null
    from: string | null
    hasPassword: boolean
  }
}

export function MailTestButton() {
  const [loading, setLoading] = useState<'verify' | 'send' | null>(null)
  const [result, setResult] = useState<TestResult | null>(null)
  const [to, setTo] = useState('')
  const [status, setStatus] = useState<TestResult['config'] | null>(null)

  useEffect(() => {
    fetch('/api/admin/mail-test', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: TestResult) => {
        if (data.config) {
          setStatus(data.config)
          if (data.config.user && !to) setTo(data.config.user)
        }
      })
      .catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const run = async (action: 'verify' | 'send') => {
    setLoading(action)
    setResult(null)
    try {
      const res = await fetch('/api/admin/mail-test', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, to: action === 'send' ? to : undefined }),
      })
      const data = (await res.json()) as TestResult
      setResult({
        ok: Boolean(data.ok),
        message: data.message || (data.ok ? 'OK' : 'Błąd'),
      })
      if (data.config) setStatus(data.config)
    } catch (error) {
      setResult({
        ok: false,
        message: error instanceof Error ? error.message : 'Nie udało się wywołać testu',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ marginTop: 8, marginBottom: 16 }}>
      <p style={{ marginBottom: 10, opacity: 0.8, fontSize: 13, lineHeight: 1.45 }}>
        SMTP bierze się z Environment Variables na Hostingerze (
        <code>SMTP_HOST</code>, <code>SMTP_USER</code>, <code>SMTP_PASS</code>, <code>SMTP_FROM</code>
        ). Dla Titan: <code>smtp.titan.email</code>, port <code>465</code>.
      </p>

      {status ? (
        <p
          style={{
            marginBottom: 12,
            padding: '10px 12px',
            borderRadius: 6,
            background: status.configured ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.12)',
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          {status.configured ? (
            <>
              Konfiguracja widoczna: <strong>{status.host}</strong>:{status.port} · {status.user} ·
              from {status.from}
              {status.hasPassword ? '' : ' · brak SMTP_PASS'}
            </>
          ) : (
            <>Brak pełnej konfiguracji SMTP w env — uzupełnij zmienne i zrestartuj aplikację.</>
          )}
        </p>
      ) : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <Button
          type="button"
          buttonStyle="secondary"
          disabled={loading !== null}
          onClick={() => void run('verify')}
        >
          {loading === 'verify' ? 'Testuję…' : 'Test połączenia SMTP'}
        </Button>
      </div>

      <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
        Adres testowy (wyślemy próbkę)
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="kontakt@tatraoffroad.pl"
          style={{
            minWidth: 260,
            padding: '8px 10px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
          }}
        />
        <Button
          type="button"
          buttonStyle="primary"
          disabled={loading !== null || !to.trim()}
          onClick={() => void run('send')}
        >
          {loading === 'send' ? 'Wysyłam…' : 'Wyślij testowy e-mail'}
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

export default MailTestButton
