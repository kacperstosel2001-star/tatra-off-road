import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendAdminNotificationTestMail } from '@/lib/mail/booking-admin-notification'
import { sendCustomerConfirmationTestMail } from '@/lib/mail/booking-confirmation'
import { getBookingNotificationAdminEmail } from '@/lib/mail/booking-settings-mail'
import { getMailConfigSummary, verifyMailConnection } from '@/lib/mail/send'

async function requireAdmin() {
  const payload = await getPayload({ config })
  const headerStore = await nextHeaders()
  const { user } = await payload.auth({ headers: headerStore })
  return { payload, user }
}

export async function GET() {
  try {
    const { user } = await requireAdmin()
    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'Zaloguj się w panelu admina.' },
        { status: 401 },
      )
    }
    const adminNotificationEmail = await getBookingNotificationAdminEmail()
    return NextResponse.json({
      ok: true,
      message: 'Status SMTP',
      config: getMailConfigSummary(),
      adminNotificationEmail,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Błąd' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAdmin()
    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'Zaloguj się w panelu admina, żeby testować SMTP.' },
        { status: 401 },
      )
    }

    const body = await request.json().catch(() => ({}))
    const action = String(body.action || 'verify')
    const smtpConfig = getMailConfigSummary()
    const adminNotificationEmail = await getBookingNotificationAdminEmail()

    if (action === 'send_customer') {
      const result = await sendCustomerConfirmationTestMail(String(body.to || user.email || ''))
      return NextResponse.json(
        { ...result, config: smtpConfig, adminNotificationEmail },
        { status: result.ok ? 200 : 400 },
      )
    }

    if (action === 'send_admin') {
      const result = await sendAdminNotificationTestMail(
        String(body.to || adminNotificationEmail || ''),
      )
      return NextResponse.json(
        { ...result, config: smtpConfig, adminNotificationEmail },
        { status: result.ok ? 200 : 400 },
      )
    }

    const result = await verifyMailConnection()
    return NextResponse.json(
      { ...result, config: smtpConfig, adminNotificationEmail },
      { status: result.ok ? 200 : 400 },
    )
  } catch (error) {
    console.error('Mail test', error)
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Błąd testu SMTP',
        config: getMailConfigSummary(),
      },
      { status: 500 },
    )
  }
}
