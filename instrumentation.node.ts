import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { applyInitialSchema } from './lib/db/ensure-schema'

try {
  const mediaDir = resolve(process.cwd(), 'media')
  mkdirSync(mediaDir, { recursive: true })
  console.log('[tatra] media dir ready', mediaDir)
} catch (error) {
  console.error('[tatra] media dir create failed', error)
}

console.log('[tatra] applying postgres schema...')
applyInitialSchema()
  .then(() => {
    console.log('[tatra] postgres schema ready')
  })
  .catch((error) => {
    console.error('[tatra] postgres schema failed', error)
  })
