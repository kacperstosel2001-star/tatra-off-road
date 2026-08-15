import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/booking'
import {
  assertCashBillReturnUrl,
  getCashBillClient,
  resolvePreferredChannels,
} from '@/lib/cashbill/config'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const method = String(body.method || 'blik') as 'blik' | 'transfer'
    const firstName = String(body.firstName || '').trim()
    const lastName = String(body.lastName || '').trim()
    const email = String(body.email || '').trim()
    const lang = String(body.lang || 'pl')

    if (method !== 'blik' && method !== 'transfer') {
      return NextResponse.json({ message: 'Wybierz BLIK albo przelew.' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const booking = await payload.findByID({
      collection: 'bookings',
      id,
      depth: 1,
      overrideAccess: true,
    })

    if (booking.status === 'cancelled' || booking.status === 'expired') {
      return NextResponse.json({ message: 'Ta rezerwacja jest już nieaktywna.' }, { status: 400 })
    }

    if (booking.paymentStatus === 'deposit_paid' || booking.status === 'deposit_paid') {
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        message: 'Zaliczka jest już opłacona.',
      })
    }

    if (booking.expiresAt && new Date(booking.expiresAt).getTime() < Date.now() && booking.status === 'pending') {
      await payload.update({
        collection: 'bookings',
        id,
        data: { status: 'expired' },
        overrideAccess: true,
      })
      return NextResponse.json(
        { message: 'Czas na opłacenie zaliczki minął. Zrób nową rezerwację.' },
        { status: 410 },
      )
    }

    const deposit = Number(booking.depositAmount || 0)
    if (deposit <= 0) {
      return NextResponse.json({ message: 'Brak kwoty zaliczki do pobrania.' }, { status: 400 })
    }

    const { client, cfg } = await getCashBillClient(request)
    assertCashBillReturnUrl(cfg.appUrl)
    const channels = await resolvePreferredChannels(request)
    const channel = method === 'blik' ? channels.blik : channels.transfer

    const tripName =
      booking.trip && typeof booking.trip === 'object' && 'name' in booking.trip
        ? String(booking.trip.name)
        : 'Wyprawa quadowa'

    const returnUrl = `${cfg.appUrl}/${lang}/kasa/${id}/dziekujemy`
    const negativeReturnUrl = `${cfg.appUrl}/${lang}/kasa/${id}?payment=cancel`

    console.log('[tatra] cashbill createPayment urls', {
      appUrl: cfg.appUrl,
      returnUrl,
      negativeReturnUrl,
      mode: cfg.mode,
      shopId: cfg.shopId,
      channel: channel.id,
    })

    const payment = await client.createPayment({
      title: `Zaliczka #${id} — ${tripName}`,
      amount: deposit,
      currency: 'PLN',
      description: `${tripName} · ${String(booking.bookingDate).slice(0, 10)} ${String(booking.bookingTime).slice(0, 5)}`,
      additionalData: String(id),
      returnUrl,
      negativeReturnUrl,
      paymentChannel: channel.id,
      languageCode: 'pl',
      referer: cfg.appUrl,
    })

    await payload.update({
      collection: 'bookings',
      id,
      data: {
        customerFirstName: firstName || booking.customerFirstName,
        customerLastName: lastName || booking.customerLastName,
        customerEmail: email || booking.customerEmail,
        paymentMethod: method,
        cashbillPaymentId: payment.id,
        cashbillChannel: channel.id,
        paymentStatus: 'unpaid',
        status: 'pending',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
      redirectUrl: payment.redirectUrl,
      paymentId: payment.id,
      mode: cfg.mode,
      channel: channel.id,
    })
  } catch (error) {
    console.error('POST /api/booking/[id]/pay', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Nie udało się uruchomić płatności CashBill.',
      },
      { status: 500 },
    )
  }
}
