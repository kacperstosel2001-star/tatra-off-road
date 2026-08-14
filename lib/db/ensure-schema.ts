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

async function ensureSerialDefaults(client: pg.Client) {
  const { rows } = await client.query<{ relname: string }>(
    `SELECT c.relname
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind = 'S' AND c.relname LIKE '%_id_seq'`,
  )

  for (const { relname } of rows) {
    const table = relname.replace(/_id_seq$/, '')
    if (!/^[a-z0-9_]+$/.test(table)) continue
    try {
      await client.query(
        `ALTER TABLE public.${table} ALTER COLUMN id SET DEFAULT nextval('public.${relname}'::regclass)`,
      )
    } catch (error) {
      console.error('[tatra] serial default skip', table, error)
    }
  }
  console.log('[tatra] serial defaults attached', rows.length)
}

async function runIgnore(client: pg.Client, sql: string) {
  try {
    await client.query(sql)
  } catch (error) {
    const code = (error as { code?: string }).code
    if (code && IGNORE_SQL_CODES.has(code)) return
    console.error('[tatra] constraint skip', sql.slice(0, 120), error)
  }
}

async function ensureUsersConstraints(client: pg.Client) {
  await runIgnore(
    client,
    `ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id)`,
  )
  await runIgnore(
    client,
    `CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON public.users USING btree (email)`,
  )
  const pk = await client.query(
    `SELECT conname FROM pg_constraint WHERE conrelid = 'public.users'::regclass AND contype = 'p'`,
  )
  console.log('[tatra] users primary keys', pk.rows.map((row) => row.conname))
}

async function markMigration(client: pg.Client) {
  try {
    await client.query(
      `INSERT INTO public.payload_migrations (id, name, batch)
       SELECT nextval('public.payload_migrations_id_seq'), '20260814_initial', 1
       WHERE NOT EXISTS (
         SELECT 1 FROM public.payload_migrations WHERE name = '20260814_initial'
       )`,
    )
  } catch (error) {
    console.error('[tatra] payload_migrations insert skipped', error)
  }
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
      await ensureSerialDefaults(client)
      await ensureUsersConstraints(client)
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
        await ensureSerialDefaults(client)
        await ensureUsersConstraints(client)
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
      await ensureSerialDefaults(client)
      await ensureUsersConstraints(client)
      await markMigration(client)
    } finally {
      await client.query(`SELECT pg_advisory_unlock($1)`, [LOCK_ID])
    }
  } finally {
    await client.end()
  }
}
