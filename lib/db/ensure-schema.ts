import pg from 'pg'
import { postgresClientConfig } from './connection'
import { INITIAL_SCHEMA_SQL } from './initial-schema'

const PgClient =
  (pg as unknown as { Client?: typeof pg.Client }).Client ||
  (pg as unknown as { default?: { Client?: typeof pg.Client } }).default?.Client

const LOCK_ID = 88442201
const IGNORE_SQL_CODES = new Set([
  '42P07', // duplicate_table
  '42710', // duplicate_object
  '42701', // duplicate_column
  '42P16', // invalid_table_definition / already exists variants
  '42723', // duplicate_function
  '23505', // unique_violation
])

function asBool(value: unknown) {
  return value === true || value === 't' || value === 'true' || value === 1
}

function schemaStatements(sql: string): string[] {
  const withoutComments = sql
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim()
      return trimmed && !trimmed.startsWith('--')
    })
    .join('\n')

  return withoutComments
    .split(';')
    .map((chunk) => chunk.trim())
    .filter((statement) => /^(CREATE|ALTER|INSERT)\b/i.test(statement))
}

async function markMigration(client: pg.Client) {
  await client.query(
    `INSERT INTO public.payload_migrations (name, batch)
     SELECT '20260814_initial', 1
     WHERE NOT EXISTS (
       SELECT 1 FROM public.payload_migrations WHERE name = '20260814_initial'
     )`,
  )
}

export async function applyInitialSchema() {
  if (!PgClient) {
    throw new Error('pg.Client is not available in this runtime')
  }
  const client = new PgClient(postgresClientConfig())
  console.log('[tatra] schema sql bytes', INITIAL_SCHEMA_SQL.length)
  await client.connect()
  try {
    const existing = await client.query(
      `SELECT to_regclass('public.users') IS NOT NULL AS present`,
    )
    if (asBool(existing.rows[0]?.present)) {
      await markMigration(client)
      return
    }

    const lock = await client.query(`SELECT pg_try_advisory_lock($1) AS locked`, [LOCK_ID])
    if (!asBool(lock.rows[0]?.locked)) {
      for (let i = 0; i < 20; i++) {
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
      if (asBool(stillMissing.rows[0]?.present)) {
        await markMigration(client)
        return
      }

      for (const statement of schemaStatements(INITIAL_SCHEMA_SQL)) {
        try {
          await client.query(statement)
        } catch (error) {
          const code = (error as { code?: string }).code
          if (code && IGNORE_SQL_CODES.has(code)) continue
          console.error('[tatra] schema statement failed', statement.slice(0, 180), error)
          throw error
        }
      }

      const created = await client.query(
        `SELECT to_regclass('public.users') IS NOT NULL AS present`,
      )
      if (!asBool(created.rows[0]?.present)) {
        throw new Error('Schema SQL ran but table "users" still does not exist')
      }
      await markMigration(client)
    } finally {
      await client.query(`SELECT pg_advisory_unlock($1)`, [LOCK_ID])
    }
  } finally {
    await client.end()
  }
}
