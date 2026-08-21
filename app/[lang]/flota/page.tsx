import { permanentRedirect } from 'next/navigation'
import { localePath } from '@/lib/i18n'

/** Fleet page removed — redirect to home. */
export default async function FleetPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = lang === 'en' ? 'en' : 'pl'
  permanentRedirect(localePath(locale, '/'))
}
