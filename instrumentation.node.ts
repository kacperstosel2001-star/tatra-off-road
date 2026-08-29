import { applyInitialSchema } from './lib/db/ensure-schema'

export async function runNodeInstrumentation() {
  console.log('[tatra] applying postgres schema...')
  await applyInitialSchema()
  console.log('[tatra] postgres schema ready')
}
