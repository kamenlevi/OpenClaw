import { NextResponse } from 'next/server'
import { ensureWorkspace, readJSON, writeJSON, Task, WORKSPACE, appendLog } from '@/lib/workspace'
import { runTask } from '@/lib/orchestrator'
import { initializeServer } from '@/lib/startup'
import path from 'path'

export async function POST(request: Request) {
  try {
    await initializeServer()
    await ensureWorkspace()

    const body = await request.json()
    const { prompt } = body as { prompt?: string }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const newTask: Task = {
      id: Math.random().toString(36).slice(2),
      prompt: prompt.trim(),
      status: 'active',
      teams: [],
      plan: '',
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      agentLog: [],
      tokensUsed: 0,
      model: 'auto',
    }

    // Add to active.json immediately
    const activePath = path.join(WORKSPACE, 'tasks', 'active.json')
    const active = await readJSON<Task[]>(activePath, [])
    active.push(newTask)
    await writeJSON(activePath, active)

    await appendLog({
      type: 'task_started',
      timestamp: new Date().toISOString(),
      taskId: newTask.id,
      data: { prompt: newTask.prompt },
    })

    // Fire and forget — runs in background
    runTask(newTask).catch((err: unknown) => {
      console.error(`[orchestrator] Task ${newTask.id} failed:`, err)
    })

    return NextResponse.json({ taskId: newTask.id, status: 'started' }, { status: 202 })
  } catch (err) {
    console.error('[POST /api/agents/run]', err)
    return NextResponse.json({ error: 'Failed to start task' }, { status: 500 })
  }
}
