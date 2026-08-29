import { getPayloadClient } from '@/lib/booking'
import type { BookingSetting } from '@/payload-types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(String(value || '').trim())
}

export async function getBookingSettings(): Promise<BookingSetting | null> {
  try {
    const payload = await getPayloadClient()
    return (await payload.findGlobal({
      slug: 'booking-settings',
      overrideAccess: true,
    })) as BookingSetting
  } catch (error) {
    console.error('Failed to load booking-settings global', error)
    return null
  }
}

/** Admin inbox for new booking notifications — configured in panel. */
export async function getBookingNotificationAdminEmail(): Promise<string | null> {
  const settings = await getBookingSettings()
  const email = String(settings?.bookingNotificationEmail || '').trim()
  return isValidEmail(email) ? email : null
}
