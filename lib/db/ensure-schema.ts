import type { Payload } from 'payload'

const LOCK_ID = 88442201

function asBool(value: unknown) {
  return value === true || value === 't' || value === 'true' || value === 1
}

function rowsOf(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) return result as Record<string, unknown>[]
  const rows = (result as { rows?: unknown })?.rows
  return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : []
}

async function rawQuery(adapter: any, sql: string) {
  return rowsOf(
    await adapter.execute({
      drizzle: adapter.drizzle,
      raw: sql,
    }),
  )
}

async function tableExists(adapter: any, name: string) {
  const rows = await rawQuery(
    adapter,
    `SELECT to_regclass('public.${name}') IS NOT NULL AS present`,
  )
  return asBool(rows[0]?.present)
}

async function loadPushSchema(adapter: any) {
  if (typeof adapter?.requireDrizzleKit === 'function') {
    try {
      const kit = adapter.requireDrizzleKit()
      if (typeof kit?.pushSchema === 'function') return kit.pushSchema
    } catch {
      // Standalone Next traces often omit drizzle-kit — fall through to direct import.
    }
  }
  const kit = await import('drizzle-kit/api')
  return kit.pushSchema
}

export async function ensurePostgresSchema(payload: Payload) {
  const adapter = payload.db as any
  if (typeof adapter?.execute !== 'function') {
    throw new Error('Postgres adapter is not ready')
  }

  if (await tableExists(adapter, 'users')) return

  let gotLock = false
  for (let i = 0; i < 60; i++) {
    if (await tableExists(adapter, 'users')) return
    const rows = await rawQuery(adapter, `SELECT pg_try_advisory_lock(${LOCK_ID}) AS locked`)
    if (asBool(rows[0]?.locked)) {
      gotLock = true
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  if (!gotLock) {
    if (await tableExists(adapter, 'users')) return
    throw new Error('Timed out waiting for Postgres schema to be created')
  }

  try {
    if (await tableExists(adapter, 'users')) return

    payload.logger.info('Creating Postgres schema (first boot)...')
    const pushSchema = await loadPushSchema(adapter)
    const { apply } = await pushSchema(
      adapter.schema,
      adapter.drizzle,
      adapter.schemaName ? [adapter.schemaName] : undefined,
      adapter.tablesFilter,
      adapter.extensions?.postgis ? ['postgis'] : undefined,
    )
    await apply()

    if (!(await tableExists(adapter, 'users'))) {
      throw new Error('Schema push finished but table "users" still does not exist')
    }
    payload.logger.info('Postgres schema ready.')
  } finally {
    await rawQuery(adapter, `SELECT pg_advisory_unlock(${LOCK_ID})`)
  }
}
