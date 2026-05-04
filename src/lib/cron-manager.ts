import cron from 'node-cron'
import { readJSON, writeJSON, WORKSPACE, ScheduledJob, Task } from './workspace'
import { runTask } from './orchestrator'
import path from 'path'

const activeCrons = new Map<string, cron.ScheduledTask>()

export async function initCronJobs(): Promise<void> {
  const jobs = await readJSON<ScheduledJob[]>(
    path.join(WORKSPACE, 'calendar.json'),
    []
  )
  for (const job of jobs) {
    if (job.enabled && job.type !== 'one-shot') {
      scheduleJob(job)
    }
  }
}

export function scheduleJob(job: ScheduledJob): void {
  if (activeCrons.has(job.id)) {
    activeCrons.get(job.id)!.stop()
    activeCrons.delete(job.id)
  }

  if (!cron.validate(job.cron)) {
    console.warn(`[cron-manager] Invalid cron expression for job ${job.id}: "${job.cron}"`)
    return
  }

  const task = cron.schedule(
    job.cron,
    async () => {
      const newTask: Task = {
        id: Math.random().toString(36).slice(2),
        prompt: job.prompt,
        status: 'queued',
        teams: [],
        plan: '',
        createdAt: new Date().toISOString(),
        agentLog: [],
        tokensUsed: 0,
        model: 'auto',
      }

      const queuePath = path.join(WORKSPACE, 'tasks', 'queue.json')
      const queue = await readJSON<Task[]>(queuePath, [])
      queue.push(newTask)
      await writeJSON(queuePath, queue)

      // Update lastRun on the job
      const calPath = path.join(WORKSPACE, 'calendar.json')
      const jobs = await readJSON<ScheduledJob[]>(calPath, [])
      const idx = jobs.findIndex((j) => j.id === job.id)
      if (idx >= 0) {
        jobs[idx].lastRun = new Date().toISOString()
        await writeJSON(calPath, jobs)
      }

      await runTask(newTask)
    },
    { timezone: 'Asia/Hong_Kong' }
  )

  activeCrons.set(job.id, task)
}

export function unscheduleJob(jobId: string): void {
  activeCrons.get(jobId)?.stop()
  activeCrons.delete(jobId)
}

export function getActiveJobIds(): string[] {
  return Array.from(activeCrons.keys())
}
