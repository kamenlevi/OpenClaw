import { ensureWorkspace } from './workspace'
import { initCronJobs } from './cron-manager'

let initialized = false

export async function initializeServer(): Promise<void> {
  if (initialized) return
  initialized = true

  try {
    await ensureWorkspace()
    await initCronJobs()
    console.log('[openclaw] Workspace initialized, cron jobs loaded.')
  } catch (err) {
    console.error('[openclaw] Startup initialization failed:', err)
  }
}
