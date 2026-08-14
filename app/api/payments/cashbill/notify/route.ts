import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/booking'
import { getCashBillClient } from '@/lib/cashbill/config'
import { extractPaymentStatus, isFailedStatus, isPaidStatus, verifyNotificationSign } from '@/lib/cashbill/client'
import { upsertBookingGoogleEvent } from '@/lib/gcal/client'

/**
 * CashBill notification endpoint.
 * Configure in CashBill panel as:
 *   https://YOUR_DOMAIN/api/payments/cashbill/notify
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
    return new NextResponse('Missing parameters', { status: 400 })
  }

  const { client, cfg } = await getCashBillClient()
  if (!verifyNotificationSign(cmd, args, sign, cfg.secret)) {
    return new NextResponse('Invalid signature', { status: 401 })
  }

  if (cmd !== 'transactionStatusChanged') {
    return new NextResponse('OK', { status: 200 })
  }

  const payment = await client.getPayment(args)
  const status = extractPaymentStatus(payment)
  const payload = await getPayloadClient()

  const bookingIdFromAdditional = payment.additionalData ? String(payment.additionalData) : ''
  const found = await payload.find({
    collection: 'bookings',
    where: {
      or: [
        { cashbillPaymentId: { equals: payment.id } },
        ...(bookingIdFromAdditional ? [{ id: { equals: bookingIdFromAdditional } }] : []),
      ],
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  let booking = found.docs[0]
  if (!booking) {
    console.warn('CashBill notify: booking not found for payment', payment.id, status)
    return new NextResponse('OK', { status: 200 })
  }

  if (isPaidStatus(status)) {
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

    if (!booking.gcalEventId) {
      const eventId = await upsertBookingGoogleEvent(booking as any)
      if (eventId) {
        await payload.update({
          collection: 'bookings',
          id: booking.id,
          data: { gcalEventId: eventId },
          overrideAccess: true,
        })
      }
    }
  } else if (isFailedStatus(status) && booking.status === 'pending') {
    await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: {
        paymentStatus: 'unpaid',
      },
      overrideAccess: true,
    })
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
