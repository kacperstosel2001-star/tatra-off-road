import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { calculateEndTime, getBookingSettings, getTripById } from '@/lib/booking'

async function requireAdmin() {
  const payload = await getPayload({ config })
  const headerStore = await nextHeaders()
  const { user } = await payload.auth({ headers: headerStore })
  return user
}

function buildStartSlots(openHour: number, closeHour: number, durationHours: number): string[] {
  let open = openHour
  let close = closeHour
  if (close <= open) {
    open = 8
    close = 18
  }
  const duration = durationHours > 0 ? durationHours : 1
  const slots: string[] = []
  for (let h = open; h + duration <= close + 0.001; h += 1) {
    slots.push(`${String(Math.floor(h)).padStart(2, '0')}:00`)
  }
  return slots
}

export async function GET(request: Request) {
  try {
    const user = await requireAdmin()
    if (!user) {
      return NextResponse.json({ ok: false, message: 'Zaloguj się w panelu admina.' }, { status: 401 })
    }

    const url = new URL(request.url)
    const tripId = url.searchParams.get('tripId')
    const settings = await getBookingSettings()

    let durationHours = 1
    let tripName: string | null = null
    if (tripId) {
      const trip = await getTripById(tripId)
      if (trip) {
        durationHours = trip.durationHours > 0 ? trip.durationHours : 1
        tripName = trip.name
      }
    }

    const slots = buildStartSlots(settings.openHour, settings.closeHour, durationHours)

    return NextResponse.json({
      ok: true,
      openHour: settings.openHour,
      closeHour: settings.closeHour,
      durationHours,
      tripName,
      slots,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Błąd' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin()
    if (!user) {
      return NextResponse.json({ ok: false, message: 'Zaloguj się w panelu admina.' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const startTime = String(body.startTime || '').slice(0, 5)
    const tripId = body.tripId

    let durationHours = Number(body.durationHours || 0)
    if (tripId) {
      const trip = await getTripById(tripId)
      if (trip) durationHours = trip.durationHours > 0 ? trip.durationHours : 1
    }
    if (durationHours <= 0) durationHours = 1

    const endTime = calculateEndTime(startTime, durationHours)
    if (!endTime) {
      return NextResponse.json({ ok: false, message: 'Nieprawidłowa godzina startu.' }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      startTime,
      endTime,
      durationHours,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Błąd' },
      { status: 500 },
    )
  }
}
