import { NextResponse } from 'next/server'
import { ensureWorkspace, readJSON, writeJSON, Task, WORKSPACE } from '@/lib/workspace'
import path from 'path'
import { promises as fs } from 'fs'

async function findTask(id: string): Promise<Task | null> {
  const queuePath = path.join(WORKSPACE, 'tasks', 'queue.json')
  const activePath = path.join(WORKSPACE, 'tasks', 'active.json')

  const queue = await readJSON<Task[]>(queuePath, [])
  const found = queue.find((t) => t.id === id)
  if (found) return found

  const active = await readJSON<Task[]>(activePath, [])
  const foundActive = active.find((t) => t.id === id)
  if (foundActive) return foundActive

  // Search completed files
  const completedDir = path.join(WORKSPACE, 'tasks', 'completed')
  try {
    const files = await fs.readdir(completedDir)
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      const tasks = await readJSON<Task[]>(
        path.join(completedDir, file),
        []
      )
      const found = tasks.find((t) => t.id === id)
      if (found) return found
    }
  } catch {
    // completed dir may not exist yet
  }

  return null
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureWorkspace()
    const task = await findTask(params.id)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json(task)
  } catch (err) {
    console.error('[GET /api/tasks/[id]]', err)
    return NextResponse.json({ error: 'Failed to find task' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureWorkspace()

    const queuePath = path.join(WORKSPACE, 'tasks', 'queue.json')
    const queue = await readJSON<Task[]>(queuePath, [])
    const task = queue.find((t) => t.id === params.id)

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found in queue. Only queued tasks can be deleted.' },
        { status: 404 }
      )
    }

    await writeJSON(
      queuePath,
      queue.filter((t) => t.id !== params.id)
    )

    return NextResponse.json({ success: true, deleted: params.id })
  } catch (err) {
    console.error('[DELETE /api/tasks/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
