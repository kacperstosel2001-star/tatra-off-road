/** Główny numer kontaktowy + dodatkowy. */
export const PRIMARY_PHONE = '+48 530 198 735'
export const SECONDARY_PHONE = '+48 888 254 223'
export const DEFAULT_PHONES = [PRIMARY_PHONE, SECONDARY_PHONE] as const

export function phoneDigits(phone: string) {
  return phone.replace(/\D/g, '')
}

/** Ustawia 530… jako pierwszy, drugi numer zachowuje. */
export function orderContactPhones(phones: string[]): string[] {
  const cleaned = phones.map((p) => String(p || '').trim()).filter(Boolean)
  if (!cleaned.length) return [...DEFAULT_PHONES]

  const primaryDigits = phoneDigits(PRIMARY_PHONE)
  const primary = cleaned.find((p) => phoneDigits(p).endsWith(primaryDigits.slice(-9)))
  const rest = cleaned.filter((p) => p !== primary)
  if (primary) return [primary, ...rest]

  return [PRIMARY_PHONE, ...cleaned.filter((p) => phoneDigits(p) !== phoneDigits(SECONDARY_PHONE)), SECONDARY_PHONE].filter(
    (p, i, arr) => arr.findIndex((x) => phoneDigits(x) === phoneDigits(p)) === i,
  )
}
