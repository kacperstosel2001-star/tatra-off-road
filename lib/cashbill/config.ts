import { getPayloadClient } from '@/lib/booking'
import { CashBillClient, type CashBillMode } from '@/lib/cashbill/client'

export type CashBillRuntimeConfig = {
  shopId: string
  secret: string
  mode: CashBillMode
  liveEnabled: boolean
  appUrl: string
}

function isLocalAppUrl(url: string) {
  return !url || /localhost|127\.0\.0\.1/i.test(url)
}

/** Prefer env, otherwise rebuild from the incoming Hostinger/proxy request. */
export function resolvePublicAppUrl(request?: Request, configured?: string): string {
  const fromEnv = String(
    configured ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      '',
  )
    .trim()
    .replace(/\/$/, '')

  if (fromEnv && !isLocalAppUrl(fromEnv) && /^https?:\/\//i.test(fromEnv)) {
    return fromEnv
  }

  if (request) {
    const host = (
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host') ||
      ''
    )
      .split(',')[0]
      .trim()
    const proto = (
      request.headers.get('x-forwarded-proto') ||
      (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https')
    )
      .split(',')[0]
      .trim()

    if (host && !/localhost|127\.0\.0\.1/i.test(host)) {
      return `${proto}://${host}`.replace(/\/$/, '')
    }
  }

  if (fromEnv) return fromEnv
  return 'http://127.0.0.1:3005'
}

export function assertCashBillReturnUrl(appUrl: string) {
  if (isLocalAppUrl(appUrl) || !/^https:\/\//i.test(appUrl)) {
    throw new Error(
      `CashBill wymaga publicznego HTTPS (APP_URL). Teraz jest: ${appUrl || '(puste)'}. ` +
        `Ustaw APP_URL i NEXT_PUBLIC_APP_URL na https://palegoldenrod-tapir-356599.hostingersite.com ` +
        `(albo docelową domenę) w Hostinger → Environment variables.`,
    )
  }
}

export async function getCashBillRuntimeConfig(request?: Request): Promise<CashBillRuntimeConfig> {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({
    slug: 'booking-settings',
    overrideAccess: true,
  })

  const liveEnabled = Boolean(settings.cashbillLiveEnabled)
  const mode: CashBillMode = liveEnabled ? 'live' : 'test'

  const shopId =
    String(settings.cashbillShopId || process.env.CASHBILL_SHOP_ID || '').trim() ||
    'tatraoffroad.pl'
  const secret =
    String(settings.cashbillSecret || process.env.CASHBILL_SECRET || '').trim()

  const appUrl = resolvePublicAppUrl(request, process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL)

  return { shopId, secret, mode, liveEnabled, appUrl }
}

export async function getCashBillClient(request?: Request) {
  const cfg = await getCashBillRuntimeConfig(request)
  if (!cfg.secret) {
    throw new Error('Brak CASHBILL_SECRET — uzupełnij klucz punktu płatności w .env lub panelu.')
  }
  if (!cfg.shopId) {
    throw new Error('Brak CASHBILL_SHOP_ID — uzupełnij ID punktu płatności.')
  }
  return {
    client: new CashBillClient(cfg.shopId, cfg.secret, cfg.mode),
    cfg,
  }
}

/** Preferowane kanały UI: BLIK + przelew (pierwszy pasujący z CashBill). */
export async function resolvePreferredChannels(request?: Request) {
  const { client, cfg } = await getCashBillClient(request)
  let channels: Awaited<ReturnType<typeof client.getChannels>> = []
  try {
    channels = await client.getChannels('pl')
  } catch (error) {
    console.warn('CashBill channels fallback', error)
  }

  const tester = channels.find((c) => c.id === 'tester')
  const blik =
    channels.find((c) => c.kind === 'blik') ||
    (cfg.mode === 'test' && tester
      ? { id: tester.id, name: 'BLIK (test)', kind: 'blik' as const }
      : { id: 'blik', name: 'BLIK', kind: 'blik' as const })

  const transfer =
    channels.find((c) => c.kind === 'transfer') ||
    channels.find((c) => c.id === 'other') ||
    (cfg.mode === 'test' && tester
      ? { id: tester.id, name: 'Przelew (test)', kind: 'transfer' as const }
      : { id: 'other', name: 'Przelew bankowy', kind: 'transfer' as const })

  return { blik, transfer, all: channels, mode: cfg.mode }
}
