import { createHash } from 'crypto'

export type CashBillMode = 'test' | 'live'

export type CashBillChannelOption = {
  id: string
  name: string
  kind: 'blik' | 'transfer' | 'other'
}

export type CreatePaymentInput = {
  title: string
  amount: number
  currency?: string
  description?: string
  additionalData?: string
  returnUrl: string
  negativeReturnUrl: string
  paymentChannel: string
  languageCode?: string
  referer?: string
}

export type CreatePaymentResult = {
  id: string
  redirectUrl: string
}

export type CashBillPaymentDetails = {
  id: string
  status: string
  title?: string
  additionalData?: string
  amount?: { value?: number | string; currencyCode?: string }
}

const BASE_URLS: Record<CashBillMode, string> = {
  test: 'https://pay.cashbill.pl/testws/rest',
  live: 'https://pay.cashbill.pl/ws/rest',
}

function sha1Hex(input: string): string {
  return createHash('sha1').update(input, 'utf8').digest('hex')
}

function md5Hex(input: string): string {
  return createHash('md5').update(input, 'utf8').digest('hex')
}

function formatAmount(value: number): string {
  return value.toFixed(2)
}

export function signPaymentPayload(
  input: Required<
    Pick<
      CreatePaymentInput,
      | 'title'
      | 'amount'
      | 'currency'
      | 'returnUrl'
      | 'description'
      | 'negativeReturnUrl'
      | 'additionalData'
      | 'paymentChannel'
      | 'languageCode'
      | 'referer'
    >
  >,
  secret: string,
): string {
  const amount = formatAmount(input.amount)
  return sha1Hex(
    [
      input.title,
      amount,
      input.currency,
      input.returnUrl,
      input.description,
      input.negativeReturnUrl,
      input.additionalData,
      input.paymentChannel,
      input.languageCode,
      input.referer,
      secret,
    ].join(''),
  )
}

export function signPaymentId(paymentId: string, secret: string): string {
  return sha1Hex(paymentId + secret)
}

export function verifyNotificationSign(cmd: string, args: string, sign: string, secret: string): boolean {
  const expected = md5Hex(cmd + args + secret)
  return expected.toLowerCase() === String(sign || '').toLowerCase()
}

function classifyChannel(id: string, name: string): CashBillChannelOption['kind'] {
  const hay = `${id} ${name}`.toLowerCase()
  if (hay.includes('blik')) return 'blik'
  if (
    hay.includes('przelew') ||
    hay.includes('transfer') ||
    hay.includes('bank') ||
    hay.includes('pbl') ||
    hay.includes('payby') ||
    id === 'other' ||
    id === 'bp'
  ) {
    return 'transfer'
  }
  return 'other'
}

export class CashBillClient {
  constructor(
    private readonly shopId: string,
    private readonly secret: string,
    private readonly mode: CashBillMode,
  ) {}

  get baseUrl() {
    return BASE_URLS[this.mode]
  }

  async createPayment(raw: CreatePaymentInput): Promise<CreatePaymentResult> {
    const payload = {
      title: raw.title,
      amount: raw.amount,
      currency: raw.currency || 'PLN',
      description: raw.description || '',
      additionalData: raw.additionalData || '',
      returnUrl: raw.returnUrl,
      negativeReturnUrl: raw.negativeReturnUrl,
      paymentChannel: raw.paymentChannel,
      languageCode: raw.languageCode || 'pl',
      referer: raw.referer || '',
    }

    const sign = signPaymentPayload(payload, this.secret)
    const body = new URLSearchParams({
      title: payload.title,
      'amount.value': formatAmount(payload.amount),
      'amount.currencyCode': payload.currency,
      description: payload.description,
      additionalData: payload.additionalData,
      returnUrl: payload.returnUrl,
      negativeReturnUrl: payload.negativeReturnUrl,
      paymentChannel: payload.paymentChannel,
      languageCode: payload.languageCode,
      referer: payload.referer,
      sign,
    })

    const res = await fetch(`${this.baseUrl}/payment/${this.shopId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body,
    })

    const text = await res.text()
    let data: Partial<CreatePaymentResult> & { errorMessage?: string } = {}
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`CashBill: nieprawidłowa odpowiedź (${res.status}): ${text.slice(0, 300)}`)
    }

    if (!res.ok || !data.id || !data.redirectUrl) {
      throw new Error(data.errorMessage || `CashBill: błąd tworzenia płatności (${res.status})`)
    }

    return { id: data.id, redirectUrl: data.redirectUrl }
  }

  async getPayment(paymentId: string): Promise<CashBillPaymentDetails> {
    const sign = signPaymentId(paymentId, this.secret)
    const res = await fetch(`${this.baseUrl}/payment/${this.shopId}/${paymentId}?sign=${sign}`, {
      headers: { Accept: 'application/json' },
    })
    const text = await res.text()
    let data: CashBillPaymentDetails & { errorMessage?: string }
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`CashBill: nieprawidłowa odpowiedź statusu (${res.status})`)
    }
    if (!res.ok) {
      throw new Error(data.errorMessage || `CashBill: błąd pobierania płatności (${res.status})`)
    }
    return data
  }

  async getChannels(languageCode = 'pl'): Promise<CashBillChannelOption[]> {
    const res = await fetch(`${this.baseUrl}/paymentchannels/${this.shopId}/${languageCode}`, {
      headers: { Accept: 'application/json' },
    })
    const text = await res.text()
    if (!res.ok) {
      throw new Error(`CashBill: nie udało się pobrać kanałów (${res.status}): ${text.slice(0, 200)}`)
    }

    const raw = JSON.parse(text) as Array<{ id: string; name: string; available?: boolean }>
    return (raw || [])
      .filter((ch) => ch.available !== false)
      .map((ch) => ({
        id: ch.id,
        name: ch.name,
        kind: classifyChannel(ch.id, ch.name),
      }))
  }
}

function normalizeStatus(status: unknown): string {
  if (status && typeof status === 'object' && 'status' in status) {
    return normalizeStatus((status as { status: unknown }).status)
  }
  return String(status || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
}

export function isPaidStatus(status: unknown): boolean {
  const s = normalizeStatus(status)
  // CashBill returns PositiveFinish / PositiveAuthorization (camelCase)
  return s === 'POSITIVEFINISH' || s === 'POSITIVEAUTHORIZATION'
}

export function isFailedStatus(status: unknown): boolean {
  const s = normalizeStatus(status)
  return ['NEGATIVEFINISH', 'ABORT', 'FRAUD', 'NEGATIVEAUTHORIZATION'].includes(s)
}

export function extractPaymentStatus(payment: CashBillPaymentDetails): string {
  const raw = payment.status as unknown
  if (raw && typeof raw === 'object' && 'statusCode' in (raw as object)) {
    return String((raw as { statusCode: string }).statusCode)
  }
  return String(raw || '')
}
