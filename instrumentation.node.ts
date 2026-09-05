import { applyInitialSchema } from './lib/db/ensure-schema'

/** Co 5 min — wystarczy na opóźniony webhook, bez zbędnego obciążenia. */
const RECONCILE_MS = 5 * 60 * 1000

export async function runNodeInstrumentation() {
  console.log('[tatra] applying postgres schema...')
  await applyInitialSchema()
  console.log('[tatra] postgres schema ready')

  const { reconcilePendingCashBillPayments } = await import('./lib/cashbill/sync')

  const tick = () => {
    void reconcilePendingCashBillPayments({ force: true }).catch((error) => {
      console.error('[tatra] scheduled CashBill reconcile failed', error)
    })
  }

  setTimeout(tick, 20_000)
  setInterval(tick, RECONCILE_MS)
  console.log('[tatra] CashBill auto-reconcile every', RECONCILE_MS / 1000, 's')
}
