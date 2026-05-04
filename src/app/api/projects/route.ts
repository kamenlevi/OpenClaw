import { NextResponse } from 'next/server'
import { ensureWorkspace, readJSON, writeJSON, Project, WORKSPACE } from '@/lib/workspace'
import path from 'path'

const PROJECTS_PATH = path.join(WORKSPACE, 'projects.json')

export async function GET() {
  try {
    await ensureWorkspace()
    const projects = await readJSON<Project[]>(PROJECTS_PATH, [])
    return NextResponse.json(projects)
  } catch (err) {
    console.error('[GET /api/projects]', err)
    return NextResponse.json({ error: 'Failed to read projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureWorkspace()

    const body = await request.json()
    const { name, description, team, status = 'active', progress = 0 } = body as {
      name?: string
      description?: string
      team?: string
      status?: Project['status']
      progress?: number
    }

    if (!name || !description || !team) {
      return NextResponse.json(
        { error: 'name, description, and team are required' },
        { status: 400 }
      )
    }

    const newProject: Project = {
      id: Math.random().toString(36).slice(2),
      name,
      description,
      status,
      team,
      progress,
      tasks: [],
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    const projects = await readJSON<Project[]>(PROJECTS_PATH, [])
    projects.push(newProject)
    await writeJSON(PROJECTS_PATH, projects)

    return NextResponse.json(newProject, { status: 201 })
  } catch (err) {
    console.error('[POST /api/projects]', err)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await ensureWorkspace()

    const body = await request.json()
    const { id, ...updates } = body as { id?: string } & Partial<Project>

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const projects = await readJSON<Project[]>(PROJECTS_PATH, [])
    const idx = projects.findIndex((p) => p.id === id)

    if (idx < 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    projects[idx] = {
      ...projects[idx],
      ...updates,
      id, // prevent id override
      lastActivity: new Date().toISOString(),
    }

    await writeJSON(PROJECTS_PATH, projects)

    return NextResponse.json(projects[idx])
  } catch (err) {
    console.error('[PUT /api/projects]', err)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}
