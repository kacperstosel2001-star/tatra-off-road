import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { testGoogleCalendarConnection } from '@/lib/gcal/client'

export async function POST() {
  try {
    const payload = await getPayload({ config })
    const headerStore = await nextHeaders()
    const { user } = await payload.auth({ headers: headerStore })

    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'Zaloguj się w panelu admina, żeby testować połączenie.' },
        { status: 401 },
      )
    }

    const result = await testGoogleCalendarConnection()
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  } catch (error) {
    console.error('GCal test', error)
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Błąd testu GCal' },
      { status: 500 },
    )
  }
}
