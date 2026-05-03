import { NextResponse } from 'next/server'
import {
  ensureWorkspace,
  readMemoryFiles,
  writeMemoryEntry,
  readLongTermMemory,
} from '@/lib/workspace'

export async function GET() {
  try {
    await ensureWorkspace()

    const entries = await readMemoryFiles()
    const longTerm = await readLongTermMemory()

    return NextResponse.json({ entries, longTerm })
  } catch (err) {
    console.error('[GET /api/memory]', err)
    return NextResponse.json({ error: 'Failed to read memory' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureWorkspace()

    const body = await request.json()
    const { date, content } = body as { date?: string; content?: string }

    if (!date || !content) {
      return NextResponse.json(
        { error: 'date and content are required' },
        { status: 400 }
      )
    }

    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'date must be in YYYY-MM-DD format' },
        { status: 400 }
      )
    }

    await writeMemoryEntry(date, content)

    return NextResponse.json({ success: true, date })
  } catch (err) {
    console.error('[POST /api/memory]', err)
    return NextResponse.json({ error: 'Failed to write memory entry' }, { status: 500 })
  }
}
