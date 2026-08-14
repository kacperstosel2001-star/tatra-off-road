import type { Payload } from 'payload'

const LOCK_ID = 88442201

function asBool(value: unknown) {
  return value === true || value === 't' || value === 'true' || value === 1
}

async function rawQuery(adapter: any, sql: string) {
  const result = await adapter.execute({
    drizzle: adapter.drizzle,
    raw: sql,
  })
  return result?.rows ?? []
}

export async function ensurePostgresSchema(payload: Payload) {
  const adapter = payload.db as any
  if (typeof adapter?.requireDrizzleKit !== 'function') return

  const existing = await rawQuery(adapter, `SELECT to_regclass('public.trips') AS table`)
  if (existing[0]?.table) return

  let gotLock = false
  for (let i = 0; i < 40; i++) {
    const rows = await rawQuery(adapter, `SELECT pg_try_advisory_lock(${LOCK_ID}) AS locked`)
    if (asBool(rows[0]?.locked)) {
      gotLock = true
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  if (!gotLock) return

  try {
    const stillMissing = await rawQuery(adapter, `SELECT to_regclass('public.trips') AS table`)
    if (stillMissing[0]?.table) return

    payload.logger.info('Creating Postgres schema (first boot)...')
    const { pushSchema } = adapter.requireDrizzleKit()
    const { apply } = await pushSchema(
      adapter.schema,
      adapter.drizzle,
      adapter.schemaName ? [adapter.schemaName] : undefined,
      adapter.tablesFilter,
      adapter.extensions?.postgis ? ['postgis'] : undefined,
    )
    await apply()
    payload.logger.info('Postgres schema ready.')
  } finally {
    await rawQuery(adapter, `SELECT pg_advisory_unlock(${LOCK_ID})`)
  }
}
