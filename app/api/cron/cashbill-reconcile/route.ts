import { NextResponse } from 'next/server'
import { reconcilePendingCashBillPayments } from '@/lib/cashbill/sync'

/**
 * Cron / health ping — Hostinger lub zewnętrzny cron może wołać co 1–5 min:
 *   GET https://tatraoffroad.pl/api/cron/cashbill-reconcile
 * Opcjonalnie: Authorization: Bearer $CRON_SECRET albo ?secret=
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const expected = String(process.env.CRON_SECRET || '').trim()
    if (expected) {
      const auth = request.headers.get('authorization') || ''
      const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
      const querySecret = url.searchParams.get('secret') || ''
      if (bearer !== expected && querySecret !== expected) {
        return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
      }
    }

    const result = await reconcilePendingCashBillPayments({ force: true, limit: 40 })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('GET /api/cron/cashbill-reconcile', error)
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Błąd' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
