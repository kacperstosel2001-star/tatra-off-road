import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

export type MailMessage = {
  to: string
  subject: string
  text: string
  html: string
  replyTo?: string
  bcc?: string
}

function env(name: string): string {
  return String(process.env[name] || '').trim()
}

export function getMailConfigSummary() {
  const host = env('SMTP_HOST')
  const user = env('SMTP_USER')
  const from = env('SMTP_FROM') || user
  const port = Number(env('SMTP_PORT') || '465')
  const secure = env('SMTP_SECURE') ? env('SMTP_SECURE') !== 'false' : port === 465
  return {
    configured: Boolean(host && user && env('SMTP_PASS') && from),
    host: host || null,
    port,
    secure,
    user: user || null,
    from: from || null,
    replyTo: env('SMTP_REPLY_TO') || null,
    hasPassword: Boolean(env('SMTP_PASS')),
  }
}

export function isMailConfigured(): boolean {
  return getMailConfigSummary().configured
}

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (!isMailConfigured()) return null
  if (transporter) return transporter

  const { host, port, secure, user } = getMailConfigSummary()
  transporter = nodemailer.createTransport({
    host: host!,
    port,
    secure,
    auth: {
      user: user!,
      pass: env('SMTP_PASS'),
    },
  })
  return transporter
}

/** Reset cached transporter after env changes / failed auth. */
export function resetMailTransporter() {
  transporter = null
}

export async function verifyMailConnection(): Promise<{ ok: boolean; message: string }> {
  const summary = getMailConfigSummary()
  if (!summary.configured) {
    return {
      ok: false,
      message:
        'Brak SMTP w Environment Variables. Ustaw SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM (dla Titan: smtp.titan.email, port 465).',
    }
  }

  resetMailTransporter()
  const tx = getTransporter()
  if (!tx) {
    return { ok: false, message: 'Nie udało się utworzyć połączenia SMTP.' }
  }

  try {
    await tx.verify()
    return {
      ok: true,
      message: `Połączenie OK → ${summary.host}:${summary.port} jako ${summary.user} (from: ${summary.from}).`,
    }
  } catch (error) {
    resetMailTransporter()
    const msg = error instanceof Error ? error.message : String(error)
    return { ok: false, message: `Błąd SMTP: ${msg}` }
  }
}

export async function sendMail(message: MailMessage): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const tx = getTransporter()
  if (!tx) {
    console.warn('Mail skipped: SMTP_* env vars not configured')
    return { ok: false, skipped: true, error: 'SMTP not configured' }
  }

  const from = env('SMTP_FROM') || env('SMTP_USER')
  try {
    await tx.sendMail({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo || env('SMTP_REPLY_TO') || undefined,
      bcc: message.bcc || env('SMTP_BCC') || undefined,
    })
    return { ok: true }
  } catch (error) {
    resetMailTransporter()
    const msg = error instanceof Error ? error.message : String(error)
    console.error('sendMail failed', msg)
    return { ok: false, error: msg }
  }
}

export async function sendTestMail(to: string): Promise<{ ok: boolean; message: string }> {
  const target = String(to || '').trim()
  if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
    return { ok: false, message: 'Podaj prawidłowy adres e-mail do testu.' }
  }

  const verify = await verifyMailConnection()
  if (!verify.ok) return verify

  const summary = getMailConfigSummary()
  const result = await sendMail({
    to: target,
    subject: 'Test SMTP — Tatra Off-Road',
    text: [
      'To jest testowy e-mail z panelu Tatra Off-Road.',
      '',
      `SMTP: ${summary.host}:${summary.port}`,
      `From: ${summary.from}`,
      `Czas: ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}`,
      '',
      'Jeśli go widzisz — wysyłka potwierdzeń rezerwacji powinna działać.',
    ].join('\n'),
    html: `
      <p>To jest <strong>testowy e-mail</strong> z panelu Tatra Off-Road.</p>
      <p>SMTP: <code>${summary.host}:${summary.port}</code><br/>From: <code>${summary.from}</code></p>
      <p>Jeśli go widzisz — wysyłka potwierdzeń rezerwacji powinna działać.</p>
    `,
  })

  if (result.ok) {
    return { ok: true, message: `Wysłano test na ${target}. Sprawdź skrzynkę (i spam).` }
  }
  return {
    ok: false,
    message: result.skipped
      ? 'SMTP nie jest skonfigurowane.'
      : `Nie wysłano: ${result.error || 'nieznany błąd'}`,
  }
}
