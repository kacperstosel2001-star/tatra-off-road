export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  // Keep Node-only modules out of the client/edge webpack graph.
  await import(/* webpackIgnore: true */ './instrumentation.node')
}
