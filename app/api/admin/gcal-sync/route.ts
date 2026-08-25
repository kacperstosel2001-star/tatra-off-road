import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { syncGoogleCalendarBookings } from '@/lib/gcal/sync'

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })
    const headerStore = await nextHeaders()
    const { user } = await payload.auth({ headers: headerStore })

    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'Zaloguj się w panelu admina, żeby synchronizować kalendarz.' },
        { status: 401 },
      )
    }

    let daysBack = 14
    let daysForward = 90
    try {
      const body = (await request.json()) as { daysBack?: number; daysForward?: number }
      if (typeof body.daysBack === 'number') daysBack = body.daysBack
      if (typeof body.daysForward === 'number') daysForward = body.daysForward
    } catch {
      /* empty body ok */
    }

    const result = await syncGoogleCalendarBookings({ daysBack, daysForward })
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  } catch (error) {
    console.error('GCal sync', error)
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Błąd synchronizacji GCal' },
      { status: 500 },
    )
  }
}
