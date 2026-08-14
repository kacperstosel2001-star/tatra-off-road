const NBSP = '\u00A0'

/** Short words that should not end a line (Polish sierotki + common EN). */
const ORPHANS =
  'a|i|o|u|w|z|że|we|ze|na|do|od|po|za|ku|by|to|ni|bo|aż|oraz|lub|ale|czy|jak|nie|nad|pod|przy|bez|dla|the|an|of|to|in|on|at|or|as|for|and|by|vs'

const ORPHAN_RE = new RegExp(
  `(^|[^\\p{L}\\p{N}])(${ORPHANS})([ \\t\\n\\r]+)(?=[\\p{L}\\p{N}])`,
  'giu',
)

/**
 * Join short conjunctions/prepositions to the following word with a non-breaking space.
 * Safe for plain text. Run multiple passes for sequences like "i w terenie".
 */
export function fixOrphans(text: string): string {
  if (!text || typeof text !== 'string') return text
  let out = text
  let prev = ''
  // A few passes catch chained orphans: "a w tym"
  for (let i = 0; i < 3 && out !== prev; i++) {
    prev = out
    out = out.replace(ORPHAN_RE, `$1$2${NBSP}`)
  }
  return out
}

/** Apply fixOrphans to text nodes inside a simple HTML string (no nested script). */
export function fixOrphansHtml(html: string): string {
  if (!html || typeof html !== 'string') return html
  return html.replace(/(^|>)([^<]+)/g, (_, edge, text) => edge + fixOrphans(text))
}

/** Deep-map string values in a plain object / array (dictionaries, DTOs). */
export function fixOrphansDeep<T>(value: T): T {
  if (typeof value === 'string') return fixOrphans(value) as T
  if (Array.isArray(value)) return value.map((v) => fixOrphansDeep(v)) as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Skip URLs / ids / image paths
      if (
        typeof v === 'string' &&
        (k === 'id' ||
          k === 'slug' ||
          k === 'image' ||
          k === 'bgImage' ||
          k === 'href' ||
          k === 'email' ||
          k === 'iconName' ||
          k.endsWith('Url') ||
          /^https?:\/\//.test(v) ||
          v.startsWith('/') ||
          v.startsWith('tel:') ||
          v.startsWith('mailto:'))
      ) {
        out[k] = v
      } else {
        out[k] = fixOrphansDeep(v)
      }
    }
    return out as T
  }
  return value
}
