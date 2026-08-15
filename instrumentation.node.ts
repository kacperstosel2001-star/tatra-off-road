import { applyInitialSchema } from './lib/db/ensure-schema'

console.log('[tatra] applying postgres schema...')
applyInitialSchema()
  .then(() => {
    console.log('[tatra] postgres schema ready')
  })
  .catch((error) => {
    console.error('[tatra] postgres schema failed', error)
  })
