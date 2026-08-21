import pg from 'pg'
import { postgresClientConfig } from './connection'
import { INITIAL_SCHEMA_SQL } from './initial-schema'

const PgClient =
  (pg as unknown as { Client?: typeof pg.Client }).Client ||
  (pg as unknown as { default?: { Client?: typeof pg.Client } }).default?.Client

const LOCK_ID = 88442201
const IGNORE_SQL_CODES = new Set([
  '42P07', // duplicate_table / duplicate_relation
  '42710', // duplicate_object
  '42701', // duplicate_column
  '42P16', // invalid_table_definition (e.g. second primary key)
  '42723', // duplicate_function
  '23505', // unique_violation
  '23503', // foreign_key_violation (orphans when adding FK)
  '42P01', // undefined_table (index on table that will exist later)
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

function withIfNotExistsIndex(sql: string) {
  return sql.replace(
    /^CREATE\s+(UNIQUE\s+)?INDEX\s+(?!IF\s+NOT\s+EXISTS)/i,
    (_match, unique: string | undefined) =>
      `CREATE ${unique || ''}INDEX IF NOT EXISTS `,
  )
}

async function ensureSerialDefaults(client: pg.Client) {
  const { rows } = await client.query<{ relname: string }>(
    `SELECT c.relname
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind = 'S' AND c.relname LIKE '%_id_seq'`,
  )

  let attached = 0
  for (const { relname } of rows) {
    const table = relname.replace(/_id_seq$/, '')
    if (!/^[a-z0-9_]+$/.test(table)) continue
    try {
      await client.query(
        `ALTER TABLE public.${table} ALTER COLUMN id SET DEFAULT nextval('public.${relname}'::regclass)`,
      )
      attached += 1
    } catch (error) {
      console.error('[tatra] serial default skip', table, error)
    }
  }
  console.log('[tatra] serial defaults attached', attached, '/', rows.length)
}

async function runIgnore(client: pg.Client, sql: string) {
  try {
    await client.query(sql)
    return true
  } catch (error) {
    const code = (error as { code?: string }).code
    if (code && IGNORE_SQL_CODES.has(code)) return false
    console.error('[tatra] constraint skip', sql.slice(0, 140), error)
    return false
  }
}

async function ensureAllPrimaryKeys(client: pg.Client) {
  const { rows } = await client.query<{ table_name: string }>(
    `SELECT c.relname AS table_name
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     JOIN pg_attribute a
       ON a.attrelid = c.oid AND a.attname = 'id' AND a.attnum > 0 AND NOT a.attisdropped
     WHERE n.nspname = 'public' AND c.relkind = 'r'
       AND NOT EXISTS (
         SELECT 1 FROM pg_constraint x
         WHERE x.conrelid = c.oid AND x.contype = 'p'
       )
     ORDER BY 1`,
  )

  let added = 0
  for (const { table_name } of rows) {
    if (!/^[a-z0-9_]+$/.test(table_name)) continue
    const ok = await runIgnore(
      client,
      `ALTER TABLE public.${table_name} ADD CONSTRAINT ${table_name}_pkey PRIMARY KEY (id)`,
    )
    if (ok) added += 1
  }

  const pk = await client.query<{ n: string }>(
    `SELECT count(*)::text AS n
     FROM pg_constraint x
     JOIN pg_class c ON c.oid = x.conrelid
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND x.contype = 'p'`,
  )
  console.log('[tatra] primary keys added', added, 'total', pk.rows[0]?.n, 'missingBefore', rows.length)
}

async function applyDumpConstraints(client: pg.Client) {
  let applied = 0
  for (const statement of schemaStatements(INITIAL_SCHEMA_SQL)) {
    const isConstraint =
      /^ALTER\s+TABLE\b/i.test(statement) && /ADD\s+CONSTRAINT\b/i.test(statement)
    const isIndex = /^CREATE\s+(UNIQUE\s+)?INDEX\b/i.test(statement)
    if (!isConstraint && !isIndex) continue
    const sql = isIndex ? withIfNotExistsIndex(statement) : statement
    const ok = await runIgnore(client, sql)
    if (ok) applied += 1
  }
  console.log('[tatra] dump constraints/indexes applied', applied)
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

async function createMissingTables(client: pg.Client) {
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
    if (asBool(stillMissing.rows[0]?.present)) return

    for (const statement of schemaStatements(INITIAL_SCHEMA_SQL)) {
      try {
        await client.query(withIfNotExistsIndex(statement))
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
  } finally {
    await client.query(`SELECT pg_advisory_unlock($1)`, [LOCK_ID])
  }
}

async function cleanupOrphanLockedRels(client: pg.Client) {
  try {
    const result = await client.query(
      `DELETE FROM public.payload_locked_documents_rels rel
       WHERE rel.parent_id IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM public.payload_locked_documents parent
           WHERE parent.id = rel.parent_id
         )`,
    )
    if (result.rowCount && result.rowCount > 0) {
      console.log('[tatra] cleaned orphan locked-document rels', result.rowCount)
    }
  } catch (error) {
    console.error('[tatra] orphan locked-document cleanup skipped', error)
  }
}

async function ensureBookingEmailColumn(client: pg.Client) {
  await runIgnore(
    client,
    `ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamp with time zone`,
  )
}

async function repairExistingSchema(client: pg.Client) {
  await ensureSerialDefaults(client)
  await ensureAllPrimaryKeys(client)
  await cleanupOrphanLockedRels(client)
  // Do not delete media or null out content FKs on boot — CMS content must survive redeploys.
  await applyDumpConstraints(client)
  await ensureAllPrimaryKeys(client)
  await ensureBookingEmailColumn(client)
  await markMigration(client)
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
    if (!asBool(existing.rows[0]?.present)) {
      await createMissingTables(client)
    }
    // Always repair: first boot historically created tables without PKs/indexes.
    // Payload upserts with ON CONFLICT ("id") and will refuse every write without them.
    await repairExistingSchema(client)
  } finally {
    await client.end()
  }
}
