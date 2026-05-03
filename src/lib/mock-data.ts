export type TaskStatus = "active" | "queued" | "completed" | "failed";

export interface Task {
  id: string;
  title: string;
  team: string;
  assignedAgents: string[];
  status: TaskStatus;
  progress: number;
  startedAt: string;
  model: "haiku" | "sonnet";
  tokensUsed: number;
  estimatedTokens?: number;
  description?: string;
}

export interface MemoryEntry {
  id: string;
  date: string;
  wordCount: number;
  preview: string;
  fullContent: string;
  type: "daily" | "longterm";
  category?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed" | "planning";
  progress: number;
  team: string;
  tasks: string[];
  lastActivity: string;
  taskCount: number;
  completedTasks: number;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  agentName: string;
  action: string;
  projectId: string;
}

export interface Doc {
  id: string;
  title: string;
  category: "briefs" | "notes" | "outputs" | "system";
  agent: string;
  date: string;
  wordCount: number;
  preview: string;
  tags: string[];
  fullContent: string;
}

export interface ScheduledJob {
  id: string;
  name: string;
  type: "daily" | "recurring" | "one-shot";
  cronExpression: string;
  cronHuman: string;
  agent: string;
  enabled: boolean;
  nextRun: string;
  lastRun: string;
  promptPreview: string;
  runCount: number;
}

// ─── TASKS ──────────────────────────────────────────────────────────────────

export const ACTIVE_TASKS: Task[] = [
  {
    id: "task-001",
    title: "Compile AI hardware investment brief for Q2 2026",
    team: "research",
    assignedAgents: ["Navier", "Bokeh", "Fermat", "Quill"],
    status: "active",
    progress: 67,
    startedAt: "2026-05-03T09:14:22Z",
    model: "sonnet",
    tokensUsed: 18420,
    description: "Research team running a comprehensive brief on AI chip investments, semiconductor trends, and key players for Q2 2026.",
  },
  {
    id: "task-002",
    title: "Build file deduplication script for ~/Documents",
    team: "code",
    assignedAgents: ["Cache", "Wafer", "Die", "Ping"],
    status: "active",
    progress: 44,
    startedAt: "2026-05-03T10:31:05Z",
    model: "sonnet",
    tokensUsed: 9870,
    description: "Code team architecting and implementing a Python script to find and remove duplicate files with dry-run safety mode.",
  },
  {
    id: "task-003",
    title: "Batch rename 847 photos from vacation 2026-04",
    team: "automation",
    assignedAgents: ["Sprocket", "Cinder", "Ratchet"],
    status: "active",
    progress: 81,
    startedAt: "2026-05-03T11:02:47Z",
    model: "haiku",
    tokensUsed: 3210,
    description: "Automation team processing vacation photos, renaming by EXIF date, organizing into subdirectories by location.",
  },
];

export const QUEUED_TASKS: Task[] = [
  {
    id: "task-004",
    title: "Tag and cross-link new Obsidian notes from this week",
    team: "obsidian",
    assignedAgents: ["Spore", "Ochre", "Lichen"],
    status: "queued",
    progress: 0,
    startedAt: "",
    model: "haiku",
    tokensUsed: 0,
    estimatedTokens: 4200,
  },
  {
    id: "task-005",
    title: "Security audit of new API credentials in .env files",
    team: "security",
    assignedAgents: ["Latch", "Shroud", "Keyway"],
    status: "queued",
    progress: 0,
    startedAt: "",
    model: "sonnet",
    tokensUsed: 0,
    estimatedTokens: 6100,
  },
  {
    id: "task-006",
    title: "Generate morning brief for tomorrow 07:00",
    team: "notifications",
    assignedAgents: ["Dawn", "Pulse", "Hertz"],
    status: "queued",
    progress: 0,
    startedAt: "",
    model: "haiku",
    tokensUsed: 0,
    estimatedTokens: 2800,
  },
  {
    id: "task-007",
    title: "Archive completed project files older than 90 days",
    team: "files",
    assignedAgents: ["Grynk", "Slag", "Shear"],
    status: "queued",
    progress: 0,
    startedAt: "",
    model: "haiku",
    tokensUsed: 0,
    estimatedTokens: 3500,
  },
  {
    id: "task-008",
    title: "Write unit tests for deduplication script",
    team: "code",
    assignedAgents: ["Ping", "Codex"],
    status: "queued",
    progress: 0,
    startedAt: "",
    model: "haiku",
    tokensUsed: 0,
    estimatedTokens: 5200,
  },
];

export const COMPLETED_TASKS: Task[] = [
  {
    id: "task-c01",
    title: "Morning brief delivered",
    team: "notifications",
    assignedAgents: ["Dawn"],
    status: "completed",
    progress: 100,
    startedAt: "2026-05-03T06:58:00Z",
    model: "haiku",
    tokensUsed: 1840,
  },
  {
    id: "task-c02",
    title: "Stock price alerts checked (NVDA, TSM, AMD)",
    team: "notifications",
    assignedAgents: ["Hertz"],
    status: "completed",
    progress: 100,
    startedAt: "2026-05-03T07:00:00Z",
    model: "haiku",
    tokensUsed: 620,
  },
  {
    id: "task-c03",
    title: "Vault coherence check — 3 broken links resolved",
    team: "obsidian",
    assignedAgents: ["Flint", "Lichen"],
    status: "completed",
    progress: 100,
    startedAt: "2026-05-03T07:15:33Z",
    model: "haiku",
    tokensUsed: 2910,
  },
  {
    id: "task-c04",
    title: "Task log for 2026-05-02 written to vault",
    team: "automation",
    assignedAgents: ["Ratchet"],
    status: "completed",
    progress: 100,
    startedAt: "2026-05-03T07:30:00Z",
    model: "haiku",
    tokensUsed: 890,
  },
  {
    id: "task-c05",
    title: "News digest compiled: AI, tech, markets",
    team: "notifications",
    assignedAgents: ["Pulse"],
    status: "completed",
    progress: 100,
    startedAt: "2026-05-03T08:00:00Z",
    model: "haiku",
    tokensUsed: 3120,
  },
  {
    id: "task-c06",
    title: "Permission check on new MCP server config",
    team: "security",
    assignedAgents: ["Keyway", "Char"],
    status: "completed",
    progress: 100,
    startedAt: "2026-05-03T08:22:11Z",
    model: "haiku",
    tokensUsed: 1450,
  },
  {
    id: "task-c07",
    title: "Cron schedule validated for new Morning Brief job",
    team: "scheduler",
    assignedAgents: ["Escapement", "Deadlock"],
    status: "completed",
    progress: 100,
    startedAt: "2026-05-03T08:45:00Z",
    model: "haiku",
    tokensUsed: 780,
  },
  {
    id: "task-c08",
    title: "Large file scan — flagged 2.3GB in Downloads",
    team: "files",
    assignedAgents: ["Rivet"],
    status: "completed",
    progress: 100,
    startedAt: "2026-05-03T09:00:00Z",
    model: "haiku",
    tokensUsed: 540,
  },
  {
    id: "task-c09",
    title: "Research trend report: LLM context window growth",
    team: "research",
    assignedAgents: ["Flux", "Quill"],
    status: "completed",
    progress: 100,
    startedAt: "2026-05-03T09:30:00Z",
    model: "haiku",
    tokensUsed: 4280,
  },
  {
    id: "task-c10",
    title: "Priority filter tuned — reduced noise by 40%",
    team: "notifications",
    assignedAgents: ["Volta"],
    status: "completed",
    progress: 100,
    startedAt: "2026-05-03T10:10:00Z",
    model: "haiku",
    tokensUsed: 1120,
  },
];

// ─── MEMORY ──────────────────────────────────────────────────────────────────

export const DAILY_LOGS: MemoryEntry[] = [
  {
    id: "log-2026-05-03",
    date: "2026-05-03",
    wordCount: 842,
    preview: "Active day — Research team mid-sprint on AI hardware brief. Code team building deduplication tooling. 10 tasks completed before noon.",
    type: "daily",
    fullContent: `# Daily Log — 2026-05-03

## Summary
Active operational day. Three tasks running concurrently as of 11:30. Research team is mid-sprint on the Q2 AI hardware investment brief — Navier reports 67% complete, Quill drafting the synthesis layer. Code team is building the file deduplication script; Cache's architecture review passed and Wafer is implementing the hash-comparison logic. Automation team nearly done with vacation photo batch rename (847 files, 81% complete).

## Completed (10 tasks)
- Morning brief delivered at 06:58 by Dawn
- Stock alerts checked at 07:00 by Hertz — NVDA +1.2%, TSM flat, AMD -0.4%
- Vault coherence check cleared 3 broken links (Flint + Lichen)
- Daily task log from 2026-05-02 written to vault by Ratchet
- News digest compiled by Pulse: top stories around Anthropic Claude 4, EU AI Act enforcement, TSMC capacity expansion
- Security cleared new MCP server config (Keyway + Char)
- Cron schedule for Morning Brief validated (Escapement confirmed no conflicts)
- Rivet flagged 2.3GB in ~/Downloads — mostly old VM images and video files
- Research trend report on LLM context window growth completed (Flux + Quill)
- Volta recalibrated priority filter; notification noise down ~40% from last week

## Notes
User asked to pause the Obsidian cleanup task until Research brief is done — scheduled to queue after task-001 completes. Security team has a pending audit on the .env files; flagged two credentials that may be stale. Will run tomorrow morning.

## Token Usage Today
- Total: ~47,550 tokens used across 10 completed tasks
- 3 active tasks: ~31,500 tokens in progress
- Projected daily total: ~79,000 tokens`,
  },
  {
    id: "log-2026-05-02",
    date: "2026-05-02",
    wordCount: 614,
    preview: "Lighter day — 6 tasks completed. Obsidian vault cleanup ran overnight. New cron job set up for Ratchet's 30-min task logging.",
    type: "daily",
    fullContent: `# Daily Log — 2026-05-02

## Summary
Lighter operational day. User was mostly offline. Six tasks completed, primarily maintenance and scheduled work. The Obsidian vault cleanup ran as a background task — Pumice removed 14 stale notes and Lichen re-linked 22 orphaned notes. A new recurring cron job was configured: Ratchet now logs task completions every 30 minutes.

## Completed (6 tasks)
- Morning brief delivered at 07:00 by Dawn
- Vault cleanup — 14 stale notes removed, 22 orphaned notes linked (Pumice + Lichen + Ochre)
- Ratchet cron job configured: every 30min task logging
- News digest compiled by Pulse
- Permission audit on 3 new shell scripts flagged by user
- Scheduler conflict check — no conflicts found

## Notes
User noted that the morning brief is too long — asked to trim to top 5 items max. Updated Dawn's prompt accordingly. Will take effect from 2026-05-03.

## Token Usage
- Total: ~23,400 tokens
- Well below average — quiet day`,
  },
  {
    id: "log-2026-05-01",
    date: "2026-05-01",
    wordCount: 723,
    preview: "Code team busy with API wrapper refactor. Die found 3 bugs in the retry logic. Security team ran full threat assessment on new integration.",
    type: "daily",
    fullContent: `# Daily Log — 2026-05-01

## Summary
Code team was the primary focus today. The API wrapper refactor started at user request — Cache designed the new interface, Wafer and Shader implemented core changes, Die ran a thorough bug-finding pass and uncovered 3 issues in the retry logic (exponential backoff not resetting on success, incorrect timeout propagation, race condition in concurrent requests). All three fixed. Temper ran code review, passed with minor suggestions. Security team performed a full threat assessment on the new external API integration.

## Completed (8 tasks)
- API wrapper architecture review (Cache)
- Core refactor implementation (Wafer + Shader)
- Bug finding pass — 3 bugs found and fixed (Die)
- Code review — approved with notes (Temper)
- Unit test suite generated (Ping)
- Documentation updated (Codex)
- Threat assessment on new API integration (Latch + Char + Shroud)
- Morning brief delivered (Dawn)

## Notes
Die's bug discoveries in retry logic were non-trivial — good catch. The race condition would have caused intermittent failures under load. Integration threat assessment came back low-risk with one recommendation: rotate the API key after 90 days. Tick has set a reminder.

## Token Usage
- Total: ~68,200 tokens — heavy code day`,
  },
  {
    id: "log-2026-04-30",
    date: "2026-04-30",
    wordCount: 519,
    preview: "End of April summary compiled by Quill. Research ran a market trend scan. Files team archived 4.1GB of old project data.",
    type: "daily",
    fullContent: `# Daily Log — 2026-04-30

## Summary
End-of-month wrap-up day. Quill compiled the April summary document — 31 tasks completed this month, 847 tokens per task average. Research team did a broad market trend scan (Flux + Navier). Files team performed the scheduled monthly archive — 4.1GB moved to cold storage, Shear reviewed all deletions before committing.

## Completed (5 tasks)
- April monthly summary compiled (Quill)
- Market trend scan: AI, semiconductor, open-source LLM (Flux + Navier)
- Monthly file archive — 4.1GB cold storage (Grynk + Slag + Shear)
- Reminder set for Q2 review on May 15 (Tick)
- Morning brief delivered (Dawn)

## Notes
April was a productive month. The code team was busiest. Research ran 12 briefs total. Considering adding a Navier "weekly brief" to the scheduled jobs.

## Token Usage
- Total: ~31,800 tokens`,
  },
  {
    id: "log-2026-04-29",
    date: "2026-04-29",
    wordCount: 488,
    preview: "Scheduler team added 2 new jobs. Notification noise was high — Volta recalibrated filters. Obsidian team tagged 47 new notes.",
    type: "daily",
    fullContent: `# Daily Log — 2026-04-29

## Summary
Scheduler updates and notification calibration were the focus. Two new cron jobs added: Pulse news digest at 08:00 daily, and Hertz stock watch every 4 hours. Volta recalibrated notification filters after user reported excessive alerts — reduced threshold scores by 15%. Obsidian team ran a tagging sprint: 47 notes now have consistent tags, Ochre generated a tag taxonomy document.

## Completed (6 tasks)
- Two new cron jobs configured (Escapement + Verge)
- Notification filter recalibration (Volta)
- Obsidian tagging sprint — 47 notes (Ochre + Spore)
- Tag taxonomy document created (Spore)
- Morning brief delivered (Dawn)
- News digest compiled (Pulse)

## Token Usage
- Total: ~28,600 tokens`,
  },
  {
    id: "log-2026-04-28",
    date: "2026-04-28",
    wordCount: 392,
    preview: "Light day — 4 tasks. User offline. Scheduled maintenance only. Ratchet log shows all automated jobs ran cleanly.",
    type: "daily",
    fullContent: `# Daily Log — 2026-04-28

## Summary
User offline all day. Only scheduled/automated tasks ran. All automated jobs executed cleanly per Ratchet's log. Morning brief sent but not read (flagged for next morning's summary).

## Completed (4 tasks)
- Morning brief delivered (Dawn) — unread
- Stock alerts checked (Hertz) — no threshold breaches
- News digest compiled (Pulse) — queued for tomorrow
- Ratchet 30-min logs ran x48 — all clean

## Token Usage
- Total: ~8,200 tokens — mostly automated`,
  },
  {
    id: "log-2026-04-27",
    date: "2026-04-27",
    wordCount: 651,
    preview: "System initialization day. Miso came online, all teams registered and pinged. First morning brief ran successfully at 07:00.",
    type: "daily",
    fullContent: `# Daily Log — 2026-04-27

## Summary
System initialization and team registration completed. All 8 teams (46 agents total) successfully registered. Initial ping health check returned 100% — all agents responsive. First automated morning brief ran at 07:00 by Dawn. Research team ran a test brief on a user-provided topic (\"state of local LLMs\") — successful, output written to vault by Slate.

## Key Events
- System init complete: 46/46 agents online
- All team leads (Navier, Grynk, Spore, Cache, Verge, Volta, Latch, Sprocket) confirmed
- Dawn delivered first morning brief at 07:00
- Test research brief on local LLMs completed (Navier + Bokeh + Quill)
- Results written to Obsidian vault (Slate)
- Initial cron schedule configured: Morning Brief daily 07:00

## Notes
First operational day. System performing well. User expressed interest in adding stock tracking — Hertz configured and Volta tuned for financial signals. Will activate tomorrow.

## Token Usage
- Total: ~41,200 tokens — initialization overhead`,
  },
];

export const LONG_TERM_MEMORIES: MemoryEntry[] = [
  {
    id: "lt-001",
    date: "2026-04-27",
    wordCount: 312,
    preview: "User prefers brief morning summaries — max 5 items. Format: bullet points, no prose. Urgency flags for anything time-sensitive.",
    type: "longterm",
    category: "User Preferences",
    fullContent: `# User Preference: Morning Brief Format

**Established:** 2026-04-27, updated 2026-05-02

User prefers morning briefs to be:
- **Maximum 5 items** — no more, no less
- **Bullet point format** — no prose paragraphs
- **Urgency flag** for anything with a deadline in the next 24h
- Stock information only when there's a notable move (>2% change)
- News: only AI/tech/markets — no general news

**Example format user approved:**
\`\`\`
MORNING BRIEF — Mon 05 May 2026

• [URGENT] Q2 review meeting at 14:00 today
• NVDA +3.2% — new high following earnings
• Anthropic released Claude 4 API — pricing unchanged
• 3 tasks completed overnight, 2 queued for today
• Weather: Clear, 18°C
\`\`\`

Dawn's prompt was updated 2026-05-02 to enforce this format. Previous longer briefs caused user friction.`,
  },
  {
    id: "lt-002",
    date: "2026-04-29",
    wordCount: 198,
    preview: "Tag taxonomy established for Obsidian vault. Core tags: #ai, #code, #research, #personal, #project, #reference. Sub-tags defined.",
    type: "longterm",
    category: "Vault Structure",
    fullContent: `# Obsidian Vault Tag Taxonomy

**Established:** 2026-04-29 by Spore + Ochre

## Core Tags (required on every note)
- \`#ai\` — AI/ML content
- \`#code\` — programming, scripts, technical
- \`#research\` — research outputs and briefs
- \`#personal\` — personal notes, journal, preferences
- \`#project\` — project-specific notes
- \`#reference\` — reference material, resources

## Sub-tags
- \`#ai/llm\`, \`#ai/hardware\`, \`#ai/safety\`
- \`#code/python\`, \`#code/typescript\`, \`#code/shell\`
- \`#research/market\`, \`#research/tech\`, \`#research/brief\`

## Status tags
- \`#status/draft\`, \`#status/final\`, \`#status/archived\`

All new notes created by Slate must include at least one core tag and one status tag.`,
  },
  {
    id: "lt-003",
    date: "2026-05-01",
    wordCount: 256,
    preview: "Security decision: all API keys to be rotated every 90 days. Tick has reminders set. Char maintains a threat log for all integrations.",
    type: "longterm",
    category: "Security Policy",
    fullContent: `# Security Policy: API Key Rotation

**Established:** 2026-05-01 after threat assessment

## Policy
All API keys and secrets must be rotated on a 90-day cycle.

## Current Keys Tracked
| Key | Service | Last Rotated | Next Rotation |
|-----|---------|--------------|---------------|
| ANTHROPIC_API_KEY | Anthropic | 2026-04-15 | 2026-07-14 |
| OPENAI_API_KEY | OpenAI | 2026-03-20 | 2026-06-18 |
| SEARCH_API_KEY | Brave Search | 2026-04-27 | 2026-07-26 |

## Reminders
Tick has set calendar reminders 7 days before each rotation due date.

## Process
1. Char assesses risk level before rotation
2. Keyway validates new key permissions match policy
3. Shroud scans codebase for any hardcoded keys
4. Latch signs off on completion

Stale credentials found in .env files on 2026-05-03 are under review.`,
  },
  {
    id: "lt-004",
    date: "2026-04-30",
    wordCount: 178,
    preview: "April 2026: 31 tasks completed. Code team most active (11 tasks). Research ran 8 briefs. Avg tokens per task: 847.",
    type: "longterm",
    category: "Performance Metrics",
    fullContent: `# Monthly Summary: April 2026

**Compiled:** 2026-04-30 by Quill

## Task Volume
- **Total tasks completed:** 31
- **Failed tasks:** 0
- **Average tokens per task:** 847
- **Total tokens used:** 26,257

## Team Breakdown
| Team | Tasks | Avg Tokens |
|------|-------|------------|
| Code | 11 | 1,240 |
| Research | 8 | 1,100 |
| Notifications | 6 | 420 |
| Obsidian | 3 | 680 |
| Files | 2 | 890 |
| Security | 1 | 1,450 |

## Notable Achievements
- API wrapper refactor completed cleanly
- Zero security incidents
- Vault tagging taxonomy established

## Areas for Improvement
- Notification noise was high in early April — resolved by Volta recalibration`,
  },
  {
    id: "lt-005",
    date: "2026-05-02",
    wordCount: 144,
    preview: "Recurring pattern: user works Mon-Fri, offline weekends. Automated tasks continue but no interactive sessions. Briefings queued for Monday.",
    type: "longterm",
    category: "User Patterns",
    fullContent: `# User Activity Pattern

**Observed:** 2026-04-28 to 2026-05-02

## Weekly Pattern
- **Mon-Fri:** Active user sessions, interactive tasks, responses to briefs
- **Weekends:** User offline, automated/scheduled tasks continue
- Weekend briefs are queued and delivered as a combined summary on Monday morning

## Implications
- Don't schedule heavy research tasks on Fri afternoon (results not reviewed until Mon)
- Batch low-priority notifications for Monday morning summary
- Weekend maintenance tasks (file cleanup, vault coherence) can run freely
- Time-sensitive alerts (security, failures) should still be sent immediately

Dawn has been updated to include a "Weekend Catch-up" section in Monday briefs.`,
  },
];

// ─── PROJECTS ────────────────────────────────────────────────────────────────

export const PROJECTS: Project[] = [
  {
    id: "proj-001",
    name: "OpenClaw Dashboard",
    description: "Building the Mission Control UI for the OpenClaw agent system — a Next.js 14 cyberpunk dashboard with real-time agent status.",
    status: "active",
    progress: 78,
    team: "code",
    tasks: ["task-002", "task-008", "task-c03"],
    lastActivity: "2026-05-03T11:45:00Z",
    taskCount: 14,
    completedTasks: 11,
  },
  {
    id: "proj-002",
    name: "Research Pipeline",
    description: "Automated research pipeline — scheduled briefs, trend monitoring, and structured output to Obsidian vault.",
    status: "active",
    progress: 55,
    team: "research",
    tasks: ["task-001", "task-c09"],
    lastActivity: "2026-05-03T09:14:22Z",
    taskCount: 8,
    completedTasks: 4,
  },
  {
    id: "proj-003",
    name: "Obsidian Vault Cleanup",
    description: "Systematic cleanup of the Obsidian vault — remove stale notes, fix broken links, enforce tag taxonomy, improve coherence.",
    status: "paused",
    progress: 62,
    team: "obsidian",
    tasks: ["task-004", "task-c03"],
    lastActivity: "2026-05-03T07:15:33Z",
    taskCount: 6,
    completedTasks: 4,
  },
  {
    id: "proj-004",
    name: "Morning Brief System",
    description: "Full-stack morning brief pipeline — Pulse news aggregation, Hertz stock data, Dawn synthesis, scheduled daily delivery.",
    status: "completed",
    progress: 100,
    team: "notifications",
    tasks: ["task-c01", "task-c02", "task-c05"],
    lastActivity: "2026-05-02T16:30:00Z",
    taskCount: 9,
    completedTasks: 9,
  },
  {
    id: "proj-005",
    name: "Code Review Automation",
    description: "Automated code review pipeline using Die + Temper for bug detection and review on all commits to watched repositories.",
    status: "planning",
    progress: 12,
    team: "code",
    tasks: [],
    lastActivity: "2026-05-01T14:20:00Z",
    taskCount: 3,
    completedTasks: 0,
  },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "act-001", timestamp: "2026-05-03T11:48:00Z", agentName: "Ratchet", action: "Logged 847/847 files renamed successfully", projectId: "proj-001" },
  { id: "act-002", timestamp: "2026-05-03T11:32:00Z", agentName: "Wafer", action: "Implemented SHA-256 hash comparison module", projectId: "proj-001" },
  { id: "act-003", timestamp: "2026-05-03T11:15:00Z", agentName: "Quill", action: "Began synthesis draft for AI hardware brief", projectId: "proj-002" },
  { id: "act-004", timestamp: "2026-05-03T10:58:00Z", agentName: "Fermat", action: "Deep-read 4 TSMC investor reports", projectId: "proj-002" },
  { id: "act-005", timestamp: "2026-05-03T10:44:00Z", agentName: "Cache", action: "Architecture review passed — 5 modules approved", projectId: "proj-001" },
  { id: "act-006", timestamp: "2026-05-03T10:22:00Z", agentName: "Die", action: "Bug scan: 0 critical, 2 minor style issues", projectId: "proj-001" },
  { id: "act-007", timestamp: "2026-05-03T09:30:00Z", agentName: "Flux", action: "Trend report: LLM context growth chart generated", projectId: "proj-002" },
  { id: "act-008", timestamp: "2026-05-03T08:22:00Z", agentName: "Keyway", action: "MCP server config permissions validated", projectId: "proj-005" },
  { id: "act-009", timestamp: "2026-05-03T07:15:00Z", agentName: "Flint", action: "3 broken vault links resolved", projectId: "proj-003" },
  { id: "act-010", timestamp: "2026-05-03T07:00:00Z", agentName: "Dawn", action: "Morning brief delivered — 5 items, 1 urgent", projectId: "proj-004" },
];

// ─── DOCS ────────────────────────────────────────────────────────────────────

export const DOCS: Doc[] = [
  {
    id: "doc-001",
    title: "Q2 2026 AI Hardware Investment Brief (DRAFT)",
    category: "briefs",
    agent: "Quill",
    date: "2026-05-03",
    wordCount: 1840,
    preview: "AI hardware investment is accelerating sharply into Q2 2026. NVDA dominates inference-time compute; TSMC expanding CoWoS packaging...",
    tags: ["#research/market", "#ai/hardware", "#status/draft"],
    fullContent: `# Q2 2026 AI Hardware Investment Brief

**Status:** DRAFT — In Progress
**Lead:** Navier | **Author:** Quill
**Date:** 2026-05-03
**Tokens used:** 18,420 (ongoing)

---

## Executive Summary

AI hardware investment is accelerating sharply into Q2 2026, driven by hyperscaler capex commitments and a new wave of inference-time compute demand. NVIDIA maintains dominant gross margins on H100/H200/B200 at 74%+ while TSMC's advanced packaging (CoWoS-L) bottleneck is being resolved via new capacity coming online in Q3.

## Key Players

### NVIDIA (NVDA)
- B200 NVL72 now shipping to top-5 cloud providers
- H100 demand remains strong in enterprise segment
- Grace Blackwell superchip ramp ahead of schedule

### TSMC (TSM)
- CoWoS capacity expansion +40% YoY by Q3 2026
- 2nm N2 process entering risk production
- Arizona fab reaching 20% of advanced packaging capacity

### AMD (AMD)
- MI350 announced — competitive with H100 on inference
- ROCm software stack maturity improving
- Gaining share in open-source LLM workloads

## Market Trends
- Inference compute demand growing faster than training (3:1 ratio)
- Edge inference market emerging — qualcomm, apple, mediatek
- Memory bandwidth becoming primary bottleneck

## Investment Thesis
[SYNTHESIS IN PROGRESS — Quill drafting]`,
  },
  {
    id: "doc-002",
    title: "LLM Context Window Growth Trends",
    category: "briefs",
    agent: "Flux",
    date: "2026-05-03",
    wordCount: 620,
    preview: "Context windows have grown 1000x in 3 years. GPT-4 launched at 8K in 2023; current frontier models exceed 1M tokens...",
    tags: ["#research/tech", "#ai/llm", "#status/final"],
    fullContent: `# LLM Context Window Growth Trends

**Author:** Flux
**Date:** 2026-05-03
**Status:** Final

## Overview

Context windows have grown approximately 1000x in three years. GPT-4 launched with an 8K context window in March 2023. By Q2 2026, frontier models routinely offer 1M+ tokens, with some research models exceeding 10M.

## Timeline
- **2023 Q1:** GPT-4 — 8K tokens
- **2023 Q4:** GPT-4 Turbo — 128K tokens
- **2024 Q2:** Claude 3 — 200K tokens
- **2025 Q1:** Gemini 1.5 Pro — 1M tokens
- **2025 Q4:** Claude 4 — 2M tokens
- **2026 Q1:** Frontier average — 1-2M tokens

## Implications
- RAG architectures less critical for moderate document lengths
- Long-context reasoning emerging as key differentiator
- Memory/KV-cache cost remains quadratic — efficiency innovations needed`,
  },
  {
    id: "doc-003",
    title: "April 2026 Monthly Operations Summary",
    category: "outputs",
    agent: "Quill",
    date: "2026-04-30",
    wordCount: 890,
    preview: "April was the strongest month since system initialization. 31 tasks completed, zero failures, 26,257 total tokens...",
    tags: ["#reference", "#status/final", "#project"],
    fullContent: `# April 2026 Monthly Operations Summary

**Author:** Quill
**Compiled:** 2026-04-30
**Status:** Final

## Performance Overview

April was the strongest month since system initialization on 2026-04-27. 31 tasks completed with zero failures. Total token consumption of 26,257 is below budget.

## Key Achievements
1. **API wrapper refactor** — Clean architecture, zero bugs post-review (Code team)
2. **Vault taxonomy** — Tag structure established for long-term organization (Obsidian team)
3. **Morning brief system** — Fully operational, Dawn delivering daily since day 1
4. **Security policy** — API key rotation policy established and tracked (Security team)

## Metrics
- Tasks completed: 31
- Tasks failed: 0
- Total tokens: 26,257
- Average tokens/task: 847
- Active agents: 46/46

## Recommendations for May
- Add Navier's weekly brief to scheduled jobs
- Consider Code Review Automation project (Die + Temper pipeline)
- Evaluate notification volume — Volta to recalibrate`,
  },
  {
    id: "doc-004",
    title: "Obsidian Tag Taxonomy v1.0",
    category: "system",
    agent: "Spore",
    date: "2026-04-29",
    wordCount: 445,
    preview: "Official tag taxonomy for the OpenClaw Obsidian vault. Core tags are required on every note. Sub-tags provide granularity...",
    tags: ["#reference", "#status/final", "#ai"],
    fullContent: `# Obsidian Tag Taxonomy v1.0

**Author:** Spore + Ochre
**Date:** 2026-04-29
**Status:** Final — in use

## Core Tags (required on every note)
All notes must have exactly one core tag:
- \`#ai\` — AI/ML content
- \`#code\` — programming content
- \`#research\` — research outputs
- \`#personal\` — personal notes
- \`#project\` — project notes
- \`#reference\` — reference material

## Sub-tags
### #ai subtags
- \`#ai/llm\` — large language models
- \`#ai/hardware\` — AI chips and infrastructure
- \`#ai/safety\` — AI safety and alignment

### #code subtags
- \`#code/python\`, \`#code/typescript\`, \`#code/shell\`

### #research subtags
- \`#research/market\`, \`#research/tech\`, \`#research/brief\`

## Status Tags (required)
- \`#status/draft\` — work in progress
- \`#status/final\` — complete
- \`#status/archived\` — historical`,
  },
  {
    id: "doc-005",
    title: "Security Policy: API Key Rotation",
    category: "system",
    agent: "Latch",
    date: "2026-05-01",
    wordCount: 312,
    preview: "All API keys must be rotated every 90 days. Tracked keys: Anthropic, OpenAI, Brave Search. Tick reminders set 7 days before...",
    tags: ["#reference", "#status/final", "#code"],
    fullContent: `# Security Policy: API Key Rotation

**Author:** Latch
**Date:** 2026-05-01
**Status:** Final — active policy

All API keys must be rotated on a 90-day cycle. This policy was established following the threat assessment on 2026-05-01.

## Tracked Keys
| Key | Service | Last Rotated | Next Rotation |
|-----|---------|--------------|---------------|
| ANTHROPIC_API_KEY | Anthropic | 2026-04-15 | 2026-07-14 |
| OPENAI_API_KEY | OpenAI | 2026-03-20 | 2026-06-18 |
| SEARCH_API_KEY | Brave | 2026-04-27 | 2026-07-26 |

## Rotation Process
1. Char assesses risk pre-rotation
2. Keyway validates new key permissions
3. Shroud scans for hardcoded keys
4. Latch signs off`,
  },
  {
    id: "doc-006",
    title: "Morning Brief Format Specification",
    category: "system",
    agent: "Dawn",
    date: "2026-05-02",
    wordCount: 198,
    preview: "Dawn's morning brief must follow the 5-item bullet format. No prose. Urgency flags for <24h deadlines. Stocks only on >2% moves...",
    tags: ["#reference", "#status/final", "#personal"],
    fullContent: `# Morning Brief Format Specification

**Author:** Dawn (updated by Miso per user feedback)
**Date:** 2026-05-02
**Status:** Final — active

## Format Rules
1. Maximum 5 items — never more
2. Bullet point format — no prose paragraphs
3. Urgency flag [URGENT] for deadlines within 24h
4. Stock data only when move >2%
5. News: AI/tech/markets only — no general news

## Template
\`\`\`
MORNING BRIEF — [Day DD Mon YYYY]

• [item 1]
• [item 2]
• [item 3]
• [item 4]
• [item 5]
\`\`\`

## Monday Addition
Include a "Weekend Catch-up" section summarizing any notable automated activity over the weekend.`,
  },
  {
    id: "doc-007",
    title: "File Deduplication Script — Architecture Notes",
    category: "notes",
    agent: "Cache",
    date: "2026-05-03",
    wordCount: 534,
    preview: "Architecture for the Python deduplication script. Two-pass approach: fast hash (MD5) first, then SHA-256 for confirmed dupes...",
    tags: ["#code/python", "#status/draft", "#project"],
    fullContent: `# File Deduplication Script — Architecture Notes

**Author:** Cache
**Date:** 2026-05-03
**Status:** Draft — implementation in progress

## Approach
Two-pass duplicate detection:
1. **Fast pass:** MD5 hash of first 64KB (quick, catches obvious dupes)
2. **Confirmation pass:** Full SHA-256 of suspected duplicates only

This avoids hashing entire large files unnecessarily.

## Modules
- \`scanner.py\` — recursive directory walk, file metadata collection
- \`hasher.py\` — implements two-pass hashing strategy
- \`reporter.py\` — generates report of duplicates found
- \`cleaner.py\` — removes duplicates (dry-run mode default)
- \`cli.py\` — command-line interface

## Safety Features
- Dry-run mode by default (--execute flag required to delete)
- Keeps newest file by default (configurable)
- Writes deletion log before executing
- Shear-style review prompt for files >100MB

## Status
Wafer implementing \`hasher.py\` and \`scanner.py\`. Die bug scan scheduled after completion.`,
  },
  {
    id: "doc-008",
    title: "Vault Coherence Check — May 3 Report",
    category: "outputs",
    agent: "Flint",
    date: "2026-05-03",
    wordCount: 267,
    preview: "3 broken links found and resolved. 1 factual inconsistency flagged in AI hardware notes. 847 notes checked, 844 clean...",
    tags: ["#ai", "#status/final", "#project"],
    fullContent: `# Vault Coherence Check — 2026-05-03

**Author:** Flint
**Date:** 2026-05-03 07:15
**Status:** Final

## Summary
847 notes checked. 844 clean. 3 issues found and resolved.

## Issues Found

### Broken Links (3)
1. \`[[AI Hardware 2025]]\` in \`Research/semiconductors.md\` — target note renamed, re-linked to \`[[AI Hardware Q1 2025]]\`
2. \`[[Morning Brief Template]]\` in \`System/dawn-config.md\` — note deleted, re-linked to \`[[Morning Brief Format Specification]]\`
3. \`[[Claude 3.5 Analysis]]\` in \`Research/llm-comparison.md\` — target moved, Lichen updated link path

### Factual Inconsistency (flagged, not auto-resolved)
- \`Research/llm-comparison.md\` states Claude 3 max context is 100K tokens — actual is 200K
- Flagged for user review before editing

## Recommendation
Update \`llm-comparison.md\` context window figure. Flux's new trend report has correct data.`,
  },
  {
    id: "doc-009",
    title: "User Preferences Master Document",
    category: "system",
    agent: "Miso",
    date: "2026-05-02",
    wordCount: 421,
    preview: "Consolidated user preferences: brief format, working hours, notification thresholds, vault structure, task priorities...",
    tags: ["#personal", "#status/final", "#reference"],
    fullContent: `# User Preferences Master Document

**Author:** Miso
**Last Updated:** 2026-05-02
**Status:** Living document — updated as preferences are observed

## Communication
- Morning brief: 5 items max, bullet format, 07:00 daily
- Notifications: low noise preferred, urgency threshold is high
- Stock alerts: >2% moves only
- Weekend: batch and send Monday

## Working Hours
- Active: Monday–Friday, approximately 09:00–18:00 local time
- Offline: weekends, automated tasks continue
- Do not initiate interactive tasks outside working hours unless urgent

## Vault
- Tag taxonomy v1.0 in use (see \`System/Obsidian Tag Taxonomy\`)
- Notes should be concise — prefer 200-500 words
- Daily logs kept by Miso, weekly summaries by Quill

## Tasks
- Prefer sonnet for architecture, planning, review
- Prefer haiku for routine, repetitive, batch tasks
- Research briefs: sonnet lead + haiku scouts
- Code tasks: sonnet for core logic, haiku for tests/docs

## Priorities
1. Security (never compromise)
2. Code quality
3. Research accuracy
4. Notification relevance
5. Organization`,
  },
  {
    id: "doc-010",
    title: "MCP Server Configuration — Threat Assessment",
    category: "outputs",
    agent: "Char",
    date: "2026-05-03",
    wordCount: 389,
    preview: "Risk assessment for new MCP server integration. Overall: LOW RISK. One recommendation: rotate integration key after 90 days...",
    tags: ["#code", "#status/final", "#reference"],
    fullContent: `# MCP Server Configuration — Threat Assessment

**Author:** Char + Keyway + Shroud
**Date:** 2026-05-03 08:22
**Reviewed by:** Latch
**Status:** Final — CLEARED

## Assessment Summary
**Overall Risk: LOW**

The new MCP server configuration was reviewed for security risks. No critical or high-risk issues found.

## Findings

### Low Risk
1. **Integration API key** — Valid, scoped correctly to read-only endpoints. Recommend rotation in 90 days per policy.
2. **Network exposure** — Server listens on localhost only. No public exposure.
3. **Permission scope** — Keyway confirmed permissions are minimal (read filesystem, write to vault only).

### Informational
- Shroud found no hardcoded secrets in config files
- Logging is enabled and writing to correct location
- Rate limiting configured (100 req/min)

## Recommendation
Configuration is approved for use. Tick has set a rotation reminder for the integration key at T+90 days (2026-08-01).

## Sign-off
Latch: APPROVED 2026-05-03 08:45`,
  },
  {
    id: "doc-011",
    title: "Research Pipeline Architecture",
    category: "system",
    agent: "Navier",
    date: "2026-04-30",
    wordCount: 612,
    preview: "Architecture of the automated research pipeline. Scout → Dive → Critique → Rank → Synthesize → Write. Each phase parallelizable...",
    tags: ["#research/tech", "#status/final", "#project"],
    fullContent: `# Research Pipeline Architecture

**Author:** Navier
**Date:** 2026-04-30
**Status:** Final — in production

## Pipeline Phases

### Phase 1: Scout (Bokeh)
- Runs 3-5 parallel web searches on topic keywords
- Returns: list of URLs with titles and snippets
- Speed optimized — target <30s

### Phase 2: Deep Dive (Fermat)
- Reads full content of top 5-8 URLs from scout
- Extracts key claims, data points, quotes
- Flags technical complexity for Navier review

### Phase 3: Source Critique (Aperture)
- Rates each source: credibility, recency, relevance, bias
- Removes low-quality sources
- Returns scored source list

### Phase 4: Relevance Filter (Refract)
- Ranks information by relevance to original query
- Removes tangential content
- Returns prioritized information set

### Phase 5: Trend Spotting (Flux)
- Identifies patterns across sources
- Notes emerging trends, consensus vs. outliers
- Adds temporal context

### Phase 6: Synthesis (Navier)
- Integrates all phase outputs
- Resolves contradictions
- Produces structured research document

### Phase 7: Writing (Quill)
- Formats synthesis into final brief
- Applies house style (headers, bullets, tables)
- Target: 800-1200 words for standard briefs

## Parallelism
Phases 1-2 are sequential. Phases 3-5 run in parallel. Phase 6-7 are sequential.`,
  },
  {
    id: "doc-012",
    title: "Stock Watch Configuration",
    category: "system",
    agent: "Hertz",
    date: "2026-04-28",
    wordCount: 234,
    preview: "Hertz stock watch configuration. Monitored: NVDA, TSM, AMD, AAPL, MSFT, GOOG. Alert threshold: ±2%. Runs every 4 hours...",
    tags: ["#personal", "#status/final", "#reference"],
    fullContent: `# Stock Watch Configuration

**Author:** Hertz
**Date:** 2026-04-28
**Status:** Final — active

## Monitored Tickers
- NVDA (NVIDIA) — primary AI play
- TSM (TSMC) — AI supply chain
- AMD (AMD) — GPU/AI accelerator
- AAPL (Apple) — edge AI
- MSFT (Microsoft) — cloud/AI platforms
- GOOG (Google/Alphabet) — AI research + cloud

## Alert Rules
- Intraday move >2%: send notification
- Market open/close: check and log
- Earnings dates: flag 2 days before

## Schedule
Runs every 4 hours via Dawn cron job. Market hours (NYSE: 09:30-16:00 ET) only for intraday alerts.

## Output
Alerts delivered via Volta priority filter → Dawn morning brief (non-urgent) or immediate notification (>5% move, after hours).`,
  },
];

// ─── CALENDAR ────────────────────────────────────────────────────────────────

export const SCHEDULED_JOBS: ScheduledJob[] = [
  {
    id: "job-001",
    name: "Miso: Morning Brief",
    type: "daily",
    cronExpression: "0 7 * * *",
    cronHuman: "Daily at 07:00",
    agent: "Dawn",
    enabled: true,
    nextRun: "2026-05-04T07:00:00Z",
    lastRun: "2026-05-03T07:00:00Z",
    promptPreview: "Compile a morning brief for the user: top 5 items, bullet format, flag any URGENT items with deadlines in the next 24h. Include stocks only if >2% move. News: AI/tech/markets only.",
    runCount: 7,
  },
  {
    id: "job-002",
    name: "Navier: Evening Research",
    type: "daily",
    cronExpression: "0 22 * * *",
    cronHuman: "Daily at 22:00",
    agent: "Navier",
    enabled: true,
    nextRun: "2026-05-03T22:00:00Z",
    lastRun: "2026-05-02T22:00:00Z",
    promptPreview: "Run a brief trend scan on today's AI and tech news. Identify any notable developments worth noting for tomorrow's morning brief. Output a short bullet list to vault.",
    runCount: 6,
  },
  {
    id: "job-003",
    name: "Dawn: Stock Watch",
    type: "recurring",
    cronExpression: "0 */4 * * *",
    cronHuman: "Every 4 hours",
    agent: "Hertz",
    enabled: true,
    nextRun: "2026-05-03T16:00:00Z",
    lastRun: "2026-05-03T12:00:00Z",
    promptPreview: "Check stock prices for NVDA, TSM, AMD, AAPL, MSFT, GOOG. Alert user if any ticker has moved >2% since last check. Log prices to daily record.",
    runCount: 42,
  },
  {
    id: "job-004",
    name: "Grynk: File Cleanup",
    type: "recurring",
    cronExpression: "0 3 * * 1",
    cronHuman: "Every Monday at 03:00",
    agent: "Grynk",
    enabled: false,
    nextRun: "2026-05-06T03:00:00Z",
    lastRun: "2026-04-21T03:00:00Z",
    promptPreview: "Scan ~/Downloads and ~/Desktop for files older than 30 days. Move to ~/Archive with original path preserved. Report summary of files moved. Do not delete — archive only.",
    runCount: 3,
  },
  {
    id: "job-005",
    name: "Pulse: News Digest",
    type: "daily",
    cronExpression: "0 8 * * *",
    cronHuman: "Daily at 08:00",
    agent: "Pulse",
    enabled: true,
    nextRun: "2026-05-04T08:00:00Z",
    lastRun: "2026-05-03T08:00:00Z",
    promptPreview: "Aggregate top news stories across: AI/ML, semiconductor industry, open-source software, tech business. Max 10 items, ranked by relevance. Write to vault as daily-digest note.",
    runCount: 7,
  },
  {
    id: "job-006",
    name: "Ratchet: Task Log",
    type: "recurring",
    cronExpression: "*/30 * * * *",
    cronHuman: "Every 30 minutes",
    agent: "Ratchet",
    enabled: true,
    nextRun: "2026-05-03T12:00:00Z",
    lastRun: "2026-05-03T11:30:00Z",
    promptPreview: "Log all task completions from the last 30 minutes. Record: task ID, agent, duration, token count, outcome. Append to daily task log in vault.",
    runCount: 288,
  },
];
