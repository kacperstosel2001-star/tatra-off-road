import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { syncBookingPayment } from '@/lib/cashbill/sync'
import { upsertBookingGoogleEvent } from '@/lib/gcal/client'
import { sendBookingPaidEmails } from '@/lib/mail/booking-confirmation'
import type { Booking } from '@/payload-types'

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const payload = await getPayload({ config })
  const headerStore = await nextHeaders()
  const { user } = await payload.auth({ headers: headerStore })
  return { payload, user }
}

/**
 * Admin: dociągnij status z CashBill → deposit_paid + GCal + maile.
 * body.forcePaid = true — ustaw opłacone ręcznie (gdy CashBill w panelu jest OK, a API nie zwraca).
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const { payload, user } = await requireAdmin()
    if (!user) {
      return NextResponse.json({ ok: false, message: 'Zaloguj się w panelu admina.' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const forcePaid = Boolean(body.forcePaid)

    let booking = (await payload.findByID({
      collection: 'bookings',
      id,
      depth: 1,
      overrideAccess: true,
    })) as Booking

    if (forcePaid) {
      booking = (await payload.update({
        collection: 'bookings',
        id: booking.id,
        data: {
          status: 'deposit_paid',
          paymentStatus: 'deposit_paid',
          expiresAt: null,
        },
        depth: 1,
        overrideAccess: true,
      })) as Booking

      if (!booking.gcalEventId) {
        try {
          const eventId = await upsertBookingGoogleEvent(booking)
          if (eventId) {
            booking = (await payload.update({
              collection: 'bookings',
              id: booking.id,
              data: { gcalEventId: eventId },
              depth: 1,
              overrideAccess: true,
              context: { skipGcalSync: true },
            })) as Booking
          }
        } catch (error) {
          console.error('Admin force-paid GCal failed', error)
        }
      }

      try {
        await sendBookingPaidEmails(booking)
      } catch (error) {
        console.error('Admin force-paid emails failed', error)
      }

      return NextResponse.json({
        ok: true,
        paid: true,
        forced: true,
        message: `Ustawiono opłacone ręcznie. Status: ${booking.status}. GCal: ${booking.gcalEventId || 'brak'}.`,
        booking: {
          id: booking.id,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          gcalEventId: booking.gcalEventId,
          cashbillPaymentId: booking.cashbillPaymentId,
        },
      })
    }

    if (!booking.cashbillPaymentId) {
      return NextResponse.json(
        {
          ok: false,
          message:
            'Brak CashBill Payment ID przy tej rezerwacji. Wklej ID z panelu CashBill do pola „CashBill Payment ID” i zapisz, albo użyj „Oznacz opłacone + GCal”.',
        },
        { status: 400 },
      )
    }

    const result = await syncBookingPayment(id)
    return NextResponse.json({
      ok: true,
      paid: result.paid,
      failed: result.failed,
      cashbillStatus: result.cashbillStatus,
      message: result.paid
        ? `CashBill: ${result.cashbillStatus || 'opłacone'}. Status zaktualizowany. GCal: ${result.booking.gcalEventId || 'próba zapisu'}.`
        : result.failed
          ? `CashBill: ${result.cashbillStatus} — płatność nieudana.`
          : `CashBill nadal: ${result.cashbillStatus || 'brak statusu'}. Jeśli w panelu CashBill jest opłacone, użyj „Oznacz opłacone + GCal”.`,
      booking: {
        id: result.booking.id,
        status: result.booking.status,
        paymentStatus: result.booking.paymentStatus,
        gcalEventId: result.booking.gcalEventId,
        cashbillPaymentId: result.booking.cashbillPaymentId,
      },
    })
  } catch (error) {
    console.error('Admin booking sync-payment', error)
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Błąd synchronizacji CashBill',
      },
      { status: 500 },
    )
  }
}
