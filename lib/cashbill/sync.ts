import { getPayloadClient } from '@/lib/booking'
import { getCashBillClient } from '@/lib/cashbill/config'
import { extractPaymentStatus, isFailedStatus, isPaidStatus } from '@/lib/cashbill/client'
import { upsertBookingGoogleEvent } from '@/lib/gcal/client'
import { sendBookingPaidEmails } from '@/lib/mail/booking-confirmation'
import type { Booking } from '@/payload-types'

export type SyncPaymentResult = {
  booking: Booking
  cashbillStatus: string | null
  paid: boolean
  failed: boolean
  gcalEventId?: string
}

export type ReconcileResult = {
  checked: number
  paid: number
  failed: number
  gcalFixed: number
  errors: number
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
      context: { skipGcalSync: true },
    })) as Booking
  } catch (error) {
    console.error('GCal sync after payment failed', error)
    return booking
  }
}

async function afterDepositPaid(booking: Booking): Promise<Booking> {
  booking = await ensureGoogleCalendarEvent(booking)
  try {
    await sendBookingPaidEmails(booking)
  } catch (error) {
    console.error('Confirmation email after payment failed', error)
  }
  return booking
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
    booking = await afterDepositPaid(booking)
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
    booking = await afterDepositPaid(booking)
    return {
      booking,
      cashbillStatus,
      paid: true,
      failed: false,
      gcalEventId: booking.gcalEventId || undefined,
    }
  }

  console.warn('CashBill sync: payment not paid yet', {
    bookingId: booking.id,
    paymentId: booking.cashbillPaymentId,
    cashbillStatus,
    rawStatus: payment.status,
  })

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

let reconcileInFlight: Promise<ReconcileResult> | null = null
let lastReconcileAt = 0

/**
 * Automatycznie dociąga opłacone płatności z CashBill (gdy webhook nie doszedł)
 * i dokłada brakujące eventy Google Calendar.
 */
export async function reconcilePendingCashBillPayments(options?: {
  force?: boolean
  limit?: number
}): Promise<ReconcileResult> {
  const force = Boolean(options?.force)
  const now = Date.now()
  // Max co 2 min przy force z crona/intervalu — chroni przed nakładaniem się ticków
  if (!force && now - lastReconcileAt < 120_000) {
    return { checked: 0, paid: 0, failed: 0, gcalFixed: 0, errors: 0 }
  }
  if (reconcileInFlight) return reconcileInFlight

  reconcileInFlight = (async () => {
    lastReconcileAt = Date.now()
    const result: ReconcileResult = {
      checked: 0,
      paid: 0,
      failed: 0,
      gcalFixed: 0,
      errors: 0,
    }

    try {
      const payload = await getPayloadClient()
      const limit = Math.min(20, Math.max(1, options?.limit ?? 10))

      const pendingWhere = {
        and: [
          { cashbillPaymentId: { exists: true } },
          {
            or: [
              { status: { equals: 'pending' } },
              { status: { equals: 'expired' } },
              {
                and: [
                  { paymentStatus: { equals: 'unpaid' } },
                  { status: { not_equals: 'cancelled' } },
                ],
              },
            ],
          },
        ],
      }

      const missingGcalWhere = {
        and: [
          {
            or: [
              { status: { equals: 'deposit_paid' } },
              { paymentStatus: { equals: 'deposit_paid' } },
            ],
          },
          {
            or: [{ gcalEventId: { exists: false } }, { gcalEventId: { equals: null } }],
          },
        ],
      }

      // Tani check — jak nic nie czeka, zero requestów do CashBill
      const [pendingProbe, gcalProbe] = await Promise.all([
        payload.find({
          collection: 'bookings',
          where: pendingWhere as any,
          limit: 1,
          depth: 0,
          overrideAccess: true,
        }),
        payload.find({
          collection: 'bookings',
          where: missingGcalWhere as any,
          limit: 1,
          depth: 0,
          overrideAccess: true,
        }),
      ])

      if (pendingProbe.totalDocs === 0 && gcalProbe.totalDocs === 0) {
        return result
      }

      if (pendingProbe.totalDocs > 0) {
        const pending = await payload.find({
          collection: 'bookings',
          where: pendingWhere as any,
          limit,
          depth: 0,
          overrideAccess: true,
          sort: '-updatedAt',
        })

        for (const doc of pending.docs) {
          result.checked += 1
          try {
            const synced = await syncBookingPayment(doc.id)
            if (synced.paid) result.paid += 1
            if (synced.failed) result.failed += 1
          } catch (error) {
            result.errors += 1
            console.error('CashBill reconcile sync failed', doc.id, error)
          }
        }
      }

      if (gcalProbe.totalDocs > 0) {
        const missingGcal = await payload.find({
          collection: 'bookings',
          where: missingGcalWhere as any,
          limit,
          depth: 1,
          overrideAccess: true,
          sort: '-updatedAt',
        })

        for (const doc of missingGcal.docs as Booking[]) {
          result.checked += 1
          try {
            const before = doc.gcalEventId
            const updated = await afterDepositPaid(doc)
            if (!before && updated.gcalEventId) result.gcalFixed += 1
          } catch (error) {
            result.errors += 1
            console.error('CashBill reconcile GCal failed', doc.id, error)
          }
        }
      }

      if (result.paid > 0 || result.gcalFixed > 0 || result.errors > 0) {
        console.log('[tatra] CashBill reconcile', result)
      }
    } catch (error) {
      result.errors += 1
      console.error('[tatra] CashBill reconcile failed', error)
    }

    return result
  })()

  try {
    return await reconcileInFlight
  } finally {
    reconcileInFlight = null
  }
}

/** Fire-and-forget — nie blokuje response API. */
export function triggerCashBillReconcileInBackground(reason: string) {
  void reconcilePendingCashBillPayments()
    .then((result) => {
      if (result.paid > 0 || result.gcalFixed > 0) {
        console.log(`[tatra] CashBill reconcile (${reason})`, result)
      }
    })
    .catch((error) => console.error(`[tatra] CashBill reconcile (${reason}) failed`, error))
}
