export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  console.log('[tatra] applying postgres schema...')
  try {
    const { applyInitialSchema } = await import('./lib/db/ensure-schema')
    await applyInitialSchema()
    console.log('[tatra] postgres schema ready')
  } catch (error) {
    console.error('[tatra] postgres schema failed', error)
  }
}
