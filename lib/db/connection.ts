import type { ClientConfig } from 'pg'

function stripSearchParam(url: string, key: string) {
  return url
    .replace(new RegExp(`([?&])${key}=[^&]*`, 'gi'), '$1')
    .replace(/\?&/, '?')
    .replace(/[?&]$/, '')
    .replace(/\?&/, '?')
}

export function postgresConnection(): { connectionString: string; sslRequired: boolean } {
  const databaseUrl = process.env.DATABASE_URL || ''
  if (!databaseUrl || databaseUrl.startsWith('file:')) {
    throw new Error(
      'DATABASE_URL must be a Postgres connection string, e.g. postgres://user:pass@host:5432/tatra_off_road',
    )
  }

  const sslRequired =
    process.env.DATABASE_SSL !== 'false' &&
    (process.env.DATABASE_SSL === 'true' ||
      /sslmode=/i.test(databaseUrl) ||
      /supabase\.(co|com)/i.test(databaseUrl) ||
      process.env.NODE_ENV === 'production')

  let connectionString = stripSearchParam(stripSearchParam(databaseUrl, 'sslmode'), 'uselibpqcompat')
  if (sslRequired) {
    connectionString += `${connectionString.includes('?') ? '&' : '?'}sslmode=no-verify`
  }

  return { connectionString, sslRequired }
}

export function postgresClientConfig(): ClientConfig {
  const { connectionString, sslRequired } = postgresConnection()
  return {
    connectionString,
    connectionTimeoutMillis: 10000,
    ...(sslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
  }
}
