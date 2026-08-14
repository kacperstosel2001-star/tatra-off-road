import { NextResponse } from 'next/server'
import { tripToDTO } from '@/lib/booking'
import { getPayloadClient } from '@/lib/booking'
import { syncBookingPayment } from '@/lib/cashbill/sync'
import type { Trip } from '@/payload-types'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const sync = url.searchParams.get('sync') === '1' || url.searchParams.get('payment') === 'return'

    let booking
    let cashbillStatus: string | null = null
    let paid = false

    if (sync) {
      const result = await syncBookingPayment(id)
      booking = result.booking
      cashbillStatus = result.cashbillStatus
      paid = result.paid
    } else {
      const payload = await getPayloadClient()
      booking = await payload.findByID({
        collection: 'bookings',
        id,
        depth: 1,
        overrideAccess: true,
      })
      paid = booking.paymentStatus === 'deposit_paid' || booking.status === 'deposit_paid'
    }

    const trip =
      booking.trip && typeof booking.trip === 'object' ? tripToDTO(booking.trip as Trip) : null

    return NextResponse.json({
      paid,
      cashbillStatus,
      booking: {
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
      },
    })
  } catch (error) {
    console.error('GET /api/booking/[id]', error)
    return NextResponse.json({ message: 'Nie znaleziono rezerwacji.' }, { status: 404 })
  }
}
