import type { Booking, Trip } from '@/payload-types'

export function formatDatePl(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10)
  return d.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Warsaw',
  })
}

export function tripName(booking: Booking): string {
  if (booking.trip && typeof booking.trip === 'object') {
    return String((booking.trip as Trip).name || 'Wyprawa quadowa')
  }
  return 'Wyprawa quadowa'
}

export function customerName(booking: Booking): string {
  return [booking.customerFirstName, booking.customerLastName].filter(Boolean).join(' ') || '—'
}

export function bookingWhen(booking: Booking): string {
  const date = formatDatePl(booking.bookingDate)
  const start = String(booking.bookingTime || '').slice(0, 5)
  const end = booking.reservationEndTime ? String(booking.reservationEndTime).slice(0, 5) : ''
  return end ? `${date}, ${start}–${end}` : `${date}, ${start}`
}

export function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function emailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #eee;color:#6b6558;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700;">${escapeHtml(value)}</td>
  </tr>`
}
