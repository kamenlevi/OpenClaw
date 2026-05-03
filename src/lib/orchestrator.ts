import { callAgent } from './openrouter'
import { SYSTEM_PROMPTS } from './agent-prompts'
import {
  Task,
  AgentLogEntry,
  readJSON,
  writeJSON,
  appendLog,
  writeMemoryEntry,
  WORKSPACE,
} from './workspace'
import { emitEvent } from './event-bus'
import path from 'path'

// Team pipeline definitions: lead → workers in order
const TEAM_PIPELINES: Record<
  string,
  { lead: string; workers: string[]; leadModel: 'sonnet' | 'haiku' }
> = {
  research: {
    lead: 'navier',
    workers: ['bokeh', 'fermat', 'aperture', 'flux', 'refract', 'quill'],
    leadModel: 'sonnet',
  },
  files: {
    lead: 'grynk',
    workers: ['plonk', 'rivet', 'bracket', 'slag', 'shear', 'ledger'],
    leadModel: 'sonnet',
  },
  obsidian: {
    lead: 'spore',
    workers: ['slate', 'lichen', 'ochre', 'pumice', 'flint'],
    leadModel: 'sonnet',
  },
  code: {
    lead: 'cache',
    workers: ['wafer', 'shader', 'solder', 'die', 'temper', 'ping', 'codex'],
    leadModel: 'sonnet',
  },
  scheduler: {
    lead: 'verge',
    workers: ['escapement', 'tick', 'deadlock'],
    leadModel: 'haiku',
  },
  notifications: {
    lead: 'volta',
    workers: ['dawn', 'hertz', 'pulse', 'flare'],
    leadModel: 'haiku',
  },
  security: {
    lead: 'latch',
    workers: ['keyway', 'shroud', 'char'],
    leadModel: 'sonnet',
  },
  automation: {
    lead: 'sprocket',
    workers: ['cinder', 'cam', 'ratchet'],
    leadModel: 'haiku',
  },
}

// Whether to run full worker pipeline or lead-only (budget mode)
// Set OPENCLAW_FULL_PIPELINE=true to run all workers
const FULL_PIPELINE = process.env.OPENCLAW_FULL_PIPELINE === 'true'

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export async function runTask(task: Task): Promise<Task> {
  const log: AgentLogEntry[] = []
  let totalTokensIn = 0
  let totalTokensOut = 0

  const addLog = (entry: AgentLogEntry) => {
    log.push(entry)
    task.agentLog = [...log]
    emitEvent({ type: 'agent_log', taskId: task.id, entry })
  }

  try {
    // 1. Miso routing
    emitEvent({ type: 'task_status', taskId: task.id, status: 'routing', agent: 'miso' })

    const misoResult = await callAgent(
      'miso',
      'sonnet',
      SYSTEM_PROMPTS.miso,
      task.prompt,
      300
    )
    totalTokensIn += misoResult.tokensIn
    totalTokensOut += misoResult.tokensOut
    addLog({
      agentId: 'miso',
      agentName: 'Miso',
      timestamp: new Date().toISOString(),
      input: task.prompt,
      output: misoResult.content,
      tokensIn: misoResult.tokensIn,
      tokensOut: misoResult.tokensOut,
    })

    // Parse routing decision
    let routing: { teams: string[]; plan: string; parallel: boolean; notes: string }
    try {
      const jsonMatch = misoResult.content.match(/\{[\s\S]*\}/)
      routing = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { teams: ['research'], plan: misoResult.content, parallel: false, notes: '' }
    } catch {
      routing = {
        teams: ['research'],
        plan: misoResult.content,
        parallel: false,
        notes: '',
      }
    }

    task.teams = routing.teams
    task.plan = routing.plan

    // Update active.json with routing info
    await updateActiveTask(task)
    emitEvent({
      type: 'task_routed',
      taskId: task.id,
      teams: routing.teams,
      plan: routing.plan,
    })

    // 2. Execute teams
    const teamResults: Record<string, string> = {}

    const executeTeam = async (teamName: string): Promise<string> => {
      const pipeline = TEAM_PIPELINES[teamName]
      if (!pipeline) return `Unknown team: ${teamName}`

      emitEvent({ type: 'team_start', taskId: task.id, team: teamName })

      const teamContext = `Task: ${task.prompt}\n\nMiso's plan: ${routing.plan}\n\nNotes: ${routing.notes}`

      if (!FULL_PIPELINE) {
        // Budget mode: lead only
        const result = await callAgent(
          pipeline.lead,
          pipeline.leadModel,
          SYSTEM_PROMPTS[pipeline.lead] ?? '',
          teamContext,
          800
        )
        totalTokensIn += result.tokensIn
        totalTokensOut += result.tokensOut
        addLog({
          agentId: pipeline.lead,
          agentName: capitalize(pipeline.lead),
          timestamp: new Date().toISOString(),
          input: teamContext,
          output: result.content,
          tokensIn: result.tokensIn,
          tokensOut: result.tokensOut,
        })
        emitEvent({ type: 'team_done', taskId: task.id, team: teamName })
        return result.content
      }

      // Full pipeline mode: workers → lead synthesis
      const workerOutputs: string[] = []
      for (const workerId of pipeline.workers) {
        const workerPrompt = SYSTEM_PROMPTS[workerId]
        if (!workerPrompt) continue
        const workerCtx = `${teamContext}\n\nPrevious team work:\n${workerOutputs.join('\n\n')}`
        const result = await callAgent(workerId, 'haiku', workerPrompt, workerCtx, 500)
        totalTokensIn += result.tokensIn
        totalTokensOut += result.tokensOut
        workerOutputs.push(`[${workerId}]: ${result.content}`)
        addLog({
          agentId: workerId,
          agentName: capitalize(workerId),
          timestamp: new Date().toISOString(),
          input: workerCtx,
          output: result.content,
          tokensIn: result.tokensIn,
          tokensOut: result.tokensOut,
        })
      }

      // Lead synthesis
      const synthesisCtx = `${teamContext}\n\nWorker outputs:\n${workerOutputs.join('\n\n')}\n\nSynthesize these into the final team output.`
      const leadResult = await callAgent(
        pipeline.lead,
        pipeline.leadModel,
        SYSTEM_PROMPTS[pipeline.lead] ?? '',
        synthesisCtx,
        800
      )
      totalTokensIn += leadResult.tokensIn
      totalTokensOut += leadResult.tokensOut
      addLog({
        agentId: pipeline.lead,
        agentName: capitalize(pipeline.lead),
        timestamp: new Date().toISOString(),
        input: synthesisCtx,
        output: leadResult.content,
        tokensIn: leadResult.tokensIn,
        tokensOut: leadResult.tokensOut,
      })

      emitEvent({ type: 'team_done', taskId: task.id, team: teamName })
      return leadResult.content
    }

    if (routing.parallel && routing.teams.length > 1) {
      const results = await Promise.all(
        routing.teams.map((t) =>
          executeTeam(t).then((r) => [t, r] as [string, string])
        )
      )
      results.forEach(([t, r]) => {
        teamResults[t] = r
      })
    } else {
      for (const teamName of routing.teams) {
        teamResults[teamName] = await executeTeam(teamName)
      }
    }

    // 3. Miso synthesis (if multiple teams)
    let finalResult: string
    if (routing.teams.length === 1) {
      finalResult = teamResults[routing.teams[0]] ?? ''
    } else {
      const synthesisPrompt = `Original task: ${task.prompt}\n\nTeam results:\n${Object.entries(teamResults)
        .map(([t, r]) => `[${t.toUpperCase()}]:\n${r}`)
        .join('\n\n')}\n\nSynthesize these into a clear final response.`
      const synthResult = await callAgent(
        'miso',
        'sonnet',
        SYSTEM_PROMPTS.miso,
        synthesisPrompt,
        500
      )
      totalTokensIn += synthResult.tokensIn
      totalTokensOut += synthResult.tokensOut
      addLog({
        agentId: 'miso',
        agentName: 'Miso',
        timestamp: new Date().toISOString(),
        input: synthesisPrompt,
        output: synthResult.content,
        tokensIn: synthResult.tokensIn,
        tokensOut: synthResult.tokensOut,
      })
      finalResult = synthResult.content
    }

    // 4. Write results
    const now = new Date()
    task.status = 'completed'
    task.completedAt = now.toISOString()
    task.result = finalResult
    task.tokensUsed = totalTokensIn + totalTokensOut
    task.agentLog = log

    // Move from active to completed
    await moveToCompleted(task)

    // Append to today's memory log
    const dateStr = now.toISOString().split('T')[0]
    const memoryEntry = `## Task completed — ${now.toLocaleTimeString()}\n\n**Prompt:** ${task.prompt}\n\n**Result:**\n${finalResult}\n\n---\n`
    await writeMemoryEntry(dateStr, memoryEntry)

    await appendLog({
      type: 'task_complete',
      timestamp: now.toISOString(),
      taskId: task.id,
      data: { prompt: task.prompt, teams: routing.teams, tokensUsed: task.tokensUsed },
    })
    emitEvent({
      type: 'task_complete',
      taskId: task.id,
      result: finalResult,
      tokensUsed: task.tokensUsed,
    })

    return task
  } catch (error) {
    task.status = 'failed'
    task.result = `Error: ${error instanceof Error ? error.message : String(error)}`
    await moveToCompleted(task)
    emitEvent({ type: 'task_failed', taskId: task.id, error: task.result })
    throw error
  }
}

async function updateActiveTask(task: Task): Promise<void> {
  const activePath = path.join(WORKSPACE, 'tasks', 'active.json')
  const active = await readJSON<Task[]>(activePath, [])
  const idx = active.findIndex((t) => t.id === task.id)
  if (idx >= 0) active[idx] = task
  else active.push(task)
  await writeJSON(activePath, active)
}

async function moveToCompleted(task: Task): Promise<void> {
  // Remove from active
  const activePath = path.join(WORKSPACE, 'tasks', 'active.json')
  const active = await readJSON<Task[]>(activePath, [])
  await writeJSON(
    activePath,
    active.filter((t) => t.id !== task.id)
  )

  // Also remove from queue
  const queuePath = path.join(WORKSPACE, 'tasks', 'queue.json')
  const queue = await readJSON<Task[]>(queuePath, [])
  await writeJSON(
    queuePath,
    queue.filter((t) => t.id !== task.id)
  )

  // Write to completed
  const dateStr = new Date().toISOString().split('T')[0]
  const completedPath = path.join(
    WORKSPACE,
    'tasks',
    'completed',
    `completed-${dateStr}.json`
  )
  const completed = await readJSON<Task[]>(completedPath, [])
  completed.push(task)
  await writeJSON(completedPath, completed)
}
