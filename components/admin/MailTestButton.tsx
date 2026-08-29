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
  adminNotificationEmail?: string | null
}

export function MailTestButton() {
  const [loading, setLoading] = useState<'verify' | 'customer' | 'admin' | null>(null)
  const [result, setResult] = useState<TestResult | null>(null)
  const [customerTo, setCustomerTo] = useState('')
  const [adminTo, setAdminTo] = useState('')
  const [status, setStatus] = useState<TestResult['config'] | null>(null)

  useEffect(() => {
    fetch('/api/admin/mail-test', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: TestResult) => {
        if (data.config) {
          setStatus(data.config)
          if (data.config.user && !customerTo) setCustomerTo(data.config.user)
        }
        if (data.adminNotificationEmail && !adminTo) {
          setAdminTo(data.adminNotificationEmail)
        }
      })
      .catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const run = async (action: 'verify' | 'customer' | 'admin') => {
    setLoading(action)
    setResult(null)
    try {
      const actionMap = {
        verify: 'verify',
        customer: 'send_customer',
        admin: 'send_admin',
      } as const

      const res = await fetch('/api/admin/mail-test', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionMap[action],
          to: action === 'customer' ? customerTo : action === 'admin' ? adminTo : undefined,
        }),
      })
      const data = (await res.json()) as TestResult
      setResult({
        ok: Boolean(data.ok),
        message: data.message || (data.ok ? 'OK' : 'Błąd'),
      })
      if (data.config) setStatus(data.config)
      if (data.adminNotificationEmail) setAdminTo((prev) => prev || data.adminNotificationEmail || '')
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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <Button
          type="button"
          buttonStyle="secondary"
          disabled={loading !== null}
          onClick={() => void run('verify')}
        >
          {loading === 'verify' ? 'Testuję…' : 'Test połączenia SMTP'}
        </Button>
      </div>

      <div
        style={{
          marginBottom: 20,
          padding: '14px 16px',
          borderRadius: 8,
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-elevation-50)',
        }}
      >
        <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700 }}>Test maila do klienta</p>
        <p style={{ margin: '0 0 10px', opacity: 0.8, fontSize: 13, lineHeight: 1.45 }}>
          Wysyła przykładowe potwierdzenie rezerwacji (takie jak po opłaceniu zaliczki).
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <input
            type="email"
            value={customerTo}
            onChange={(e) => setCustomerTo(e.target.value)}
            placeholder="adres klienta do testu"
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
            disabled={loading !== null || !customerTo.trim()}
            onClick={() => void run('customer')}
          >
            {loading === 'customer' ? 'Wysyłam…' : 'Wyślij test klienta'}
          </Button>
        </div>
      </div>

      <div
        style={{
          padding: '14px 16px',
          borderRadius: 8,
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-elevation-50)',
        }}
      >
        <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700 }}>Test powiadomienia admina</p>
        <p style={{ margin: '0 0 10px', opacity: 0.8, fontSize: 13, lineHeight: 1.45 }}>
          Wysyła przykładowe powiadomienie o rezerwacji na adres z pola „E-mail powiadomień admina”
          (zapisz ustawienia przed testem).
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <input
            type="email"
            value={adminTo}
            onChange={(e) => setAdminTo(e.target.value)}
            placeholder="adres admina z panelu"
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
            disabled={loading !== null || !adminTo.trim()}
            onClick={() => void run('admin')}
          >
            {loading === 'admin' ? 'Wysyłam…' : 'Wyślij test admina'}
          </Button>
        </div>
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
