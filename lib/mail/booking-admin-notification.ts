import { getPayloadClient } from '@/lib/booking'
import {
  bookingWhen,
  customerName,
  emailRow,
  escapeHtml,
  tripName,
} from '@/lib/mail/booking-email-shared'
import { getBookingNotificationAdminEmail } from '@/lib/mail/booking-settings-mail'
import { isMailConfigured, sendMail } from '@/lib/mail/send'
import type { Booking } from '@/payload-types'

function buildAdminNotificationContent(booking: Booking) {
  const when = bookingWhen(booking)
  const name = customerName(booking)
  const deposit = booking.depositAmount ?? 0
  const remaining = booking.remainingAmount ?? 0
  const total = booking.fullPrice ?? 0
  const drivers = booking.drivers ?? 0
  const passengers = booking.passengers ?? 0
  const phone = String(booking.customerPhone || '—')
  const email = String(booking.customerEmail || '—')
  const notes = String(booking.customerNotes || '').trim()
  const site = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://tatraoffroad.pl'
  const adminUrl = `${site.replace(/\/$/, '')}/admin/collections/bookings/${booking.id}`

  const subject = `Nowa rezerwacja #${booking.id} — zaliczka opłacona`

  const text = [
    'Nowa opłacona rezerwacja na stronie.',
    '',
    `Numer: #${booking.id}`,
    `Klient: ${name}`,
    `Telefon: ${phone}`,
    `E-mail: ${email}`,
    `Wyprawa: ${tripName(booking)}`,
    `Termin: ${when}`,
    `Uczestnicy: ${drivers} kier. / ${passengers} pas.`,
    `Zaliczka: ${deposit} zł`,
    `Reszta na miejscu: ${remaining} zł`,
    `Razem: ${total} zł`,
    notes ? `Uwagi: ${notes}` : '',
    '',
    `Panel: ${adminUrl}`,
  ]
    .filter(Boolean)
    .join('\n')

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
              <h1 style="margin:8px 0 0;font-size:22px;line-height:1.2;font-weight:700;text-transform:uppercase;">Nowa rezerwacja</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.5;">Zaliczka została opłacona — rezerwacja jest potwierdzona.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.5;border-top:1px solid #eee;">
                ${emailRow('Numer', `#${booking.id}`)}
                ${emailRow('Klient', name)}
                ${emailRow('Telefon', phone)}
                ${emailRow('E-mail', email)}
                ${emailRow('Wyprawa', tripName(booking))}
                ${emailRow('Termin', when)}
                ${emailRow('Uczestnicy', `${drivers} kier. / ${passengers} pas.`)}
                ${emailRow('Zaliczka', `${deposit} zł`)}
                ${emailRow('Reszta na miejscu', `${remaining} zł`)}
                ${emailRow('Razem', `${total} zł`)}
                ${notes ? emailRow('Uwagi', notes) : ''}
              </table>
              <p style="margin:24px 0 0;font-size:14px;line-height:1.5;">
                <a href="${escapeHtml(adminUrl)}" style="color:#e87722;text-decoration:none;font-weight:700;">Otwórz rezerwację w panelu →</a>
              </p>
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

function sampleBooking(): Booking {
  const now = new Date().toISOString()
  return {
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
    customerEmail: 'klient@example.com',
    customerNotes: 'To jest test powiadomienia admina z panelu.',
    source: 'website',
    status: 'deposit_paid',
    paymentStatus: 'deposit_paid',
    fullPrice: 500,
    depositAmount: 50,
    remainingAmount: 450,
    trip: { id: 0, name: 'Wyprawa testowa', durationHours: 2, price1: 500, price2: 0, deposit: 50, updatedAt: now, createdAt: now },
    updatedAt: now,
    createdAt: now,
  }
}

/**
 * Sends admin notification once after deposit is paid.
 */
export async function sendBookingAdminNotificationEmail(bookingInput: Booking): Promise<void> {
  if ((bookingInput as Booking & { adminNotificationEmailSentAt?: string }).adminNotificationEmailSentAt) return

  const to = await getBookingNotificationAdminEmail()
  if (!to) {
    console.warn(
      `Admin notification skipped for booking #${bookingInput.id}: set bookingNotificationEmail in Rezerwacje → ustawienia`,
    )
    return
  }

  if (!isMailConfigured()) {
    console.warn(
      `Admin notification skipped for booking #${bookingInput.id}: configure SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM`,
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

  if ((booking as Booking & { adminNotificationEmailSentAt?: string }).adminNotificationEmailSentAt) return
  if (booking.paymentStatus !== 'deposit_paid' && booking.status !== 'deposit_paid') return

  const content = buildAdminNotificationContent(booking)
  const result = await sendMail({
    to,
    subject: content.subject,
    text: content.text,
    html: content.html,
    replyTo: String(booking.customerEmail || '').trim() || undefined,
  })

  if (!result.ok) return

  try {
    await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: { adminNotificationEmailSentAt: new Date().toISOString() } as Record<string, string>,
      overrideAccess: true,
    })
  } catch (error) {
    console.error('Failed to mark adminNotificationEmailSentAt', error)
  }
}

export async function sendAdminNotificationTestMail(
  overrideTo?: string,
): Promise<{ ok: boolean; message: string }> {
  const configured = await getBookingNotificationAdminEmail()
  const target = String(overrideTo || configured || '').trim()
  if (!target) {
    return {
      ok: false,
      message: 'Ustaw adres powiadomień admina w polu powyżej i zapisz ustawienia.',
    }
  }

  if (!isMailConfigured()) {
    return { ok: false, message: 'SMTP nie jest skonfigurowane w Environment Variables.' }
  }

  const booking = sampleBooking()
  const content = buildAdminNotificationContent(booking)
  const result = await sendMail({
    to: target,
    subject: `[TEST] ${content.subject}`,
    text: `[TEST — przykładowa rezerwacja]\n\n${content.text}`,
    html: `<p style="margin:0 0 16px;padding:12px;background:#fef3c7;border-left:4px solid #f59e0b;font-family:Arial,sans-serif;font-size:14px;"><strong>TEST</strong> — to jest przykładowe powiadomienie admina.</p>${content.html}`,
  })

  if (result.ok) {
    return {
      ok: true,
      message: `Wysłano test powiadomienia admina na ${target}. Sprawdź skrzynkę (i spam).`,
    }
  }
  return {
    ok: false,
    message: result.skipped ? 'SMTP nie jest skonfigurowane.' : `Nie wysłano: ${result.error || 'nieznany błąd'}`,
  }
}
