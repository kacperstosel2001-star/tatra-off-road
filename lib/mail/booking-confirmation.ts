import { getPayloadClient } from '@/lib/booking'
import { sendBookingAdminNotificationEmail } from '@/lib/mail/booking-admin-notification'
import {
  bookingWhen,
  customerName,
  emailRow,
  escapeHtml,
  tripName,
} from '@/lib/mail/booking-email-shared'
import { sendMail, isMailConfigured } from '@/lib/mail/send'
import type { Booking } from '@/payload-types'

function buildConfirmationContent(booking: Booking) {
  const when = bookingWhen(booking)
  const name = customerName(booking)
  const displayName = name === '—' ? 'Kliencie' : name
  const deposit = booking.depositAmount ?? 0
  const remaining = booking.remainingAmount ?? 0
  const total = booking.fullPrice ?? 0
  const drivers = booking.drivers ?? 0
  const passengers = booking.passengers ?? 0
  const phone = process.env.PUBLIC_CONTACT_PHONE || '+48 530 198 735'
  const site = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://tatraoffroad.pl'

  const subject = `Potwierdzenie rezerwacji #${booking.id} — Tatra Off-Road`

  const text = [
    `Cześć ${displayName},`,
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
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Cześć ${escapeHtml(displayName)},</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.5;">Dziękujemy — zaliczka została opłacona. Rezerwacja jest potwierdzona.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.5;border-top:1px solid #eee;">
                ${emailRow('Numer', `#${booking.id}`)}
                ${emailRow('Wyprawa', tripName(booking))}
                ${emailRow('Termin', when)}
                ${emailRow('Uczestnicy', `${drivers} kier. / ${passengers} pas.`)}
                ${emailRow('Zaliczka', `${deposit} zł`)}
                ${emailRow('Reszta na miejscu', `${remaining} zł`)}
                ${emailRow('Razem', `${total} zł`)}
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

  if (bookingInput.confirmationEmailSentAt) return

  if (!isMailConfigured()) {
    console.warn(
      `Confirmation email skipped for booking #${bookingInput.id}: configure SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM`,
    )
    return
  }

  const payload = await getPayloadClient()
  const booking = (await payload.findByID({
    collection: 'bookings',
    id: bookingInput.id,
    depth: 1,
    overrideAccess: true,
  })) as Booking

  if (booking.confirmationEmailSentAt) return
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
      data: { confirmationEmailSentAt: new Date().toISOString() },
      overrideAccess: true,
    })
  } catch (error) {
    console.error('Failed to mark confirmationEmailSentAt', error)
  }
}

/** Customer + admin emails after deposit is paid. */
export async function sendBookingPaidEmails(booking: Booking): Promise<void> {
  await Promise.all([
    sendBookingConfirmationEmail(booking),
    sendBookingAdminNotificationEmail(booking),
  ])
}

export async function sendCustomerConfirmationTestMail(
  to: string,
): Promise<{ ok: boolean; message: string }> {
  const target = String(to || '').trim()
  if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
    return { ok: false, message: 'Podaj prawidłowy adres e-mail do testu.' }
  }

  if (!isMailConfigured()) {
    return { ok: false, message: 'SMTP nie jest skonfigurowane w Environment Variables.' }
  }

  const now = new Date().toISOString()
  const booking: Booking = {
    id: 'TEST',
    bookingDate: now,
    bookingTime: '09:00',
    reservationEndTime: '11:00',
    durationHours: 2,
    drivers: 1,
    passengers: 1,
    customerFirstName: 'Jan',
    customerLastName: 'Kowalski',
    customerPhone: '+48 500 000 000',
    customerEmail: target,
    source: 'website',
    status: 'deposit_paid',
    paymentStatus: 'deposit_paid',
    fullPrice: 500,
    depositAmount: 50,
    remainingAmount: 450,
    trip: {
      id: 0,
      name: 'Wyprawa testowa',
      durationHours: 2,
      price1: 500,
      price2: 0,
      deposit: 50,
      updatedAt: now,
      createdAt: now,
    },
    updatedAt: now,
    createdAt: now,
  }

  const content = buildConfirmationContent(booking)
  const result = await sendMail({
    to: target,
    subject: `[TEST] ${content.subject}`,
    text: `[TEST — przykładowa rezerwacja]\n\n${content.text}`,
    html: `<p style="margin:0 0 16px;padding:12px;background:#fef3c7;border-left:4px solid #f59e0b;font-family:Arial,sans-serif;font-size:14px;"><strong>TEST</strong> — to jest przykładowe potwierdzenie dla klienta.</p>${content.html}`,
  })

  if (result.ok) {
    return {
      ok: true,
      message: `Wysłano test potwierdzenia klienta na ${target}. Sprawdź skrzynkę (i spam).`,
    }
  }
  return {
    ok: false,
    message: result.skipped ? 'SMTP nie jest skonfigurowane.' : `Nie wysłano: ${result.error || 'nieznany błąd'}`,
  }
}
