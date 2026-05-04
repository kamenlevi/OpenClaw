import { NextResponse } from 'next/server'
import { ensureWorkspace, readJSON, writeJSON, Task, WORKSPACE } from '@/lib/workspace'
import path from 'path'
import { promises as fs } from 'fs'

export async function GET() {
  try {
    await ensureWorkspace()

    const queuePath = path.join(WORKSPACE, 'tasks', 'queue.json')
    const activePath = path.join(WORKSPACE, 'tasks', 'active.json')

    const queue = await readJSON<Task[]>(queuePath, [])
    const active = await readJSON<Task[]>(activePath, [])

    // Read today's completed file
    const dateStr = new Date().toISOString().split('T')[0]
    const completedPath = path.join(
      WORKSPACE,
      'tasks',
      'completed',
      `completed-${dateStr}.json`
    )
    const completedToday = await readJSON<Task[]>(completedPath, [])

    return NextResponse.json({ queue, active, completedToday })
  } catch (err) {
    console.error('[GET /api/tasks]', err)
    return NextResponse.json({ error: 'Failed to read tasks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureWorkspace()

    const body = await request.json()
    const { prompt, model = 'auto' } = body as { prompt?: string; model?: string }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const newTask: Task = {
      id: Math.random().toString(36).slice(2),
      prompt: prompt.trim(),
      status: 'queued',
      teams: [],
      plan: '',
      createdAt: new Date().toISOString(),
      agentLog: [],
      tokensUsed: 0,
      model,
    }

    const queuePath = path.join(WORKSPACE, 'tasks', 'queue.json')
    const queue = await readJSON<Task[]>(queuePath, [])
    queue.push(newTask)
    await writeJSON(queuePath, queue)

    return NextResponse.json(newTask, { status: 201 })
  } catch (err) {
    console.error('[POST /api/tasks]', err)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
