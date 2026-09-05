import { NextResponse } from 'next/server'
import { getActiveTrips, seedDefaultTripsIfEmpty } from '@/lib/booking'

export async function GET() {
  try {
    await seedDefaultTripsIfEmpty()
    const trips = await getActiveTrips()
    return NextResponse.json({ trips })
  } catch (error) {
    console.error('GET /api/booking/trips', error)
    return NextResponse.json({ message: 'Nie udało się pobrać wypraw.' }, { status: 500 })
  }
}
