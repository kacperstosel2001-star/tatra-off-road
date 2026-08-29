import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import {
  calcPrice,
  calculateEndTime,
  getBookingSettings,
  getCapacitySnapshot,
  getTripById,
  releaseSessionPending,
  slotMeetsLeadTime,
  getPayloadClient,
} from '@/lib/booking'
import { localePath } from '@/lib/i18n'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const tripId = body.tripId
    const drivers = Number(body.drivers || 0)
    const passengers = Number(body.passengers || 0)
    const phone = String(body.phone || '').trim()
    const firstName = String(body.firstName || '').trim()
    const lastName = String(body.lastName || '').trim()
    const email = String(body.email || '').trim()
    const date = String(body.date || '')
    const time = String(body.time || '')
    const sessionId = String(body.sessionId || randomUUID())
    const lang = body.lang === 'en' ? 'en' : 'pl'

    const trip = await getTripById(tripId)
    if (!trip) {
      return NextResponse.json({ message: 'Nieprawidłowa wyprawa.' }, { status: 400 })
    }

    const settings = await getBookingSettings()
    const maxQuads = settings.totalQuads

    if (drivers < 1) {
      return NextResponse.json({ message: 'Musi być przynajmniej 1 kierowca.' }, { status: 400 })
    }
    if (drivers > maxQuads) {
      return NextResponse.json(
        { message: `Maksymalnie ${maxQuads} quadów online. Przy większej grupie zadzwoń.` },
        { status: 400 },
      )
    }
    if (passengers < 0 || passengers > drivers) {
      return NextResponse.json(
        { message: 'Liczba pasażerów nie może przekraczać liczby kierowców.' },
        { status: 400 },
      )
    }
    if (!/^[0-9+\s\-()]{9,20}$/.test(phone)) {
      return NextResponse.json({ message: 'Podaj prawidłowy numer telefonu.' }, { status: 400 })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ message: 'Nieprawidłowa data lub godzina.' }, { status: 400 })
    }
    if (!slotMeetsLeadTime(date, time, settings.minBookingLeadHours)) {
      return NextResponse.json(
        {
          message: `Ten termin można zarezerwować najpóźniej ${settings.minBookingLeadHours} godzin przed startem.`,
        },
        { status: 400 },
      )
    }

    await releaseSessionPending(sessionId)

    const endTime = calculateEndTime(time, trip.durationHours)
    if (!endTime) {
      return NextResponse.json({ message: 'Nie udało się wyliczyć końca rezerwacji.' }, { status: 400 })
    }

    const capacity = await getCapacitySnapshot(date, time, endTime, { sessionId })
    if (capacity.available < 1) {
      return NextResponse.json(
        {
          message: 'Ten termin jest już zajęty. Wybierz inną godzinę lub zadzwoń.',
          slotTaken: true,
        },
        { status: 409 },
      )
    }

    const price = calcPrice(trip, drivers, passengers)
    const expiresAt = new Date(Date.now() + settings.holdMinutes * 60 * 1000).toISOString()

    const payload = await getPayloadClient()
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        trip: trip.id,
        bookingDate: date,
        bookingTime: time,
        reservationEndTime: endTime,
        durationHours: trip.durationHours,
        drivers,
        passengers,
        people: drivers + passengers,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerPhone: phone,
        customerEmail: email || undefined,
        entryKind: 'booking',
        source: 'website',
        status: 'pending',
        sessionId,
        fullPrice: price.total,
        depositAmount: price.deposit,
        remainingAmount: price.remaining,
        paymentStatus: 'unpaid',
        expiresAt,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      bookingId: booking.id,
      sessionId,
      checkoutUrl: localePath(lang, `/kasa/${booking.id}`),
      price,
      tripName: trip.name,
      date,
      time,
      endTime,
      expiresAt,
    })
  } catch (error) {
    console.error('POST /api/booking/reserve', error)
    return NextResponse.json({ message: 'Nie udało się utworzyć rezerwacji.' }, { status: 500 })
  }
}
