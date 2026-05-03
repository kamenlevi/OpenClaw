import { NextResponse } from 'next/server'
import { ensureWorkspace, readJSON, writeJSON, WORKSPACE, Project, Doc, ScheduledJob } from '@/lib/workspace'
import { initCronJobs } from '@/lib/cron-manager'
import path from 'path'

export async function POST() {
  try {
    await ensureWorkspace()

    const projectsPath = path.join(WORKSPACE, 'projects.json')
    const docsPath = path.join(WORKSPACE, 'docs.json')
    const calendarPath = path.join(WORKSPACE, 'calendar.json')

    const existingProjects = await readJSON<Project[]>(projectsPath, [])
    const existingDocs = await readJSON<Doc[]>(docsPath, [])
    const existingJobs = await readJSON<ScheduledJob[]>(calendarPath, [])

    const seeded: string[] = []

    // Seed projects if empty
    if (existingProjects.length === 0) {
      const now = new Date().toISOString()
      const sampleProjects: Project[] = [
        {
          id: 'proj-seed-001',
          name: 'OpenClaw Dashboard',
          description:
            'Building the Mission Control UI for the OpenClaw agent system.',
          status: 'active',
          team: 'code',
          progress: 80,
          tasks: [],
          lastActivity: now,
          createdAt: now,
        },
        {
          id: 'proj-seed-002',
          name: 'Research Pipeline',
          description:
            'Automated research pipeline with scheduled briefs and Obsidian integration.',
          status: 'active',
          team: 'research',
          progress: 50,
          tasks: [],
          lastActivity: now,
          createdAt: now,
        },
        {
          id: 'proj-seed-003',
          name: 'Morning Brief System',
          description:
            'Fully automated daily brief: news, stocks, weather, task summary.',
          status: 'completed',
          team: 'notifications',
          progress: 100,
          tasks: [],
          lastActivity: now,
          createdAt: now,
        },
      ]
      await writeJSON(projectsPath, sampleProjects)
      seeded.push('projects')
    }

    // Seed docs if empty
    if (existingDocs.length === 0) {
      const today = new Date().toISOString().split('T')[0]
      const sampleDocs: Doc[] = [
        {
          id: 'doc-seed-001',
          title: 'OpenClaw System Overview',
          category: 'system',
          agent: 'Miso',
          date: today,
          wordCount: 120,
          preview:
            'OpenClaw is a multi-agent AI system with 46 agents across 8 specialist teams.',
          content: `# OpenClaw System Overview\n\nOpenClaw is a multi-agent AI system built for Kamen Levi. It consists of 46 agents organized into 8 specialist teams: Research, Files, Obsidian, Code, Scheduler, Notifications, Security, and Automation.\n\nAll agents are orchestrated by Miso, the central coordinator.\n\n## Teams\n- **Research** — Led by Navier. Web research, trend spotting, brief writing.\n- **Files** — Led by Grynk. File organization, deduplication, archiving.\n- **Obsidian** — Led by Spore. Vault management, notes, tagging.\n- **Code** — Led by Cache. Architecture, coding, testing, review.\n- **Scheduler** — Led by Verge. Cron jobs, reminders, conflict detection.\n- **Notifications** — Led by Volta. Morning briefs, alerts, news.\n- **Security** — Led by Latch. Permissions, threat assessment, data scanning.\n- **Automation** — Led by Sprocket. Batch processing, loop running, logging.`,
          tags: ['#system', '#reference'],
        },
        {
          id: 'doc-seed-002',
          title: 'Agent Routing Guide',
          category: 'system',
          agent: 'Miso',
          date: today,
          wordCount: 80,
          preview:
            'How Miso routes tasks to teams. Use JSON routing format for deterministic dispatch.',
          content: `# Agent Routing Guide\n\nMiso routes tasks using a JSON decision:\n\n\`\`\`json\n{"teams":["research"],"plan":"Run a deep research brief","parallel":false,"priority":"normal","notes":"Focus on recent sources"}\n\`\`\`\n\n## Routing Rules\n- Single team: route directly to that team's lead\n- Multiple teams: run sequentially or in parallel based on \`parallel\` flag\n- Always synthesize multi-team results before returning to user`,
          tags: ['#system', '#reference'],
        },
        {
          id: 'doc-seed-003',
          title: 'Getting Started',
          category: 'note',
          agent: 'Miso',
          date: today,
          wordCount: 60,
          preview:
            'Set OPENROUTER_API_KEY to start running tasks. Use the run panel on the Tasks page.',
          content: `# Getting Started\n\n1. Set \`OPENROUTER_API_KEY\` in your \`.env.local\`\n2. Run \`npm run dev\`\n3. Navigate to the Tasks page and submit a prompt\n4. Watch Miso route it to the right team in real-time\n\n## Budget Mode vs Full Pipeline\n- Default: budget mode (lead agent only per team)\n- Set \`OPENCLAW_FULL_PIPELINE=true\` to run all workers`,
          tags: ['#system', '#reference'],
        },
      ]
      await writeJSON(docsPath, sampleDocs)
      seeded.push('docs')
    }

    // Seed calendar if empty
    if (existingJobs.length === 0) {
      const now = new Date().toISOString()
      const sampleJobs: ScheduledJob[] = [
        {
          id: 'job-seed-001',
          name: 'Morning Brief',
          type: 'daily',
          cron: '0 7 * * *',
          enabled: true,
          agent: 'dawn',
          prompt:
            'Compile a morning brief for the user: top 5 items, bullet format, flag any URGENT items with deadlines in the next 24h. Include stocks only if >2% move. News: AI/tech/markets only.',
          createdAt: now,
        },
        {
          id: 'job-seed-002',
          name: 'Evening Research Scan',
          type: 'daily',
          cron: '0 22 * * *',
          enabled: true,
          agent: 'navier',
          prompt:
            'Run a brief trend scan on today\'s AI and tech news. Identify any notable developments worth noting for tomorrow\'s morning brief. Output a short bullet list.',
          createdAt: now,
        },
        {
          id: 'job-seed-003',
          name: 'Stock Watch',
          type: 'recurring',
          cron: '0 */4 * * *',
          enabled: false,
          agent: 'hertz',
          prompt:
            'Check stock prices for NVDA, TSM, AMD, AAPL, MSFT, GOOG. Alert if any ticker has moved >2% since last check.',
          createdAt: now,
        },
      ]
      await writeJSON(calendarPath, sampleJobs)
      seeded.push('calendar')

      // Schedule enabled jobs
      await initCronJobs()
    }

    return NextResponse.json({
      success: true,
      message: 'Workspace initialized.',
      seeded,
      workspace: WORKSPACE,
    })
  } catch (err) {
    console.error('[POST /api/init]', err)
    return NextResponse.json(
      { error: 'Failed to initialize workspace' },
      { status: 500 }
    )
  }
}
