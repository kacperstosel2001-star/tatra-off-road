import { createSign } from 'crypto'
import { getPayloadClient } from '@/lib/booking'
import type { Booking, Trip } from '@/payload-types'

type ServiceAccount = {
  client_email: string
  private_key: string
}

type GcalConfig = {
  calendarId: string
  credentials: ServiceAccount
}

let cachedToken: { value: string; expiresAt: number } | null = null

function base64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function normalizeCalendarId(raw: string): string {
  const id = raw.trim()
  if (!id) return ''
  // Często wklejany jest sam hash bez domeny — wtedy Google zwraca 404
  if (!id.includes('@') && /^[a-f0-9]{16,}$/i.test(id)) {
    return `${id}@group.calendar.google.com`
  }
  return id
}

function normalizeServiceAccount(credentials: ServiceAccount): ServiceAccount {
  let privateKey = String(credentials.private_key || '')
  // Po wklejeniu do textarea `\n` bywa literałem zamiast prawdziwej nowej linii
  if (privateKey.includes('\\n') && !privateKey.includes('\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n')
  }
  return {
    ...credentials,
    private_key: privateKey,
  }
}

async function getGcalConfig(): Promise<GcalConfig | null> {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({
    slug: 'booking-settings',
    overrideAccess: true,
  })

  const calendarId = normalizeCalendarId(
    String(settings.gcalCalendarId || process.env.GCAL_CALENDAR_ID || ''),
  )
  const jsonRaw = String(
    settings.gcalServiceAccountJson || process.env.GCAL_SERVICE_ACCOUNT_JSON || '',
  ).trim()

  if (!calendarId || !jsonRaw) return null

  try {
    const parsed = JSON.parse(jsonRaw) as ServiceAccount
    const credentials = normalizeServiceAccount(parsed)
    if (!credentials.client_email || !credentials.private_key) return null
    return { calendarId, credentials }
  } catch {
    console.error('GCal: nieprawidłowy JSON konta serwisowego')
    return null
  }
}

async function getAccessToken(credentials: ServiceAccount): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value
  }

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  signer.end()
  const signature = signer.sign(credentials.private_key)
  const jwt = `${unsigned}.${base64url(signature)}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const data = (await res.json()) as { access_token?: string; expires_in?: number; error?: string }
  if (!res.ok || !data.access_token) {
    console.error('GCal token error', data)
    return null
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in || 3600) - 60) * 1000,
  }
  return data.access_token
}

function normalizeDate(value: string): string {
  return String(value).slice(0, 10)
}

function normalizeTime(value: string): string {
  return String(value).slice(0, 5)
}

function buildEventBody(booking: Booking) {
  const date = normalizeDate(String(booking.bookingDate))
  const startTime = normalizeTime(String(booking.bookingTime))
  const endTime = normalizeTime(
    String(
      booking.reservationEndTime ||
        (() => {
          const start = Number(startTime.slice(0, 2)) * 60 + Number(startTime.slice(3, 5))
          const end = start + Math.round(Number(booking.durationHours || 1) * 60)
          const hh = String(Math.floor(end / 60)).padStart(2, '0')
          const mm = String(end % 60).padStart(2, '0')
          return `${hh}:${mm}`
        })(),
    ),
  )

  const tripName =
    booking.trip && typeof booking.trip === 'object'
      ? String((booking.trip as Trip).name)
      : 'Wyprawa quadowa'

  const drivers = Number(booking.drivers || 1)
  const passengers = Number(booking.passengers || 0)
  const firstName = String(booking.customerFirstName || '').trim()
  const lastName = String(booking.customerLastName || '').trim()
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || '—'
  const phone = String(booking.customerPhone || '—')
  const email = String(booking.customerEmail || '—')
  const notes = String(booking.customerNotes || '—')
  const source =
    booking.source === 'manual_admin'
      ? 'Rezerwacja administracyjna'
      : booking.source === 'phone'
        ? 'Telefon'
        : 'Rezerwacja online'

  const summary = [
    'REZERWACJA QUAD',
    date,
    `${startTime}-${endTime}`,
    `${drivers} quady`,
    fullName !== '—' ? fullName : null,
  ]
    .filter(Boolean)
    .join(' | ')

  const description = [
    `Typ: ${source}`,
    `Wyprawa: ${tripName}`,
    `Data: ${date}`,
    `Godzina startu: ${startTime}`,
    `Godzina zakończenia: ${endTime}`,
    `Liczba kierowców (quady): ${drivers}`,
    `Liczba pasażerów: ${passengers}`,
    `Klient: ${fullName}`,
    `Telefon: ${phone}`,
    `E-mail: ${email}`,
    `Uwagi: ${notes}`,
    `ID rezerwacji: ${booking.id}`,
    `Status płatności: ${booking.paymentStatus || booking.status}`,
  ].join('\n')

  return {
    summary,
    description,
    start: {
      dateTime: `${date}T${startTime}:00`,
      timeZone: 'Europe/Warsaw',
    },
    end: {
      dateTime: `${date}T${endTime}:00`,
      timeZone: 'Europe/Warsaw',
    },
    extendedProperties: {
      private: {
        quad_booking_id: String(booking.id),
        quad_source: String(booking.source || 'website'),
        quad_quads: String(drivers),
        quad_passengers: String(passengers),
        quad_phone: phone,
      },
    },
  }
}

export type GcalBusyInterval = {
  start: number
  end: number
  drivers: number
  bookingId?: string
  source: 'gcal'
}

type CalendarEvent = {
  id?: string
  summary?: string
  status?: string
  start?: { dateTime?: string; date?: string; timeZone?: string }
  end?: { dateTime?: string; date?: string; timeZone?: string }
  extendedProperties?: {
    private?: Record<string, string>
  }
}

function formatInWarsaw(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type: string) => parts.find((p) => p.type === type)?.value || ''
  const hour = get('hour') === '24' ? '00' : get('hour')
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(hour) * 60 + Number(get('minute')),
  }
}

function parseDriversFromEvent(event: CalendarEvent, totalQuads: number): number {
  const fromProps = Number(event.extendedProperties?.private?.quad_quads || 0)
  if (fromProps > 0) return Math.min(totalQuads, fromProps)

  const summary = String(event.summary || '')
  const match = summary.match(/(\d+)\s*quad/i)
  if (match) return Math.min(totalQuads, Math.max(1, Number(match[1])))

  // Ręczne wydarzenia w kalendarzu = pełna blokada puli
  return totalQuads
}

/**
 * Zajętość z Google Calendar na dany dzień (Europe/Warsaw).
 * Gdy `ok: true`, kalendarz jest źródłem prawdy dla opłaconych rezerwacji.
 */
export async function listGoogleCalendarBusyIntervals(
  date: string,
  totalQuads: number,
): Promise<{ configured: boolean; ok: boolean; intervals: GcalBusyInterval[] }> {
  const cfg = await getGcalConfig()
  if (!cfg) return { configured: false, ok: false, intervals: [] }

  const token = await getAccessToken(cfg.credentials)
  if (!token) return { configured: true, ok: false, intervals: [] }

  // Szeroki zakres UTC + filtr lokalnej daty Europe/Warsaw (obsługa DST)
  const paddedMin = new Date(`${date}T00:00:00Z`)
  paddedMin.setUTCHours(paddedMin.getUTCHours() - 14)
  const paddedMax = new Date(`${date}T00:00:00Z`)
  paddedMax.setUTCHours(paddedMax.getUTCHours() + 38)

  const params = new URLSearchParams({
    timeMin: paddedMin.toISOString(),
    timeMax: paddedMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cfg.calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )

  const data = (await res.json()) as {
    items?: CalendarEvent[]
    error?: { message?: string }
  }

  if (!res.ok) {
    console.error('GCal list events failed', res.status, data)
    return { configured: true, ok: false, intervals: [] }
  }

  const intervals: GcalBusyInterval[] = []
  for (const event of data.items || []) {
    if (event.status === 'cancelled') continue

    const privateProps = event.extendedProperties?.private || {}
    const bookingId = privateProps.quad_booking_id || undefined
    const drivers = parseDriversFromEvent(event, totalQuads)

    // Całodniowe
    if (event.start?.date && event.end?.date) {
      if (event.start.date <= date && event.end.date > date) {
        intervals.push({ start: 0, end: 24 * 60, drivers, bookingId, source: 'gcal' })
      }
      continue
    }

    if (!event.start?.dateTime || !event.end?.dateTime) continue

    const startAt = new Date(event.start.dateTime)
    const endAt = new Date(event.end.dateTime)
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) continue

    const startLocal = formatInWarsaw(startAt)
    const endLocal = formatInWarsaw(endAt)

    let startMin = 0
    let endMin = 24 * 60

    if (startLocal.date === date) startMin = startLocal.minutes
    else if (startLocal.date > date) continue
    // start wcześniej niż ten dzień → od 00:00

    if (endLocal.date === date) endMin = endLocal.minutes
    else if (endLocal.date < date) continue
    // end później niż ten dzień → do 24:00

    if (endMin <= startMin) continue

    intervals.push({
      start: startMin,
      end: endMin,
      drivers,
      bookingId,
      source: 'gcal',
    })
  }

  return { configured: true, ok: true, intervals }
}

export async function upsertBookingGoogleEvent(booking: Booking): Promise<string> {
  const cfg = await getGcalConfig()
  if (!cfg) {
    console.warn('GCal: brak calendarId lub JSON — pomijam synchronizację')
    return ''
  }

  const token = await getAccessToken(cfg.credentials)
  if (!token) return ''

  const body = buildEventBody(booking)
  const existingId = String(booking.gcalEventId || '').trim()
  const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cfg.calendarId)}/events`
  const url = existingId ? `${base}/${encodeURIComponent(existingId)}` : base

  const res = await fetch(url, {
    method: existingId ? 'PUT' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as { id?: string; error?: { message?: string } }
  if (!res.ok || !data.id) {
    console.error('GCal upsert failed', res.status, data)
    return ''
  }
  return data.id
}

export async function testGoogleCalendarConnection(): Promise<{ ok: boolean; message: string }> {
  const cfg = await getGcalConfig()
  if (!cfg) {
    return {
      ok: false,
      message: 'Uzupełnij Calendar ID i JSON konta serwisowego w ustawieniach rezerwacji.',
    }
  }

  const token = await getAccessToken(cfg.credentials)
  if (!token) {
    return {
      ok: false,
      message:
        'Nie udało się pobrać tokenu Google. Sprawdź JSON (client_email/private_key) i czy Calendar API jest włączone.',
    }
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cfg.calendarId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const data = (await res.json()) as { summary?: string; id?: string; error?: { message?: string } }

  if (res.ok && data.id) {
    return {
      ok: true,
      message: `Połączenie działa. Kalendarz: "${data.summary || data.id}".`,
    }
  }

  if (res.status === 404) {
    return {
      ok: false,
      message: `Kalendarz nie znaleziony. Udostępnij go na ${cfg.credentials.client_email} z prawem edycji.`,
    }
  }

  return {
    ok: false,
    message: data.error?.message || `Błąd Google (HTTP ${res.status}).`,
  }
}
