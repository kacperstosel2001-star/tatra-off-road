import { getPayloadClient } from '@/lib/booking'
import { CashBillClient, type CashBillMode } from '@/lib/cashbill/client'

export type CashBillRuntimeConfig = {
  shopId: string
  secret: string
  mode: CashBillMode
  liveEnabled: boolean
  appUrl: string
}

export async function getCashBillRuntimeConfig(): Promise<CashBillRuntimeConfig> {
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

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'http://127.0.0.1:3005'
  ).replace(/\/$/, '')

  return { shopId, secret, mode, liveEnabled, appUrl }
}

export async function getCashBillClient() {
  const cfg = await getCashBillRuntimeConfig()
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
export async function resolvePreferredChannels() {
  const { client, cfg } = await getCashBillClient()
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
