import { NextResponse } from 'next/server'
import { resolvePreferredChannels, getCashBillRuntimeConfig } from '@/lib/cashbill/config'

export async function GET() {
  try {
    const cfg = await getCashBillRuntimeConfig()
    const channels = await resolvePreferredChannels()
    return NextResponse.json({
      mode: cfg.mode,
      liveEnabled: cfg.liveEnabled,
      methods: [
        { id: 'blik', channelId: channels.blik.id, label: 'BLIK', description: 'Szybka płatność kodem BLIK' },
        {
          id: 'transfer',
          channelId: channels.transfer.id,
          label: 'Przelew bankowy',
          description: 'Płatność przelewem / szybkim przelewem',
        },
      ],
    })
  } catch (error) {
    console.error('GET /api/payments/cashbill/methods', error)
    return NextResponse.json(
      {
        mode: 'test',
        liveEnabled: false,
        methods: [
          { id: 'blik', channelId: 'blik', label: 'BLIK', description: 'Szybka płatność kodem BLIK' },
          {
            id: 'transfer',
            channelId: 'other',
            label: 'Przelew bankowy',
            description: 'Płatność przelewem / szybkim przelewem',
          },
        ],
        warning: error instanceof Error ? error.message : 'CashBill niedostępny — używam domyślnych kanałów',
      },
      { status: 200 },
    )
  }
}
