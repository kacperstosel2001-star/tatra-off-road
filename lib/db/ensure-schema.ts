import pg from 'pg'
import { INITIAL_SCHEMA_SQL } from './initial-schema'

const LOCK_ID = 88442201

function asBool(value: unknown) {
  return value === true || value === 't' || value === 'true' || value === 1
}

function clientConfig(): pg.ClientConfig {
  const url = process.env.DATABASE_URL || ''
  const sslRequired =
    process.env.DATABASE_SSL !== 'false' &&
    (process.env.DATABASE_SSL === 'true' ||
      /sslmode=/i.test(url) ||
      /supabase\.(co|com)/i.test(url) ||
      process.env.NODE_ENV === 'production')

  return {
    connectionString: url,
    ...(sslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
  }
}

export async function applyInitialSchema() {
  const client = new pg.Client(clientConfig())
  await client.connect()
  try {
    const existing = await client.query(
      `SELECT to_regclass('public.users') IS NOT NULL AS present`,
    )
    if (asBool(existing.rows[0]?.present)) {
      await client.query(
        `INSERT INTO public.payload_migrations (name, batch)
         SELECT '20260814_initial', 1
         WHERE NOT EXISTS (
           SELECT 1 FROM public.payload_migrations WHERE name = '20260814_initial'
         )`,
      )
      return
    }

    const lock = await client.query(`SELECT pg_try_advisory_lock($1) AS locked`, [LOCK_ID])
    if (!asBool(lock.rows[0]?.locked)) {
      for (let i = 0; i < 60; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const again = await client.query(
          `SELECT to_regclass('public.users') IS NOT NULL AS present`,
        )
        if (asBool(again.rows[0]?.present)) return
      }
      throw new Error('Timed out waiting for Postgres schema to be created')
    }

    try {
      const stillMissing = await client.query(
        `SELECT to_regclass('public.users') IS NOT NULL AS present`,
      )
      if (asBool(stillMissing.rows[0]?.present)) return
      await client.query(INITIAL_SCHEMA_SQL)
      const created = await client.query(
        `SELECT to_regclass('public.users') IS NOT NULL AS present`,
      )
      if (!asBool(created.rows[0]?.present)) {
        throw new Error('Schema SQL ran but table "users" still does not exist')
      }
      await client.query(
        `INSERT INTO public.payload_migrations (name, batch)
         SELECT '20260814_initial', 1
         WHERE NOT EXISTS (
           SELECT 1 FROM public.payload_migrations WHERE name = '20260814_initial'
         )`,
      )
    } finally {
      await client.query(`SELECT pg_advisory_unlock($1)`, [LOCK_ID])
    }
  } finally {
    await client.end()
  }
}
