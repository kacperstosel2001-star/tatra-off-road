import { NextResponse } from 'next/server'
import { getActiveTrips, seedDefaultTripsIfEmpty } from '@/lib/booking'
import { triggerCashBillReconcileInBackground } from '@/lib/cashbill/sync'

export async function GET() {
  try {
    triggerCashBillReconcileInBackground('booking-trips')
    await seedDefaultTripsIfEmpty()
    const trips = await getActiveTrips()
    return NextResponse.json({ trips })
  } catch (error) {
    console.error('GET /api/booking/trips', error)
    return NextResponse.json({ message: 'Nie udało się pobrać wypraw.' }, { status: 500 })
  }
}
