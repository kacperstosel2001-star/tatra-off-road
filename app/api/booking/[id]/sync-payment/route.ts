import { NextResponse } from 'next/server'
import { tripToDTO } from '@/lib/booking'
import { syncBookingPayment } from '@/lib/cashbill/sync'
import type { Trip } from '@/payload-types'

type Params = { params: Promise<{ id: string }> }

function serializeBooking(booking: Awaited<ReturnType<typeof syncBookingPayment>>['booking']) {
  const trip =
    booking.trip && typeof booking.trip === 'object' ? tripToDTO(booking.trip as Trip) : null

  return {
    id: booking.id,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    paymentMethod: booking.paymentMethod,
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    reservationEndTime: booking.reservationEndTime,
    drivers: booking.drivers,
    passengers: booking.passengers,
    people: booking.people,
    customerFirstName: booking.customerFirstName,
    customerLastName: booking.customerLastName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail,
    fullPrice: booking.fullPrice,
    depositAmount: booking.depositAmount,
    remainingAmount: booking.remainingAmount,
    expiresAt: booking.expiresAt,
    cashbillPaymentId: booking.cashbillPaymentId,
    cashbillChannel: booking.cashbillChannel,
    trip,
  }
}

export async function POST(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const result = await syncBookingPayment(id)
    return NextResponse.json({
      ok: true,
      paid: result.paid,
      failed: result.failed,
      cashbillStatus: result.cashbillStatus,
      booking: serializeBooking(result.booking),
    })
  } catch (error) {
    console.error('POST /api/booking/[id]/sync-payment', error)
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Nie udało się zsynchronizować płatności.',
      },
      { status: 500 },
    )
  }
}
