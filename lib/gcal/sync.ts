import { getPayloadClient, getBookingSettings, calculateDurationHoursFromRange } from '@/lib/booking'
import {
  fetchGoogleCalendarDayItems,
  fetchGoogleCalendarRangeItems,
  listGoogleCalendarDayEvents,
  listGoogleCalendarEventsInRange,
  type ParsedGcalEvent,
} from '@/lib/gcal/client'
import type { Booking } from '@/payload-types'

function isEnumSourceError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || '')
  return /google_calendar|enum_bookings_source|invalid input value for enum/i.test(message)
}

/**
 * GCal usunięty / anulowany → usuń import z panelu lub anuluj rezerwację WWW.
 */
export async function removeBookingForGcalEvent(
  eventId: string,
): Promise<'deleted' | 'cancelled' | 'missing'> {
  const id = String(eventId || '').trim()
  if (!id) return 'missing'

  const payload = await getPayloadClient()
  const found = await payload.find({
    collection: 'bookings',
    where: { gcalEventId: { equals: id } },
    limit: 1,
    overrideAccess: true,
  })
  const booking = found.docs[0] as Booking | undefined
  if (!booking) return 'missing'

  const keepRecord =
    booking.source === 'website' ||
    booking.source === 'manual_admin' ||
    booking.paymentStatus === 'deposit_paid' ||
    booking.status === 'deposit_paid'

  if (keepRecord) {
    await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: {
        status: 'cancelled',
        gcalEventId: null,
        expiresAt: null,
      },
      overrideAccess: true,
    })
    return 'cancelled'
  }

  await payload.delete({
    collection: 'bookings',
    id: booking.id,
    overrideAccess: true,
  })
  return 'deleted'
}

async function purgeDeletedGcalBookingsForDay(date: string, totalQuads: number): Promise<number> {
  const raw = await fetchGoogleCalendarDayItems(date)
  if (!raw.ok) return 0

  const listed = await listGoogleCalendarDayEvents(date, totalQuads)
  const activeIds = new Set(listed.events.map((event) => event.id))
  const allFetchedIds = new Set(
    raw.items.map((item) => String(item.id || '').trim()).filter(Boolean),
  )

  let removed = 0
  for (const item of raw.items) {
    if (item.id && item.status === 'cancelled') {
      const result = await removeBookingForGcalEvent(item.id)
      if (result !== 'missing') removed += 1
    }
  }

  const payload = await getPayloadClient()
  const linked = await payload.find({
    collection: 'bookings',
    where: {
      and: [
        { gcalEventId: { exists: true } },
        { bookingDate: { greater_than_equal: `${date}T00:00:00.000Z` } },
        { bookingDate: { less_than_equal: `${date}T23:59:59.999Z` } },
      ],
    },
    limit: 200,
    overrideAccess: true,
  })

  for (const booking of linked.docs as Booking[]) {
    const eventId = String(booking.gcalEventId || '').trim()
    if (!eventId || activeIds.has(eventId)) continue
    if (!allFetchedIds.has(eventId)) {
      const result = await removeBookingForGcalEvent(eventId)
      if (result !== 'missing') removed += 1
    }
  }

  return removed
}

async function purgeDeletedGcalBookingsInRange(
  fromDate: string,
  toDate: string,
  activeEventIds: Set<string>,
  allFetchedIds: Set<string>,
): Promise<number> {
  const payload = await getPayloadClient()
  const linked = await payload.find({
    collection: 'bookings',
    where: {
      and: [
        { gcalEventId: { exists: true } },
        { bookingDate: { greater_than_equal: `${fromDate}T00:00:00.000Z` } },
        { bookingDate: { less_than_equal: `${toDate}T23:59:59.999Z` } },
      ],
    },
    limit: 500,
    overrideAccess: true,
  })

  let removed = 0
  for (const booking of linked.docs as Booking[]) {
    const eventId = String(booking.gcalEventId || '').trim()
    if (!eventId || activeEventIds.has(eventId)) continue
    if (!allFetchedIds.has(eventId)) {
      const result = await removeBookingForGcalEvent(eventId)
      if (result !== 'missing') removed += 1
    }
  }
  return removed
}

export async function upsertGcalParsedEvent(event: ParsedGcalEvent, totalQuads: number) {
  if (!event.id || event.cancelled || !event.importable) {
    return { action: 'skipped' as const, reason: 'not-importable' }
  }

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

  const baseData = {
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
    // Nie nadpisuj rezerwacji z WWW — tylko importy z kalendarza / telefon
    if (existing.source === 'website') {
      return { action: 'exists' as const }
    }
    await payload.update({
      collection: 'bookings',
      id: existing.id,
      data: {
        ...baseData,
        source: existing.source === 'google_calendar' ? 'google_calendar' : existing.source,
      },
      overrideAccess: true,
    })
    return { action: 'updated' as const }
  }

  try {
    await payload.create({
      collection: 'bookings',
      data: { ...baseData, source: 'google_calendar' },
      overrideAccess: true,
    })
    return { action: 'created' as const }
  } catch (error) {
    // Stary enum w Postgres bez google_calendar — zapisujemy jako telefon, żeby sync nie padał
    if (isEnumSourceError(error)) {
      await payload.create({
        collection: 'bookings',
        data: { ...baseData, source: 'phone' },
        overrideAccess: true,
      })
      return { action: 'created' as const, reason: 'fallback-phone' }
    }
    throw error
  }
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
  removed: number
  skipped: number
  days: number
  errors?: string[]
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
      removed: 0,
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
      removed: 0,
      skipped: 0,
      days: 0,
    }
  }

  const raw = await fetchGoogleCalendarRangeItems(fromDate, toDate)
  const activeEventIds = new Set(listed.events.map((event) => event.id))
  const allFetchedIds = new Set(
    (raw.items || []).map((item) => String(item.id || '').trim()).filter(Boolean),
  )

  let created = 0
  let updated = 0
  let linked = 0
  let removed = 0
  let skipped = 0
  const errors: string[] = []

  if (raw.ok) {
    for (const item of raw.items) {
      if (item.id && item.status === 'cancelled') {
        try {
          const result = await removeBookingForGcalEvent(item.id)
          if (result !== 'missing') removed += 1
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error)
          errors.push(`Usunięcie ${item.id}: ${msg}`)
        }
      }
    }
  }

  for (const event of listed.events) {
    try {
      const result = await upsertGcalParsedEvent(event, settings.totalQuads)
      if (result.action === 'created') created += 1
      else if (result.action === 'updated') updated += 1
      else if (result.action === 'linked') linked += 1
      else skipped += 1
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('GCal sync event failed', event.id, error)
      errors.push(`${event.summary || event.id}: ${msg}`)
      skipped += 1
    }
  }

  if (raw.ok) {
    try {
      removed += await purgeDeletedGcalBookingsInRange(
        fromDate,
        toDate,
        activeEventIds,
        allFetchedIds,
      )
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      errors.push(`Czyszczenie usuniętych: ${msg}`)
    }
  }

  const errorHint =
    errors.length > 0 ? ` Błędy: ${errors.slice(0, 3).join(' | ')}${errors.length > 3 ? '…' : ''}` : ''

  return {
    ok: errors.length === 0,
    message: `Kalendarz ${fromDate} → ${toDate}: znaleziono ${listed.events.length}, +${created} nowych, ${updated} zaktualizowanych, ${linked} powiązanych, ${removed} usuniętych z panelu, ${skipped} pominiętych.${errorHint}`,
    created,
    updated,
    linked,
    removed,
    skipped,
    days: daysBack + daysForward + 1,
    errors: errors.length ? errors : undefined,
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

  try {
    await purgeDeletedGcalBookingsForDay(date, settings.totalQuads)
  } catch (error) {
    console.error('GCal day purge failed', date, error)
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
    intervals: listed.events
      .filter((event) => event.blocksAvailability)
      .map((event) => ({
        start: event.startMin,
        end: event.endMin,
        drivers: event.drivers,
        bookingId: event.bookingId,
      })),
  }
}
