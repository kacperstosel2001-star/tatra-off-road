import { getPayload } from 'payload'
import config from '@payload-config'
import type { Booking, Trip } from '@/payload-types'

export async function getPayloadClient() {
  return getPayload({ config })
}

export type TripDTO = {
  id: string | number
  name: string
  durationHours: number
  price1: number
  price2: number
  deposit: number
  description?: string | null
}

export type PriceBreakdown = {
  total: number
  deposit: number
  remaining: number
  quads: number
  quadsWithPassenger: number
  quadsSolo: number
}

export type CapacitySnapshot = {
  total: number
  reserved: number
  available: number
}

export type SlotAvailability = {
  time: string
  /** Zawsze 0 lub 1 — indywidualne wycieczki, jedna rezerwacja na slot. */
  availableQuads: number
}

export type BusyInterval = {
  start: number
  end: number
  drivers: number
  /** Blokada admina (cały dzień / wiele quadów) — liczy się inaczej niż zwykła rezerwacja. */
  isAdminBlock?: boolean
}

export function calcPrice(
  trip: Pick<TripDTO, 'price1' | 'price2' | 'deposit'>,
  drivers: number,
  passengers: number,
): PriceBreakdown {
  const d = Math.max(0, drivers)
  const p = Math.max(0, Math.min(passengers, d))
  const quadsWithPassenger = p
  const quadsSolo = d - p
  const total = quadsWithPassenger * trip.price2 + quadsSolo * trip.price1
  let deposit = trip.deposit * d
  if (deposit <= 0 && total > 0) deposit = total
  deposit = Math.min(deposit, total || deposit)
  return {
    total,
    deposit,
    remaining: Math.max(0, total - deposit),
    quads: d,
    quadsWithPassenger,
    quadsSolo,
  }
}

export function timeToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function calculateEndTime(startTime: string, durationHours: number): string | false {
  const start = timeToMinutes(startTime)
  if (start === null || durationHours <= 0) return false
  return minutesToTime(start + Math.round(durationHours * 60))
}

export function calculateDurationHoursFromRange(startTime: string, endTime: string): number | false {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  if (start === null || end === null || end <= start) return false
  return (end - start) / 60
}

export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

export function tripToDTO(trip: Trip): TripDTO {
  return {
    id: trip.id,
    name: trip.name,
    durationHours: Number(trip.durationHours),
    price1: Number(trip.price1),
    price2: Number(trip.price2),
    deposit: Number(trip.deposit),
    description: trip.description,
  }
}

export async function getBookingSettings() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({
    slug: 'booking-settings',
    overrideAccess: true,
  })

  return {
    totalQuads: Math.max(1, Number(settings.totalQuads ?? 7)),
    openHour: Number(settings.openHour ?? 8),
    closeHour: Number(settings.closeHour ?? 18),
    minBookingLeadHours: Number(settings.minBookingLeadHours ?? 5),
    holdMinutes: Number(settings.holdMinutes ?? 15),
  }
}

export async function getActiveTrips(locale: 'pl' | 'en' = 'pl'): Promise<TripDTO[]> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'trips',
      locale,
      fallbackLocale: 'pl',
      where: { active: { equals: true } },
      sort: 'sortOrder',
      limit: 100,
      overrideAccess: true,
    })
    return result.docs.map((doc) => tripToDTO(doc as any))
  } catch {
    return []
  }
}

export async function getTripById(id: string | number): Promise<TripDTO | null> {
  const payload = await getPayloadClient()
  try {
    const trip = await payload.findByID({
      collection: 'trips',
      id,
      overrideAccess: true,
    })
    if (!(trip as any).active) return null
    return tripToDTO(trip as any)
  } catch {
    return null
  }
}

export function slotMeetsLeadTime(
  date: string,
  time: string,
  leadHours: number,
  now = new Date(),
): boolean {
  const start = timeToMinutes(time)
  if (start === null) return false
  const [y, m, d] = date.split('-').map(Number)
  const slotDate = new Date(y, m - 1, d, Math.floor(start / 60), start % 60, 0, 0)
  const leadMs = leadHours * 60 * 60 * 1000
  return slotDate.getTime() - now.getTime() >= leadMs
}

function normalizeBookingDate(value: unknown): string {
  return String(value || '').slice(0, 10)
}

function bookingInterval(booking: Booking): { start: number; end: number; drivers: number } | null {
  const start = timeToMinutes(String(booking.bookingTime).slice(0, 5))
  const endRaw =
    booking.reservationEndTime ||
    calculateEndTime(String(booking.bookingTime).slice(0, 5), Number(booking.durationHours))
  const end = timeToMinutes(String(endRaw || '').slice(0, 5))
  if (start === null || end === null || end <= start) return null
  return { start, end, drivers: Math.max(0, Number(booking.drivers || 0)) }
}

/** Indywidualne wycieczki: slot zajęty, gdy jakakolwiek rezerwacja nachodzi na [start, end). */
export function isSlotBlocked(
  startMin: number,
  endMin: number,
  intervals: Pick<BusyInterval, 'start' | 'end'>[],
): boolean {
  return intervals.some((item) => rangesOverlap(startMin, endMin, item.start, item.end))
}

async function loadDayBusyIntervals(
  date: string,
  args: { excludeBookingId?: string | number; sessionId?: string } = {},
): Promise<{ totalQuads: number; intervals: BusyInterval[] }> {
  const payload = await getPayloadClient()
  const settings = await getBookingSettings()

  // Jedno odczytanie GCal: import do panelu + zajętość (bez podwójnego fetcha)
  let gcalOk = false
  let gcalIntervals: BusyInterval[] = []
  try {
    const { syncGoogleCalendarDay } = await import('@/lib/gcal/sync')
    const synced = await syncGoogleCalendarDay(date)
    gcalOk = synced.ok
    gcalIntervals = synced.intervals.map((item) => ({
      start: item.start,
      end: item.end,
      drivers: item.drivers,
      isAdminBlock: false,
    }))
    if (synced.configured && !synced.ok) {
      console.error(
        'GCal configured but list failed — availability uses DB only until calendar works again',
      )
    }
  } catch (error) {
    console.error('GCal day sync', error)
  }

  const result = await payload.find({
    collection: 'bookings',
    where: {
      and: [
        {
          or: [
            {
              and: [
                { bookingDate: { greater_than_equal: `${date}T00:00:00.000Z` } },
                { bookingDate: { less_than_equal: `${date}T23:59:59.999Z` } },
              ],
            },
            {
              and: [
                { entryKind: { equals: 'block' } },
                { bookingDate: { less_than_equal: `${date}T23:59:59.999Z` } },
                { blockEndDate: { greater_than_equal: `${date}T00:00:00.000Z` } },
              ],
            },
          ],
        },
        {
          or: [
            { status: { equals: 'confirmed' } },
            { status: { equals: 'deposit_paid' } },
            { status: { equals: 'pending' } },
          ],
        },
      ],
    },
    limit: 500,
    overrideAccess: true,
  })

  const intervals: BusyInterval[] = []

  for (const booking of result.docs as Booking[]) {
    const startDay = normalizeBookingDate(booking.bookingDate)
    const endDay = normalizeBookingDate((booking as any).blockEndDate) || startDay
    const coversDay =
      startDay === date || (startDay <= date && endDay >= date && (booking as any).entryKind === 'block')
    if (!coversDay) continue
    if (args.excludeBookingId && String(booking.id) === String(args.excludeBookingId)) continue
    if (
      booking.status === 'pending' &&
      args.sessionId &&
      booking.sessionId &&
      booking.sessionId === args.sessionId
    ) {
      continue
    }
    if (booking.status === 'pending' && booking.expiresAt) {
      if (new Date(booking.expiresAt).getTime() < Date.now()) continue
    }

    // Opłacone rezerwacje WWW zsynchronizowane do GCal — liczymy z kalendarza,
    // żeby usunięcie eventa zwalniało slot. Importy z kalendarza / telefon zostają w bazie.
    if (
      gcalOk &&
      booking.gcalEventId &&
      booking.source === 'website' &&
      (booking.status === 'deposit_paid' || booking.status === 'confirmed')
    ) {
      continue
    }

    const interval = bookingInterval(booking)
    if (!interval) continue
    // Blokada bez konkretnych godzin → cały dzień
    if ((booking as any).entryKind === 'block' && (!booking.bookingTime || !booking.reservationEndTime)) {
      intervals.push({
        start: 0,
        end: 24 * 60,
        drivers: interval.drivers || settings.totalQuads,
        isAdminBlock: true,
      })
      continue
    }
    intervals.push({
      ...interval,
      isAdminBlock: (booking as any).entryKind === 'block',
    })
  }

  if (gcalOk) {
    intervals.push(...gcalIntervals)
  }

  return { totalQuads: settings.totalQuads, intervals }
}

export async function getCapacitySnapshot(
  date: string,
  startTime: string,
  endTime: string,
  args: { excludeBookingId?: string | number; sessionId?: string } = {},
): Promise<CapacitySnapshot> {
  const startMin = timeToMinutes(startTime)
  const endMin = timeToMinutes(endTime)
  const { intervals } = await loadDayBusyIntervals(date, args)

  if (startMin === null || endMin === null) {
    return { total: 1, reserved: 1, available: 0 }
  }

  const overlapping = intervals.filter((item) => rangesOverlap(startMin, endMin, item.start, item.end))
  const blocked = isSlotBlocked(startMin, endMin, overlapping)
  return { total: 1, reserved: blocked ? 1 : 0, available: blocked ? 0 : 1 }
}

export async function getAvailableSlots(
  tripId: string | number,
  date: string,
  _requestedQuads = 1,
  sessionId?: string,
): Promise<SlotAvailability[]> {
  const trip = await getTripById(tripId)
  if (!trip) return []

  const settings = await getBookingSettings()
  let openHour = settings.openHour
  let closeHour = settings.closeHour
  if (closeHour <= openHour) {
    openHour = 8
    closeHour = 18
  }

  const { intervals } = await loadDayBusyIntervals(date, { sessionId })
  const duration = trip.durationHours > 0 ? trip.durationHours : 1
  const slots: SlotAvailability[] = []

  for (let h = openHour; h + duration <= closeHour + 0.001; h += 1) {
    const startTime = minutesToTime(Math.round(h * 60))
    if (!slotMeetsLeadTime(date, startTime, settings.minBookingLeadHours)) continue
    const endTime = calculateEndTime(startTime, duration)
    if (!endTime) continue
    const startMin = timeToMinutes(startTime)
    const endMin = timeToMinutes(endTime)
    if (startMin === null || endMin === null) continue

    const overlapping = intervals.filter((item) =>
      rangesOverlap(startMin, endMin, item.start, item.end),
    )
    if (!isSlotBlocked(startMin, endMin, overlapping)) {
      slots.push({ time: startTime, availableQuads: 1 })
    }
  }
  return slots
}

export async function releaseSessionPending(sessionId: string, exceptBookingId?: string | number) {
  if (!sessionId) return
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'bookings',
    where: {
      and: [
        { sessionId: { equals: sessionId } },
        { status: { equals: 'pending' } },
      ],
    },
    limit: 50,
    overrideAccess: true,
  })

  for (const booking of result.docs) {
    if (exceptBookingId && String(booking.id) === String(exceptBookingId)) continue
    await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: { status: 'expired' },
      overrideAccess: true,
    })
  }
}

export async function seedDefaultTripsIfEmpty() {
  const payload = await getPayloadClient()
  const existing = await payload.find({
    collection: 'trips',
    limit: 1,
    overrideAccess: true,
  })
  if (existing.totalDocs > 0) return

  const defaults = [
    {
      name: 'Wyprawa quadowa 1-godzinna',
      durationHours: 1,
      price1: 250,
      price2: 300,
      deposit: 50,
      active: true,
      sortOrder: 1,
    },
    {
      name: 'Wyprawa quadowa 2-godzinna',
      durationHours: 2,
      price1: 450,
      price2: 500,
      deposit: 100,
      active: true,
      sortOrder: 2,
    },
  ]

  for (const trip of defaults) {
    await payload.create({
      collection: 'trips',
      data: trip,
      overrideAccess: true,
    })
  }
}
