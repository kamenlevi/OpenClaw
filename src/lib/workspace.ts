import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

export const WORKSPACE =
  process.env.OPENCLAW_DIR || path.join(os.homedir(), '.openclaw')

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Task {
  id: string
  prompt: string
  status: 'queued' | 'active' | 'completed' | 'failed'
  teams: string[]
  plan: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  result?: string
  agentLog: AgentLogEntry[]
  tokensUsed: number
  model: string
}

export interface AgentLogEntry {
  agentId: string
  agentName: string
  timestamp: string
  input: string
  output: string
  tokensIn: number
  tokensOut: number
}

export interface MemoryEntry {
  date: string
  wordCount: number
  preview: string
  content: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed'
  team: string
  progress: number
  tasks: string[]
  lastActivity: string
  createdAt: string
}

export interface Doc {
  id: string
  title: string
  category: 'brief' | 'note' | 'output' | 'system'
  agent: string
  date: string
  wordCount: number
  preview: string
  content: string
  tags: string[]
}

export interface ScheduledJob {
  id: string
  name: string
  type: 'daily' | 'recurring' | 'one-shot'
  cron: string
  enabled: boolean
  agent: string
  prompt: string
  lastRun?: string
  nextRun?: string
  createdAt: string
}

export interface LogEvent {
  type: string
  timestamp: string
  agentId?: string
  taskId?: string
  data: unknown
}

// ─── Workspace setup ─────────────────────────────────────────────────────────

export async function ensureWorkspace(): Promise<void> {
  const dirs = [
    path.join(WORKSPACE, 'tasks', 'completed'),
    path.join(WORKSPACE, 'memory'),
    path.join(WORKSPACE, 'logs'),
  ]
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true })
  }

  // Ensure base files exist
  await ensureFile(path.join(WORKSPACE, 'tasks', 'queue.json'), '[]')
  await ensureFile(path.join(WORKSPACE, 'tasks', 'active.json'), '[]')
  await ensureFile(path.join(WORKSPACE, 'projects.json'), '[]')
  await ensureFile(path.join(WORKSPACE, 'docs.json'), '[]')
  await ensureFile(path.join(WORKSPACE, 'calendar.json'), '[]')
  await ensureFile(path.join(WORKSPACE, 'agent-states.json'), '{}')
  await ensureFile(path.join(WORKSPACE, 'memory', 'long-term.md'), '# Long-term Memory\n\n')
  await ensureFile(path.join(WORKSPACE, 'logs', 'activity.jsonl'), '')
}

async function ensureFile(filePath: string, defaultContent: string): Promise<void> {
  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, defaultContent, 'utf8')
  }
}

// ─── JSON helpers ─────────────────────────────────────────────────────────────

export async function readJSON<T>(relPath: string, fallback: T): Promise<T> {
  // relPath can be absolute (contains WORKSPACE) or relative to WORKSPACE
  const filePath = path.isAbsolute(relPath) ? relPath : path.join(WORKSPACE, relPath)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function writeJSON(relPath: string, data: unknown): Promise<void> {
  const filePath = path.isAbsolute(relPath) ? relPath : path.join(WORKSPACE, relPath)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

// ─── Log helpers ──────────────────────────────────────────────────────────────

export async function appendLog(event: LogEvent): Promise<void> {
  const logPath = path.join(WORKSPACE, 'logs', 'activity.jsonl')
  const line = JSON.stringify(event) + '\n'
  try {
    await fs.appendFile(logPath, line, 'utf8')
  } catch {
    // If log dir doesn't exist yet, create it and retry
    await fs.mkdir(path.join(WORKSPACE, 'logs'), { recursive: true })
    await fs.appendFile(logPath, line, 'utf8')
  }
}

// ─── Memory helpers ───────────────────────────────────────────────────────────

export async function readMemoryFiles(): Promise<MemoryEntry[]> {
  const memDir = path.join(WORKSPACE, 'memory')
  try {
    const files = await fs.readdir(memDir)
    const mdFiles = files
      .filter((f) => f.endsWith('.md') && f !== 'long-term.md')
      .sort()
      .reverse()

    const entries: MemoryEntry[] = []
    for (const file of mdFiles) {
      const content = await fs.readFile(path.join(memDir, file), 'utf8')
      const date = file.replace('.md', '')
      const words = content.split(/\s+/).filter(Boolean)
      const preview = words.slice(0, 25).join(' ') + (words.length > 25 ? '…' : '')
      entries.push({ date, wordCount: words.length, preview, content })
    }
    return entries
  } catch {
    return []
  }
}

export async function writeMemoryEntry(date: string, content: string): Promise<void> {
  const memPath = path.join(WORKSPACE, 'memory', `${date}.md`)
  try {
    const existing = await fs.readFile(memPath, 'utf8')
    await fs.writeFile(memPath, existing + '\n' + content, 'utf8')
  } catch {
    await fs.writeFile(memPath, `# Daily Log — ${date}\n\n` + content, 'utf8')
  }
}

export async function readLongTermMemory(): Promise<string> {
  const ltPath = path.join(WORKSPACE, 'memory', 'long-term.md')
  try {
    return await fs.readFile(ltPath, 'utf8')
  } catch {
    return ''
  }
}
