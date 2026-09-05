import { applyInitialSchema } from './lib/db/ensure-schema'

const RECONCILE_MS = 2 * 60 * 1000

export async function runNodeInstrumentation() {
  console.log('[tatra] applying postgres schema...')
  await applyInitialSchema()
  console.log('[tatra] postgres schema ready')

  // Automatyczne dociąganie CashBill → panel + Google Calendar (gdy webhook nie doszedł)
  const { reconcilePendingCashBillPayments } = await import('./lib/cashbill/sync')

  const tick = () => {
    void reconcilePendingCashBillPayments({ force: true }).catch((error) => {
      console.error('[tatra] scheduled CashBill reconcile failed', error)
    })
  }

  // Pierwszy przebieg po starcie (np. rezerwacja Krystiana nadal pending)
  setTimeout(tick, 15_000)
  setInterval(tick, RECONCILE_MS)
  console.log('[tatra] CashBill auto-reconcile every', RECONCILE_MS / 1000, 's')
}
