import { getPayloadClient, getBookingSettings, calculateDurationHoursFromRange } from '@/lib/booking'
import {
  listGoogleCalendarDayEvents,
  listGoogleCalendarEventsInRange,
  type ParsedGcalEvent,
} from '@/lib/gcal/client'

export async function upsertGcalParsedEvent(event: ParsedGcalEvent, totalQuads: number) {
  if (!event.id || event.cancelled || !event.importable) return { action: 'skipped' as const }

  const payload = await getPayloadClient()

  // Już powiązane z rezerwacją z systemu — nie twórz duplikatu
  if (event.bookingId) {
    try {
      const existing = await payload.findByID({
        collection: 'bookings',
        id: event.bookingId,
        overrideAccess: true,
      })
      if (existing) {
        if (!existing.gcalEventId) {
          await payload.update({
            collection: 'bookings',
            id: existing.id,
            data: { gcalEventId: event.id },
            overrideAccess: true,
          })
          return { action: 'linked' as const }
        }
        return { action: 'exists' as const }
      }
    } catch {
      /* booking id z props może być nieaktualny */
    }
  }

  const byEvent = await payload.find({
    collection: 'bookings',
    where: { gcalEventId: { equals: event.id } },
    limit: 1,
    overrideAccess: true,
  })

  const startTime = event.startTime
  const endTime = event.endTime
  const duration =
    calculateDurationHoursFromRange(startTime, endTime) ||
    Math.max(1, (event.endMin - event.startMin) / 60)
  const drivers = Math.min(totalQuads, Math.max(1, event.drivers))
  const customer = parseCustomerFromEvent(event)

  const data = {
    bookingDate: event.date,
    bookingTime: startTime,
    reservationEndTime: endTime,
    durationHours: duration,
    drivers,
    passengers: event.passengers,
    people: drivers + event.passengers,
    customerFirstName: customer.firstName,
    customerLastName: customer.lastName,
    customerPhone: customer.phone,
    customerNotes: customer.notes,
    source: 'google_calendar' as const,
    status: 'confirmed' as const,
    paymentStatus:
      event.depositAmount && event.depositAmount > 0
        ? ('deposit_paid' as const)
        : ('unpaid' as const),
    gcalEventId: event.id,
    fullPrice:
      event.depositAmount != null || event.remainingAmount != null
        ? Number(event.depositAmount || 0) + Number(event.remainingAmount || 0)
        : 0,
    depositAmount: Number(event.depositAmount || 0),
    remainingAmount: Number(event.remainingAmount || 0),
  }

  if (byEvent.docs[0]) {
    const existing = byEvent.docs[0]
    // Nie nadpisuj rezerwacji z WWW / admina — tylko importy z kalendarza
    if (existing.source !== 'google_calendar') {
      return { action: 'exists' as const }
    }
    await payload.update({
      collection: 'bookings',
      id: existing.id,
      data,
      overrideAccess: true,
    })
    return { action: 'updated' as const }
  }

  await payload.create({
    collection: 'bookings',
    data,
    overrideAccess: true,
  })
  return { action: 'created' as const }
}

function splitName(raw: string): { firstName: string; lastName: string } {
  const cleaned = raw.replace(/\s+/g, ' ').trim()
  if (!cleaned || cleaned === '—') return { firstName: 'Kalendarz', lastName: 'Google' }
  const parts = cleaned.split(' ')
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function parseCustomerFromEvent(event: ParsedGcalEvent): {
  firstName: string
  lastName: string
  phone: string
  notes: string
} {
  const description = event.description || ''
  const phoneMatch = description.match(/Telefon:\s*(.+)/i)
  const clientMatch = description.match(/Klient:\s*(.+)/i)
  const phone = String(phoneMatch?.[1] || event.phone || '').trim() || 'kalendarz'
  const nameFromDesc = String(clientMatch?.[1] || '').trim()
  const nameFromSummary = event.customerName || ''
  const { firstName, lastName } = splitName(nameFromDesc || nameFromSummary)

  const notes = [
    'Zaimportowano z Google Calendar',
    event.summary ? `Tytuł: ${event.summary}` : '',
    description ? `Opis:\n${description}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return { firstName, lastName, phone, notes }
}

export type GcalSyncResult = {
  ok: boolean
  message: string
  created: number
  updated: number
  linked: number
  skipped: number
  days: number
}

/**
 * Importuje wydarzenia z Google Calendar do kolekcji bookings (idempotentnie po gcalEventId).
 */
export async function syncGoogleCalendarBookings(args?: {
  daysBack?: number
  daysForward?: number
}): Promise<GcalSyncResult> {
  const daysBack = Math.max(0, args?.daysBack ?? 14)
  const daysForward = Math.max(1, args?.daysForward ?? 90)
  const settings = await getBookingSettings()

  const today = new Date()
  const warsawToday = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(today)

  const [y, m, d] = warsawToday.split('-').map(Number)
  const base = new Date(Date.UTC(y, m - 1, d))
  const from = new Date(base)
  from.setUTCDate(base.getUTCDate() - daysBack)
  const to = new Date(base)
  to.setUTCDate(base.getUTCDate() + daysForward)
  const fromDate = from.toISOString().slice(0, 10)
  const toDate = to.toISOString().slice(0, 10)

  const listed = await listGoogleCalendarEventsInRange(fromDate, toDate, settings.totalQuads)
  if (!listed.configured) {
    return {
      ok: false,
      message: 'Uzupełnij Calendar ID i JSON konta serwisowego w ustawieniach rezerwacji.',
      created: 0,
      updated: 0,
      linked: 0,
      skipped: 0,
      days: 0,
    }
  }
  if (!listed.ok) {
    return {
      ok: false,
      message: 'Nie udało się odczytać wydarzeń z Google Calendar (token / dostęp / Calendar ID).',
      created: 0,
      updated: 0,
      linked: 0,
      skipped: 0,
      days: 0,
    }
  }

  let created = 0
  let updated = 0
  let linked = 0
  let skipped = 0

  for (const event of listed.events) {
    try {
      const result = await upsertGcalParsedEvent(event, settings.totalQuads)
      if (result.action === 'created') created += 1
      else if (result.action === 'updated') updated += 1
      else if (result.action === 'linked') linked += 1
      else skipped += 1
    } catch (error) {
      console.error('GCal sync event failed', event.id, error)
      skipped += 1
    }
  }

  return {
    ok: true,
    message: `Zsynchronizowano ${fromDate} → ${toDate}: +${created} nowych, ${updated} zaktualizowanych, ${linked} powiązanych (${listed.events.length} wydarzeń).`,
    created,
    updated,
    linked,
    skipped,
    days: daysBack + daysForward + 1,
  }
}

/** Lekki sync jednego dnia — wołany przy sprawdzaniu wolnych godzin. */
export async function syncGoogleCalendarDay(date: string): Promise<{
  ok: boolean
  intervals: { start: number; end: number; drivers: number; bookingId?: string }[]
  configured: boolean
}> {
  const settings = await getBookingSettings()
  const listed = await listGoogleCalendarDayEvents(date, settings.totalQuads)
  if (!listed.ok) {
    return { ok: false, configured: listed.configured, intervals: [] }
  }

  for (const event of listed.events) {
    try {
      await upsertGcalParsedEvent(event, settings.totalQuads)
    } catch (error) {
      console.error('GCal day sync failed', date, event.id, error)
    }
  }

  return {
    ok: true,
    configured: listed.configured,
    intervals: listed.events.map((event) => ({
      start: event.startMin,
      end: event.endMin,
      drivers: event.drivers,
      bookingId: event.bookingId,
    })),
  }
}
