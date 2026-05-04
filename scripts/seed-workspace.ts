/**
 * Seed script: initializes ~/.openclaw/ with sample data.
 * Run with: npx tsx scripts/seed-workspace.ts
 */

import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

const WORKSPACE = process.env.OPENCLAW_DIR || path.join(os.homedir(), '.openclaw')

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true })
}

async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, 'utf8')
}

async function writeJSON(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2))
}

async function main() {
  console.log(`Seeding workspace at: ${WORKSPACE}`)

  // Create directory structure
  await ensureDir(path.join(WORKSPACE, 'tasks', 'completed'))
  await ensureDir(path.join(WORKSPACE, 'memory'))
  await ensureDir(path.join(WORKSPACE, 'logs'))

  // Empty task queues
  await writeJSON(path.join(WORKSPACE, 'tasks', 'queue.json'), [])
  await writeJSON(path.join(WORKSPACE, 'tasks', 'active.json'), [])

  // agent-states
  await writeJSON(path.join(WORKSPACE, 'agent-states.json'), {})

  // Empty activity log
  await writeFile(path.join(WORKSPACE, 'logs', 'activity.jsonl'), '')

  // Sample projects
  const now = new Date().toISOString()
  await writeJSON(path.join(WORKSPACE, 'projects.json'), [
    {
      id: 'proj-001',
      name: 'OpenClaw Dashboard',
      description: 'Building the Mission Control UI — a Next.js 14 cyberpunk dashboard with real-time agent status.',
      status: 'active',
      team: 'code',
      progress: 80,
      tasks: [],
      lastActivity: now,
      createdAt: now,
    },
    {
      id: 'proj-002',
      name: 'Research Pipeline',
      description: 'Automated research pipeline — scheduled briefs, trend monitoring, and structured Obsidian output.',
      status: 'active',
      team: 'research',
      progress: 55,
      tasks: [],
      lastActivity: now,
      createdAt: now,
    },
    {
      id: 'proj-003',
      name: 'Morning Brief System',
      description: 'Full-stack morning brief — Pulse news, Hertz stocks, Dawn synthesis, scheduled daily delivery.',
      status: 'completed',
      team: 'notifications',
      progress: 100,
      tasks: [],
      lastActivity: now,
      createdAt: now,
    },
  ])

  // Sample docs
  const today = new Date().toISOString().split('T')[0]
  await writeJSON(path.join(WORKSPACE, 'docs.json'), [
    {
      id: 'doc-001',
      title: 'OpenClaw System Overview',
      category: 'system',
      agent: 'Miso',
      date: today,
      wordCount: 130,
      preview: 'OpenClaw is a multi-agent AI system with 46 agents across 8 specialist teams, all coordinated by Miso.',
      content: `# OpenClaw System Overview\n\nOpenClaw is a multi-agent AI system built for Kamen Levi. It consists of 46 agents organized into 8 specialist teams.\n\n## Teams\n- **Research** (Navier lead) — web research, trend spotting, brief writing\n- **Files** (Grynk lead) — file organization, deduplication, archiving\n- **Obsidian** (Spore lead) — vault management, notes, tagging\n- **Code** (Cache lead) — architecture, coding, testing, review\n- **Scheduler** (Verge lead) — cron jobs, reminders, conflict detection\n- **Notifications** (Volta lead) — morning briefs, alerts, news\n- **Security** (Latch lead) — permissions, threat assessment, scanning\n- **Automation** (Sprocket lead) — batch processing, loop running, logging`,
      tags: ['#system', '#reference'],
    },
    {
      id: 'doc-002',
      title: 'Getting Started with OpenClaw',
      category: 'note',
      agent: 'Miso',
      date: today,
      wordCount: 90,
      preview: 'How to start your first task. Set OPENROUTER_API_KEY and submit a prompt from the Tasks page.',
      content: `# Getting Started with OpenClaw\n\n## Quick Start\n1. Copy \`.env.local.example\` to \`.env.local\`\n2. Set your \`OPENROUTER_API_KEY\`\n3. Run \`npm run dev\`\n4. Navigate to Tasks → submit a prompt\n5. Watch Miso route it in real-time via the SSE stream\n\n## Budget Mode\nBy default, only the team lead agent runs (budget mode). Set \`OPENCLAW_FULL_PIPELINE=true\` to activate all workers.\n\n## Workspace\nAll data is stored in \`~/.openclaw/\`. Run \`POST /api/init\` to seed sample data.`,
      tags: ['#system', '#reference'],
    },
    {
      id: 'doc-003',
      title: 'Agent Routing Reference',
      category: 'system',
      agent: 'Miso',
      date: today,
      wordCount: 70,
      preview: 'Miso routing JSON schema. Use teams array to dispatch. Parallel flag for concurrent team execution.',
      content: `# Agent Routing Reference\n\nMiso responds to task prompts with JSON:\n\n\`\`\`json\n{\n  "teams": ["research"],\n  "plan": "Run deep research on the topic",\n  "parallel": false,\n  "priority": "normal",\n  "notes": "Focus on sources from last 6 months"\n}\n\`\`\`\n\n## Fields\n- \`teams\` — which teams to engage\n- \`plan\` — what Miso intends to do\n- \`parallel\` — run teams simultaneously if true\n- \`priority\` — normal | high | urgent\n- \`notes\` — context passed to team leads`,
      tags: ['#system', '#reference'],
    },
  ])

  // Sample calendar jobs
  await writeJSON(path.join(WORKSPACE, 'calendar.json'), [
    {
      id: 'job-001',
      name: 'Morning Brief',
      type: 'daily',
      cron: '0 7 * * *',
      enabled: true,
      agent: 'dawn',
      prompt: 'Compile a morning brief for the user: top 5 items, bullet format, flag any URGENT items with deadlines in the next 24h. Include stocks only if >2% move. News: AI/tech/markets only.',
      createdAt: now,
    },
    {
      id: 'job-002',
      name: 'Evening Research Scan',
      type: 'daily',
      cron: '0 22 * * *',
      enabled: true,
      agent: 'navier',
      prompt: "Run a brief trend scan on today's AI and tech news. Identify any notable developments worth noting for tomorrow's morning brief. Output a short bullet list.",
      createdAt: now,
    },
    {
      id: 'job-003',
      name: 'Stock Watch',
      type: 'recurring',
      cron: '0 */4 * * *',
      enabled: false,
      agent: 'hertz',
      prompt: 'Check stock prices for NVDA, TSM, AMD, AAPL, MSFT, GOOG. Alert if any ticker has moved >2% since last check. Log prices to daily record.',
      createdAt: now,
    },
  ])

  // Today's memory log
  const memDate = today
  const memContent = `# Daily Log — ${memDate}\n\n## System\nWorkspace initialized by seed script.\n\n## Status\nAll agents ready. Submit your first task from the Tasks page.\n`
  await writeFile(path.join(WORKSPACE, 'memory', `${memDate}.md`), memContent)

  // Long-term memory starter
  await writeFile(
    path.join(WORKSPACE, 'memory', 'long-term.md'),
    `# Long-term Memory\n\n## User Preferences\n- Morning brief: max 5 items, bullet format, 07:00 daily\n- Stock alerts: >2% moves only\n- Preferred models: sonnet for reasoning, haiku for routine tasks\n`
  )

  console.log('Workspace seeded successfully.')
  console.log(`Location: ${WORKSPACE}`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
