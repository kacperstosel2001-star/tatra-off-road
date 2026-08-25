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

  const people = drivers + passengers
  const deposit = Number(booking.depositAmount || 0)
  const remaining = Number(booking.remainingAmount || Math.max(0, Number(booking.fullPrice || 0) - deposit))
  const peopleWord =
    people === 1 ? 'osoba' : people >= 2 && people <= 4 ? 'osoby' : people > 4 ? 'osób' : ''
  const quadWord = drivers === 1 ? 'quad' : 'quady'
  const details = [
    `${drivers} ${quadWord}`,
    people > 0 && peopleWord ? `${people} ${peopleWord}` : null,
    deposit > 0 ? `${deposit} zadatku` : null,
    remaining > 0 ? `${remaining} dopłaty` : null,
  ]
    .filter(Boolean)
    .join(' ')

  const summary = [
    'REZERWACJA QUAD',
    date,
    `${startTime}-${endTime}`,
    details || `${drivers} ${quadWord}`,
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
    '',
    'Ważne:',
    '- Klient ma być 15 minut wcześniej',
    '- Kierowca: prawo jazdy kat. B',
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

export type ParsedGcalEvent = {
  id: string
  summary: string
  description: string
  cancelled: boolean
  allDay: boolean
  /** Czy importować do panelu (start tego dnia / całodniowe). Busy intervals biorą wszystkie. */
  importable: boolean
  date: string
  startMin: number
  endMin: number
  startTime: string
  endTime: string
  drivers: number
  passengers: number
  depositAmount?: number
  remainingAmount?: number
  bookingId?: string
  customerName?: string
  phone?: string
}

type CalendarEvent = {
  id?: string
  summary?: string
  description?: string
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

function minutesToHhMm(minutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, minutes))
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  if (h >= 24) return '23:59'
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Format tytułu (Wasze ręczne wpisy i nowe z systemu):
 * REZERWACJA QUAD | 2026-08-23 | 09:00-10:00 | 1 quad 2 osoby 50 zadatku 250 dopłaty | Joanna Skaletz
 */
function parseSummaryDetails(
  summary: string,
  totalQuads: number,
  privateProps: Record<string, string>,
): {
  drivers: number
  passengers: number
  depositAmount?: number
  remainingAmount?: number
  customerName?: string
  phone?: string
} {
  const fromPropsDrivers = Number(privateProps.quad_quads || 0)
  const fromPropsPassengers = Number(privateProps.quad_passengers || 0)
  const phone = privateProps.quad_phone || undefined

  const parts = summary.split('|').map((p) => p.trim()).filter(Boolean)
  const detailsPart =
    parts.find((p) => /\d+\s*quad/i.test(p)) ||
    parts[3] ||
    summary

  let drivers = fromPropsDrivers > 0 ? fromPropsDrivers : 0
  if (!drivers) {
    const quadMatch = detailsPart.match(/(\d+)\s*quad/i)
    if (quadMatch) drivers = Number(quadMatch[1])
  }
  if (!drivers) drivers = totalQuads
  drivers = Math.min(totalQuads, Math.max(1, drivers))

  let passengers = fromPropsPassengers > 0 ? fromPropsPassengers : 0
  if (!passengers) {
    // „2 osoby” = łącznie osób na wyprawie → pasażerowie = osoby − quady
    const peopleMatch = detailsPart.match(/(\d+)\s*osob/i)
    if (peopleMatch) {
      const people = Number(peopleMatch[1])
      passengers = Math.max(0, people - drivers)
    }
  }

  const depositMatch = detailsPart.match(/(\d+(?:[.,]\d+)?)\s*zadat/i)
  const remainingMatch = detailsPart.match(/(\d+(?:[.,]\d+)?)\s*dopłat/i)
  const depositAmount = depositMatch
    ? Number(String(depositMatch[1]).replace(',', '.'))
    : undefined
  const remainingAmount = remainingMatch
    ? Number(String(remainingMatch[1]).replace(',', '.'))
    : undefined

  let customerName: string | undefined
  if (parts.length >= 5) {
    const name = parts[parts.length - 1]
    if (
      name &&
      !/^\d+\s*quad/i.test(name) &&
      !/^\d{4}-\d{2}-\d{2}$/.test(name) &&
      !/^\d{1,2}:\d{2}/.test(name)
    ) {
      customerName = name
    }
  }

  return {
    drivers,
    passengers,
    depositAmount,
    remainingAmount,
    customerName,
    phone,
  }
}

function parseEventForDate(
  event: CalendarEvent,
  date: string,
  totalQuads: number,
): ParsedGcalEvent | null {
  if (!event.id) return null
  const cancelled = event.status === 'cancelled'
  const privateProps = event.extendedProperties?.private || {}
  const bookingId = privateProps.quad_booking_id || undefined
  const summary = String(event.summary || '')
  const description = String(event.description || '')
  const parsed = parseSummaryDetails(summary, totalQuads, privateProps)
  const drivers = parsed.drivers
  const passengers = parsed.passengers
  const phone = parsed.phone
  const customerName = parsed.customerName

  // Całodniowe
  if (event.start?.date && event.end?.date) {
    if (!(event.start.date <= date && event.end.date > date)) return null
    return {
      id: event.id,
      summary,
      description,
      cancelled,
      allDay: true,
      importable: event.start.date === date,
      date,
      startMin: 0,
      endMin: 24 * 60,
      startTime: '08:00',
      endTime: '20:00',
      drivers,
      passengers,
      depositAmount: parsed.depositAmount,
      remainingAmount: parsed.remainingAmount,
      bookingId,
      customerName,
      phone,
    }
  }

  if (!event.start?.dateTime || !event.end?.dateTime) return null

  const startAt = new Date(event.start.dateTime)
  const endAt = new Date(event.end.dateTime)
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) return null

  const startLocal = formatInWarsaw(startAt)
  const endLocal = formatInWarsaw(endAt)

  let startMin = 0
  let endMin = 24 * 60

  if (startLocal.date === date) startMin = startLocal.minutes
  else if (startLocal.date > date) return null

  if (endLocal.date === date) endMin = endLocal.minutes
  else if (endLocal.date < date) return null

  if (endMin <= startMin) return null

  return {
    id: event.id,
    summary,
    description,
    cancelled,
    allDay: false,
    importable: startLocal.date === date,
    date: startLocal.date === date ? date : startLocal.date,
    startMin,
    endMin,
    startTime: minutesToHhMm(startLocal.date === date ? startMin : 8 * 60),
    endTime: minutesToHhMm(Math.min(endMin, 24 * 60 - 1)),
    drivers,
    passengers,
    depositAmount: parsed.depositAmount,
    remainingAmount: parsed.remainingAmount,
    bookingId,
    customerName,
    phone,
  }
}

async function fetchCalendarEventsInRange(
  timeMin: string,
  timeMax: string,
): Promise<{ configured: boolean; ok: boolean; items: CalendarEvent[] }> {
  const cfg = await getGcalConfig()
  if (!cfg) return { configured: false, ok: false, items: [] }

  const token = await getAccessToken(cfg.credentials)
  if (!token) return { configured: true, ok: false, items: [] }

  const items: CalendarEvent[] = []
  let pageToken = ''

  do {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    })
    if (pageToken) params.set('pageToken', pageToken)

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cfg.calendarId)}/events?${params}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    const data = (await res.json()) as {
      items?: CalendarEvent[]
      nextPageToken?: string
      error?: { message?: string }
    }

    if (!res.ok) {
      console.error('GCal list events failed', res.status, data)
      return { configured: true, ok: false, items: [] }
    }

    items.push(...(data.items || []))
    pageToken = data.nextPageToken || ''
  } while (pageToken)

  return { configured: true, ok: true, items }
}

async function fetchCalendarEvents(date: string): Promise<{
  configured: boolean
  ok: boolean
  items: CalendarEvent[]
}> {
  const paddedMin = new Date(`${date}T00:00:00Z`)
  paddedMin.setUTCHours(paddedMin.getUTCHours() - 14)
  const paddedMax = new Date(`${date}T00:00:00Z`)
  paddedMax.setUTCHours(paddedMax.getUTCHours() + 38)
  return fetchCalendarEventsInRange(paddedMin.toISOString(), paddedMax.toISOString())
}

/**
 * Wszystkie wydarzenia w zakresie dat (do masowej synchronizacji panelu).
 */
export async function listGoogleCalendarEventsInRange(
  fromDate: string,
  toDate: string,
  totalQuads: number,
): Promise<{ configured: boolean; ok: boolean; events: ParsedGcalEvent[] }> {
  const paddedMin = new Date(`${fromDate}T00:00:00Z`)
  paddedMin.setUTCHours(paddedMin.getUTCHours() - 14)
  const paddedMax = new Date(`${toDate}T00:00:00Z`)
  paddedMax.setUTCHours(paddedMax.getUTCHours() + 38)

  const fetched = await fetchCalendarEventsInRange(paddedMin.toISOString(), paddedMax.toISOString())
  if (!fetched.ok) return { configured: fetched.configured, ok: false, events: [] }

  const events: ParsedGcalEvent[] = []
  const seen = new Set<string>()

  // Iteruj każdy dzień zakresu tylko po stronie parsowania startów
  const start = new Date(`${fromDate}T12:00:00Z`)
  const end = new Date(`${toDate}T12:00:00Z`)
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10)
    for (const item of fetched.items) {
      const parsed = parseEventForDate(item, date, totalQuads)
      if (!parsed || parsed.cancelled || !parsed.importable) continue
      if (seen.has(parsed.id)) continue
      seen.add(parsed.id)
      events.push(parsed)
    }
  }

  return { configured: true, ok: true, events }
}

/**
 * Wydarzenia z Google Calendar na dany dzień (Europe/Warsaw) — do zajętości i importu do panelu.
 */
export async function listGoogleCalendarDayEvents(
  date: string,
  totalQuads: number,
): Promise<{ configured: boolean; ok: boolean; events: ParsedGcalEvent[] }> {
  const fetched = await fetchCalendarEvents(date)
  if (!fetched.ok) return { configured: fetched.configured, ok: false, events: [] }

  const events: ParsedGcalEvent[] = []
  for (const item of fetched.items) {
    const parsed = parseEventForDate(item, date, totalQuads)
    if (!parsed || parsed.cancelled) continue
    events.push(parsed)
  }

  return { configured: true, ok: true, events }
}

/**
 * Zajętość z Google Calendar na dany dzień (Europe/Warsaw).
 * Gdy `ok: true`, kalendarz jest źródłem prawdy dla opłaconych rezerwacji.
 */
export async function listGoogleCalendarBusyIntervals(
  date: string,
  totalQuads: number,
): Promise<{ configured: boolean; ok: boolean; intervals: GcalBusyInterval[] }> {
  const listed = await listGoogleCalendarDayEvents(date, totalQuads)
  if (!listed.ok) return { configured: listed.configured, ok: false, intervals: [] }

  const intervals: GcalBusyInterval[] = listed.events.map((event) => ({
    start: event.startMin,
    end: event.endMin,
    drivers: event.drivers,
    bookingId: event.bookingId,
    source: 'gcal' as const,
  }))

  return { configured: listed.configured, ok: true, intervals }
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
