import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/booking'
import { getCashBillClient } from '@/lib/cashbill/config'
import { extractPaymentStatus, isFailedStatus, isPaidStatus, verifyNotificationSign } from '@/lib/cashbill/client'
import { upsertBookingGoogleEvent } from '@/lib/gcal/client'
import { sendBookingPaidEmails } from '@/lib/mail/booking-confirmation'

/**
 * CashBill notification endpoint.
 * Configure in CashBill panel as:
 *   https://YOUR_DOMAIN/api/payments/cashbill/notify
 *
 * Ważne: wyłącz ochronę Cloudflare / Bot Fight Mode dla tej ścieżki,
 * inaczej powiadomienia nie dochodzą i rezerwacja zostaje „oczekująca”.
 */
async function handleNotify(request: Request) {
  const url = new URL(request.url)
  let cmd = url.searchParams.get('cmd') || ''
  let args = url.searchParams.get('args') || ''
  let sign = url.searchParams.get('sign') || ''

  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await request.formData()
      cmd = String(form.get('cmd') || cmd)
      args = String(form.get('args') || args)
      sign = String(form.get('sign') || sign)
    } else if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}))
      cmd = String(body.cmd || cmd)
      args = String(body.args || args)
      sign = String(body.sign || sign)
    }
  }

  if (!cmd || !args || !sign) {
    console.warn('CashBill notify: missing parameters', { cmd: Boolean(cmd), args: Boolean(args), sign: Boolean(sign) })
    return new NextResponse('Missing parameters', { status: 400 })
  }

  const { client, cfg } = await getCashBillClient()
  if (!verifyNotificationSign(cmd, args, sign, cfg.secret)) {
    console.warn('CashBill notify: invalid signature', { cmd, args, mode: cfg.mode, shopId: cfg.shopId })
    return new NextResponse('Invalid signature', { status: 401 })
  }

  if (cmd !== 'transactionStatusChanged') {
    return new NextResponse('OK', { status: 200 })
  }

  const payment = await client.getPayment(args)
  const status = extractPaymentStatus(payment)
  console.log('CashBill notify', {
    paymentId: payment.id,
    status,
    additionalData: payment.additionalData,
    mode: cfg.mode,
  })

  const payload = await getPayloadClient()

  const bookingIdFromAdditional = payment.additionalData ? String(payment.additionalData).trim() : ''
  const found = await payload.find({
    collection: 'bookings',
    where: {
      or: [
        { cashbillPaymentId: { equals: payment.id } },
        ...(bookingIdFromAdditional
          ? [
              { id: { equals: bookingIdFromAdditional } },
              // czasem additionalData bywa liczbą w stringu
              ...(Number.isFinite(Number(bookingIdFromAdditional))
                ? [{ id: { equals: Number(bookingIdFromAdditional) } }]
                : []),
            ]
          : []),
      ],
    },
    limit: 5,
    depth: 1,
    overrideAccess: true,
  })

  let booking = found.docs[0]
  if (!booking) {
    console.warn('CashBill notify: booking not found for payment', payment.id, status, bookingIdFromAdditional)
    return new NextResponse('OK', { status: 200 })
  }

  if (isPaidStatus(status)) {
    try {
      booking = await payload.update({
        collection: 'bookings',
        id: booking.id,
        data: {
          status: 'deposit_paid',
          paymentStatus: 'deposit_paid',
          cashbillPaymentId: payment.id,
          expiresAt: null,
        },
        depth: 1,
        overrideAccess: true,
      })
    } catch (error) {
      console.error('CashBill notify: failed to mark deposit_paid', booking.id, error)
      return new NextResponse('Error', { status: 500 })
    }

    if (!booking.gcalEventId) {
      try {
        const eventId = await upsertBookingGoogleEvent(booking as any)
        if (eventId) {
          booking = await payload.update({
            collection: 'bookings',
            id: booking.id,
            data: { gcalEventId: eventId },
            depth: 1,
            overrideAccess: true,
            context: { skipGcalSync: true },
          })
        }
      } catch (error) {
        console.error('CashBill notify: GCal sync failed', booking.id, error)
      }
    }

    try {
      await sendBookingPaidEmails(booking as any)
    } catch (error) {
      console.error('CashBill notify: confirmation email failed', error)
    }
  } else if (isFailedStatus(status) && booking.status === 'pending') {
    try {
      await payload.update({
        collection: 'bookings',
        id: booking.id,
        data: {
          paymentStatus: 'unpaid',
        },
        overrideAccess: true,
      })
    } catch (error) {
      console.error('CashBill notify: failed to mark unpaid', booking.id, error)
    }
  }

  return new NextResponse('OK', { status: 200 })
}

export async function GET(request: Request) {
  try {
    return await handleNotify(request)
  } catch (error) {
    console.error('CashBill notify GET', error)
    return new NextResponse('Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    return await handleNotify(request)
  } catch (error) {
    console.error('CashBill notify POST', error)
    return new NextResponse('Error', { status: 500 })
  }
}
