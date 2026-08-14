import { getPayloadClient } from '@/lib/booking'
import { getCashBillClient } from '@/lib/cashbill/config'
import { extractPaymentStatus, isFailedStatus, isPaidStatus } from '@/lib/cashbill/client'
import { upsertBookingGoogleEvent } from '@/lib/gcal/client'
import type { Booking } from '@/payload-types'

export type SyncPaymentResult = {
  booking: Booking
  cashbillStatus: string | null
  paid: boolean
  failed: boolean
  gcalEventId?: string
}

async function ensureGoogleCalendarEvent(booking: Booking): Promise<Booking> {
  if (booking.gcalEventId) return booking
  try {
    const eventId = await upsertBookingGoogleEvent(booking)
    if (!eventId) return booking
    const payload = await getPayloadClient()
    return (await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: { gcalEventId: eventId },
      depth: 1,
      overrideAccess: true,
    })) as Booking
  } catch (error) {
    console.error('GCal sync after payment failed', error)
    return booking
  }
}

export async function syncBookingPayment(bookingId: string | number): Promise<SyncPaymentResult> {
  const payload = await getPayloadClient()
  let booking = (await payload.findByID({
    collection: 'bookings',
    id: bookingId,
    depth: 1,
    overrideAccess: true,
  })) as Booking

  if (booking.paymentStatus === 'deposit_paid' || booking.status === 'deposit_paid') {
    booking = await ensureGoogleCalendarEvent(booking)
    return {
      booking,
      cashbillStatus: 'PositiveFinish',
      paid: true,
      failed: false,
      gcalEventId: booking.gcalEventId || undefined,
    }
  }

  if (!booking.cashbillPaymentId) {
    return { booking, cashbillStatus: null, paid: false, failed: false }
  }

  const { client } = await getCashBillClient()
  const payment = await client.getPayment(String(booking.cashbillPaymentId))
  const cashbillStatus = extractPaymentStatus(payment)

  if (isPaidStatus(cashbillStatus)) {
    booking = (await payload.update({
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
    })) as Booking
    booking = await ensureGoogleCalendarEvent(booking)
    return {
      booking,
      cashbillStatus,
      paid: true,
      failed: false,
      gcalEventId: booking.gcalEventId || undefined,
    }
  }

  if (isFailedStatus(cashbillStatus)) {
    booking = (await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: {
        paymentStatus: 'unpaid',
      },
      depth: 1,
      overrideAccess: true,
    })) as Booking
    return { booking, cashbillStatus, paid: false, failed: true }
  }

  return { booking, cashbillStatus, paid: false, failed: false }
}
