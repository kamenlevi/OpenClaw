import { NextResponse } from 'next/server'
import {
  ensureWorkspace,
  readJSON,
  writeJSON,
  ScheduledJob,
  WORKSPACE,
} from '@/lib/workspace'
import { scheduleJob, unscheduleJob } from '@/lib/cron-manager'
import path from 'path'
import cron from 'node-cron'

const CALENDAR_PATH = path.join(WORKSPACE, 'calendar.json')

export async function GET() {
  try {
    await ensureWorkspace()
    const jobs = await readJSON<ScheduledJob[]>(CALENDAR_PATH, [])
    return NextResponse.json(jobs)
  } catch (err) {
    console.error('[GET /api/calendar]', err)
    return NextResponse.json({ error: 'Failed to read calendar' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureWorkspace()

    const body = await request.json()
    const {
      name,
      type = 'recurring',
      cronExpr,
      agent,
      prompt,
      enabled = true,
    } = body as {
      name?: string
      type?: ScheduledJob['type']
      cronExpr?: string
      agent?: string
      prompt?: string
      enabled?: boolean
    }

    if (!name || !cronExpr || !agent || !prompt) {
      return NextResponse.json(
        { error: 'name, cronExpr, agent, and prompt are required' },
        { status: 400 }
      )
    }

    if (!cron.validate(cronExpr)) {
      return NextResponse.json(
        { error: `Invalid cron expression: "${cronExpr}"` },
        { status: 400 }
      )
    }

    const newJob: ScheduledJob = {
      id: Math.random().toString(36).slice(2),
      name,
      type,
      cron: cronExpr,
      enabled,
      agent,
      prompt,
      createdAt: new Date().toISOString(),
    }

    const jobs = await readJSON<ScheduledJob[]>(CALENDAR_PATH, [])
    jobs.push(newJob)
    await writeJSON(CALENDAR_PATH, jobs)

    if (enabled && type !== 'one-shot') {
      scheduleJob(newJob)
    }

    return NextResponse.json(newJob, { status: 201 })
  } catch (err) {
    console.error('[POST /api/calendar]', err)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await ensureWorkspace()

    const body = await request.json()
    const { id, ...updates } = body as { id?: string; enabled?: boolean } & Partial<ScheduledJob>

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const jobs = await readJSON<ScheduledJob[]>(CALENDAR_PATH, [])
    const idx = jobs.findIndex((j) => j.id === id)

    if (idx < 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    jobs[idx] = { ...jobs[idx], ...updates, id }
    await writeJSON(CALENDAR_PATH, jobs)

    const job = jobs[idx]
    if (job.enabled && job.type !== 'one-shot') {
      scheduleJob(job)
    } else {
      unscheduleJob(id)
    }

    return NextResponse.json(job)
  } catch (err) {
    console.error('[PUT /api/calendar]', err)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}
