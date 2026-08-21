import { getPayloadClient } from '@/lib/booking'
import { sendMail, isMailConfigured } from '@/lib/mail/send'
import type { Booking, Trip } from '@/payload-types'

function formatDatePl(value: string | null | undefined): string {
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

function tripName(booking: Booking): string {
  if (booking.trip && typeof booking.trip === 'object') {
    return String((booking.trip as Trip).name || 'Wyprawa quadowa')
  }
  return 'Wyprawa quadowa'
}

function buildConfirmationContent(booking: Booking) {
  const date = formatDatePl(booking.bookingDate)
  const start = String(booking.bookingTime || '').slice(0, 5)
  const end = booking.reservationEndTime ? String(booking.reservationEndTime).slice(0, 5) : ''
  const when = end ? `${date}, ${start}–${end}` : `${date}, ${start}`
  const name = [booking.customerFirstName, booking.customerLastName].filter(Boolean).join(' ') || 'Kliencie'
  const deposit = booking.depositAmount ?? 0
  const remaining = booking.remainingAmount ?? 0
  const total = booking.fullPrice ?? 0
  const drivers = booking.drivers ?? 0
  const passengers = booking.passengers ?? 0
  const phone = process.env.PUBLIC_CONTACT_PHONE || '+48 888 254 223'
  const site = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://tatraoffroad.pl'

  const subject = `Potwierdzenie rezerwacji #${booking.id} — Tatra Off-Road`

  const text = [
    `Cześć ${name},`,
    '',
    'Dziękujemy — zaliczka została opłacona. Rezerwacja jest potwierdzona.',
    '',
    `Numer: #${booking.id}`,
    `Wyprawa: ${tripName(booking)}`,
    `Termin: ${when}`,
    `Uczestnicy: ${drivers} kier. / ${passengers} pas.`,
    `Zaliczka: ${deposit} zł`,
    `Reszta na miejscu: ${remaining} zł`,
    `Razem: ${total} zł`,
    '',
    'Ważne przed przyjazdem:',
    '• Bądź 15 minut wcześniej na miejscu.',
    '• Kierowca musi mieć prawo jazdy kat. B.',
    '• Resztę kwoty dopłacasz na miejscu przed startem.',
    '',
    `Pytania? Zadzwoń: ${phone}`,
    site,
    '',
    'Do zobaczenia na trasie!',
    'Tatra Off-Road',
  ].join('\n')

  const html = `
<!DOCTYPE html>
<html lang="pl">
<body style="margin:0;padding:0;background:#f5f1e7;font-family:Arial,Helvetica,sans-serif;color:#0f0d0a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f1e7;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #ddd6c6;">
          <tr>
            <td style="background:#0f0d0a;color:#f5f1e7;padding:20px 24px;">
              <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#e87722;">Tatra Off-Road</div>
              <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2;font-weight:700;text-transform:uppercase;">Rezerwacja potwierdzona</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Cześć ${escapeHtml(name)},</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.5;">Dziękujemy — zaliczka została opłacona. Rezerwacja jest potwierdzona.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.5;border-top:1px solid #eee;">
                ${row('Numer', `#${booking.id}`)}
                ${row('Wyprawa', tripName(booking))}
                ${row('Termin', when)}
                ${row('Uczestnicy', `${drivers} kier. / ${passengers} pas.`)}
                ${row('Zaliczka', `${deposit} zł`)}
                ${row('Reszta na miejscu', `${remaining} zł`)}
                ${row('Razem', `${total} zł`)}
              </table>
              <div style="margin:24px 0;padding:16px;background:#f5f1e7;border-left:4px solid #e87722;">
                <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">Ważne przed przyjazdem</p>
                <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.55;">
                  <li>Bądź <strong>15 minut wcześniej</strong> na miejscu.</li>
                  <li>Kierowca musi mieć <strong>prawo jazdy kat. B</strong>.</li>
                  <li>Resztę kwoty dopłacasz na miejscu przed startem.</li>
                </ul>
              </div>
              <p style="margin:0;font-size:14px;line-height:1.5;">Pytania? Zadzwoń: <a href="tel:${phone.replace(/\s/g, '')}" style="color:#e87722;text-decoration:none;">${phone}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()

  return { subject, text, html }
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #eee;color:#6b6558;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700;">${escapeHtml(value)}</td>
  </tr>`
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Sends customer confirmation once after deposit is paid.
 * Safe to call from CashBill notify and return sync.
 */
export async function sendBookingConfirmationEmail(bookingInput: Booking): Promise<void> {
  const to = String(bookingInput.customerEmail || '').trim()
  if (!to) {
    console.warn(`Confirmation email skipped for booking #${bookingInput.id}: no customer email`)
    return
  }

  if ((bookingInput as any).confirmationEmailSentAt) return

  if (!isMailConfigured()) {
    console.warn(
      `Confirmation email skipped for booking #${bookingInput.id}: configure SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM`,
    )
    return
  }

  const payload = await getPayloadClient()
  // Re-read to avoid duplicate sends under concurrent notify + sync
  const booking = (await payload.findByID({
    collection: 'bookings',
    id: bookingInput.id,
    depth: 1,
    overrideAccess: true,
  })) as Booking

  if ((booking as any).confirmationEmailSentAt) return
  if (booking.paymentStatus !== 'deposit_paid' && booking.status !== 'deposit_paid') return

  const content = buildConfirmationContent(booking)
  const result = await sendMail({
    to,
    subject: content.subject,
    text: content.text,
    html: content.html,
  })

  if (!result.ok) return

  try {
    await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: { confirmationEmailSentAt: new Date().toISOString() } as any,
      overrideAccess: true,
    })
  } catch (error) {
    console.error('Failed to mark confirmationEmailSentAt', error)
  }
}
