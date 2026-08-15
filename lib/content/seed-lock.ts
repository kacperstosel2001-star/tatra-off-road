import pg from 'pg'
import { postgresClientConfig } from '@/lib/db/connection'

const PgClient =
  (pg as unknown as { Client?: typeof pg.Client }).Client ||
  (pg as unknown as { default?: { Client?: typeof pg.Client } }).default?.Client

const SEED_LOCK_NAME = 'tatra_content_seed_done'

function asBool(value: unknown) {
  return value === true || value === 't' || value === 'true' || value === 1
}

/**
 * Content seed runs once, then stays locked across Hostinger redeploys.
 * - SEED_CONTENT=false → never seed
 * - SEED_CONTENT=force → seed missing empties again (still create-only, no overwrites)
 */
export function seedContentMode(): 'skip' | 'once' | 'force' {
  const raw = String(process.env.SEED_CONTENT || '').trim().toLowerCase()
  if (raw === 'false' || raw === '0' || raw === 'off' || raw === 'never') return 'skip'
  if (raw === 'force' || raw === 'always' || raw === 'true' || raw === '1') return 'force'
  return 'once'
}

export async function isContentSeedLocked(): Promise<boolean> {
  if (!PgClient) return false
  const client = new PgClient(postgresClientConfig())
  try {
    await client.connect()
    const table = await client.query(
      `SELECT to_regclass('public.payload_migrations') IS NOT NULL AS present`,
    )
    if (!asBool(table.rows[0]?.present)) return false
    const rows = await client.query(
      `SELECT 1 FROM public.payload_migrations WHERE name = $1 LIMIT 1`,
      [SEED_LOCK_NAME],
    )
    return (rows.rowCount ?? 0) > 0
  } catch {
    return false
  } finally {
    try {
      await client.end()
    } catch {
      /* ignore */
    }
  }
}

export async function markContentSeedLocked(): Promise<void> {
  if (!PgClient) return
  const client = new PgClient(postgresClientConfig())
  try {
    await client.connect()
    const table = await client.query(
      `SELECT to_regclass('public.payload_migrations') IS NOT NULL AS present`,
    )
    if (!asBool(table.rows[0]?.present)) return

    await client.query(
      `INSERT INTO public.payload_migrations (id, name, batch)
       SELECT nextval('public.payload_migrations_id_seq'), $1, 1
       WHERE NOT EXISTS (
         SELECT 1 FROM public.payload_migrations WHERE name = $1
       )`,
      [SEED_LOCK_NAME],
    )
  } catch (error) {
    console.error('[tatra] content seed lock write skipped', error)
  } finally {
    try {
      await client.end()
    } catch {
      /* ignore */
    }
  }
}
