import { NextResponse } from 'next/server'
import { ensureWorkspace, readJSON, writeJSON, Doc, WORKSPACE } from '@/lib/workspace'
import path from 'path'

const DOCS_PATH = path.join(WORKSPACE, 'docs.json')

export async function GET() {
  try {
    await ensureWorkspace()
    const docs = await readJSON<Doc[]>(DOCS_PATH, [])
    return NextResponse.json(docs)
  } catch (err) {
    console.error('[GET /api/docs]', err)
    return NextResponse.json({ error: 'Failed to read docs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureWorkspace()

    const body = await request.json()
    const {
      title,
      category = 'note',
      agent,
      content,
      tags = [],
    } = body as {
      title?: string
      category?: Doc['category']
      agent?: string
      content?: string
      tags?: string[]
    }

    if (!title || !agent || !content) {
      return NextResponse.json(
        { error: 'title, agent, and content are required' },
        { status: 400 }
      )
    }

    const words = content.split(/\s+/).filter(Boolean)
    const preview = words.slice(0, 30).join(' ') + (words.length > 30 ? '…' : '')

    const newDoc: Doc = {
      id: Math.random().toString(36).slice(2),
      title,
      category,
      agent,
      date: new Date().toISOString().split('T')[0],
      wordCount: words.length,
      preview,
      content,
      tags,
    }

    const docs = await readJSON<Doc[]>(DOCS_PATH, [])
    docs.unshift(newDoc) // newest first
    await writeJSON(DOCS_PATH, docs)

    return NextResponse.json(newDoc, { status: 201 })
  } catch (err) {
    console.error('[POST /api/docs]', err)
    return NextResponse.json({ error: 'Failed to create doc' }, { status: 500 })
  }
}
