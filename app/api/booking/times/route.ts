import { NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/booking'
import { triggerCashBillReconcileInBackground } from '@/lib/cashbill/sync'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const tripId = body.tripId
    const date = String(body.date || '')
    const drivers = Math.max(1, Number(body.drivers || 1))
    const sessionId = body.sessionId ? String(body.sessionId) : undefined

    if (!tripId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ message: 'Nieprawidłowe dane.' }, { status: 400 })
    }

    // Przy okazji sprawdzania terminów — dociągnij opłacone z CashBill w tle
    triggerCashBillReconcileInBackground('booking-times')

    const slots = await getAvailableSlots(tripId, date, drivers, sessionId)
    return NextResponse.json({
      times: slots.map((s) => s.time),
      slots,
    })
  } catch (error) {
    console.error('POST /api/booking/times', error)
    return NextResponse.json({ message: 'Nie udało się pobrać godzin.' }, { status: 500 })
  }
}
