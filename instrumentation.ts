export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  // Loaded at runtime only — must not be bundled for edge/client (uses crypto, pg, payload).
  const mod = await import(/* webpackIgnore: true */ './instrumentation.node')
  await mod.runNodeInstrumentation()
}
