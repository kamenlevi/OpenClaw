"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ACTIVE_TASKS,
  QUEUED_TASKS,
  COMPLETED_TASKS,
} from "@/lib/mock-data";
import { TEAM_COLORS, TeamName } from "@/lib/agents";
import StatusDot from "@/components/StatusDot";
import AgentBadge from "@/components/AgentBadge";
import { useSSE } from "@/hooks/useSSE";

// ─── API types ───────────────────────────────────────────────────────────────

interface AgentLogEntry {
  agentId: string;
  agentName: string;
  timestamp: string;
  output: string;
  tokensIn: number;
  tokensOut: number;
}

interface ApiTask {
  id: string;
  prompt: string;
  status: "queued" | "active" | "completed" | "failed";
  teams: string[];
  plan: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: string;
  agentLog: AgentLogEntry[];
  tokensUsed: number;
  model: string;
}

// ─── Adapters: convert mock tasks to display shape ───────────────────────────

interface DisplayTask {
  id: string;
  title: string;
  team: string;
  teams: string[];
  assignedAgents: string[];
  status: string;
  startedAt: string;
  model: string;
  tokensUsed: number;
  agentLog: AgentLogEntry[];
  result?: string;
}

function mockToDisplay(
  task: (typeof ACTIVE_TASKS)[0] | (typeof QUEUED_TASKS)[0] | (typeof COMPLETED_TASKS)[0]
): DisplayTask {
  return {
    id: task.id,
    title: task.title,
    team: task.team,
    teams: [task.team],
    assignedAgents: task.assignedAgents,
    status: task.status,
    startedAt: task.startedAt || "",
    model: task.model,
    tokensUsed: task.tokensUsed,
    agentLog: [],
  };
}

function apiToDisplay(task: ApiTask): DisplayTask {
  const latestAgent =
    task.agentLog.length > 0
      ? task.agentLog[task.agentLog.length - 1].agentName
      : "";
  return {
    id: task.id,
    title: task.prompt,
    team: task.teams[0] ?? "unknown",
    teams: task.teams,
    assignedAgents: latestAgent ? [latestAgent] : task.teams,
    status: task.status,
    startedAt: task.startedAt ?? task.createdAt,
    model: task.model,
    tokensUsed: task.tokensUsed,
    agentLog: task.agentLog,
    result: task.result,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(isoString: string): string {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function elapsedTime(isoString: string): string {
  if (!isoString) return "—";
  const start = new Date(isoString).getTime();
  const now = Date.now();
  const diff = Math.floor((now - start) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

// ─── Task Input Bar ───────────────────────────────────────────────────────────

interface SubmitState {
  status: "idle" | "routing" | "executing" | "done" | "error";
  taskId?: string;
  activeTeams: string[];
  message?: string;
}

function TaskInputBar({
  onTaskStarted,
}: {
  onTaskStarted: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    activeTeams: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || submitState.status === "routing" || submitState.status === "executing") return;

    setSubmitState({ status: "routing", activeTeams: [] });

    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setSubmitState({
        status: "executing",
        taskId: data.taskId,
        activeTeams: [],
      });
      setPrompt("");
      onTaskStarted();
    } catch {
      setSubmitState({
        status: "error",
        activeTeams: [],
        message: "Failed to start task",
      });
      setTimeout(() => setSubmitState({ status: "idle", activeTeams: [] }), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  // SSE-driven state updates for this input bar
  const handleSSEEvent = useCallback(
    (event: Record<string, unknown>) => {
      if (!submitState.taskId) return;
      if (event.taskId !== submitState.taskId) return;

      if (event.type === "task_status") {
        const s = event.status as string;
        setSubmitState((prev) => ({ ...prev, status: s === "done" ? "done" : "executing" }));
      }
      if (event.type === "team_start") {
        setSubmitState((prev) => ({
          ...prev,
          activeTeams: [...prev.activeTeams, event.team as string],
        }));
      }
      if (event.type === "team_done") {
        setSubmitState((prev) => ({
          ...prev,
          activeTeams: prev.activeTeams.filter((t) => t !== event.team),
        }));
      }
      if (event.type === "task_complete" || event.type === "task_failed") {
        setSubmitState({ status: "done", activeTeams: [] });
        setTimeout(() => setSubmitState({ status: "idle", activeTeams: [] }), 4000);
        onTaskStarted(); // trigger re-fetch
      }
    },
    [submitState.taskId, onTaskStarted]
  );

  useSSE(handleSSEEvent);

  const statusColors: Record<string, string> = {
    routing: "#f59e0b",
    executing: "#22c55e",
    done: "#8b5cf6",
    error: "#ef4444",
  };

  return (
    <div className="bg-[#080a12] border border-[#2a3a5c] mb-6">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e2535] bg-[#0c0e1a]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] opacity-70" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] opacity-70" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] opacity-70" />
        </div>
        <span className="text-[0.6rem] font-mono text-[#374151] tracking-[0.2em] uppercase ml-2">
          miso terminal
        </span>
        {submitState.status !== "idle" && (
          <span
            className="ml-auto text-[0.55rem] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 border animate-pulse"
            style={{
              color: statusColors[submitState.status] ?? "#64748b",
              borderColor: statusColors[submitState.status] ?? "#64748b",
              background: `${statusColors[submitState.status] ?? "#64748b"}15`,
            }}
          >
            {submitState.status === "routing"
              ? "ROUTING..."
              : submitState.status === "executing"
              ? "EXECUTING"
              : submitState.status === "done"
              ? "DISPATCHED ✓"
              : "ERROR"}
          </span>
        )}
      </div>

      {/* Input row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-[#22c55e] font-mono text-sm flex-shrink-0 select-none">
          miso@openclaw:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Give Miso a task... (e.g. 'Research the latest developments in Apple Silicon')"
          className="flex-1 bg-transparent font-mono text-[0.8rem] text-[#e2e8f0] placeholder-[#374151] focus:outline-none caret-[#22c55e]"
          disabled={submitState.status === "routing" || submitState.status === "executing"}
        />
        <button
          onClick={handleSubmit}
          disabled={!prompt.trim() || submitState.status === "routing" || submitState.status === "executing"}
          className="flex-shrink-0 px-3 py-1.5 font-mono text-[0.7rem] font-bold tracking-wider border transition-colors disabled:opacity-30"
          style={{
            color: "#22c55e",
            borderColor: "#22c55e",
            background: "rgba(34,197,94,0.08)",
          }}
        >
          SEND →
        </button>
      </div>

      {/* Active teams row */}
      {submitState.activeTeams.length > 0 && (
        <div className="flex items-center gap-2 px-4 pb-3">
          <span className="text-[0.6rem] font-mono text-[#374151] uppercase tracking-wider">
            Active:
          </span>
          {submitState.activeTeams.map((team) => {
            const color = TEAM_COLORS[team as TeamName] ?? "#64748b";
            return (
              <span
                key={team}
                className="text-[0.55rem] font-mono font-bold px-1.5 py-0.5 border tracking-wider uppercase animate-pulse"
                style={{ color, borderColor: color, background: `${color}15` }}
              >
                {team}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Active Task Card ─────────────────────────────────────────────────────────

function ActiveTaskCard({ task }: { task: DisplayTask }) {
  const teamColor = TEAM_COLORS[task.team as TeamName] ?? "#64748b";
  const latestLog = task.agentLog[task.agentLog.length - 1];
  const currentAgent = latestLog?.agentName ?? task.assignedAgents[0] ?? "";

  return (
    <div
      className="flex-1 min-w-0 bg-[#0f1220] border border-[#2a3a5c] relative overflow-hidden"
      style={{ borderLeft: `4px solid ${teamColor}` }}
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ background: teamColor }}
      />

      <div className="relative p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusDot status="active" pulse={true} size="sm" />
            {task.teams.map((t) => {
              const c = TEAM_COLORS[t as TeamName] ?? "#64748b";
              return (
                <span
                  key={t}
                  className="text-[0.6rem] font-mono font-bold tracking-[0.15em] uppercase"
                  style={{ color: c }}
                >
                  {t.toUpperCase()}
                </span>
              );
            })}
          </div>
          <span
            className="text-[0.55rem] font-mono font-bold px-1.5 py-0.5 border tracking-wider uppercase animate-pulse"
            style={{
              color: "#22c55e",
              borderColor: "#22c55e",
              background: "rgba(34,197,94,0.08)",
            }}
          >
            WORKING
          </span>
        </div>

        {/* Task title */}
        <h3 className="text-[0.8rem] font-mono font-bold text-[#e2e8f0] leading-snug mb-3">
          {task.title}
        </h3>

        {/* Current agent */}
        {currentAgent && (
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: teamColor, boxShadow: `0 0 4px ${teamColor}` }}
            />
            <span className="text-[0.65rem] font-mono" style={{ color: teamColor }}>
              {currentAgent}
            </span>
            <span className="text-[0.6rem] font-mono text-[#374151]">running</span>
          </div>
        )}

        {/* Team pills */}
        {task.teams.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.teams.map((t) => {
              const c = TEAM_COLORS[t as TeamName] ?? "#64748b";
              return (
                <span
                  key={t}
                  className="text-[0.55rem] font-mono font-bold px-1.5 py-0.5 border tracking-wider uppercase"
                  style={{ color: c, borderColor: c, background: `${c}15` }}
                >
                  {t}
                </span>
              );
            })}
          </div>
        )}

        {/* Agent log terminal */}
        {task.agentLog.length > 0 && (
          <div className="bg-[#080a12] border border-[#1e2535] p-2 mb-3 max-h-28 overflow-y-auto">
            <div className="text-[0.55rem] font-mono text-[#374151] uppercase tracking-wider mb-1">
              Agent Log
            </div>
            {task.agentLog.slice(-6).map((entry, i) => (
              <div key={i} className="text-[0.65rem] font-mono text-[#64748b] leading-relaxed">
                <span style={{ color: teamColor }}>▶ {entry.agentName}:</span>{" "}
                {entry.output.slice(0, 100)}
                {entry.output.length > 100 ? "…" : ""}
              </div>
            ))}
          </div>
        )}

        {/* Agents row — fallback when no log */}
        {task.agentLog.length === 0 && task.assignedAgents.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.assignedAgents.map((agent) => (
              <AgentBadge key={agent} name={agent} color={teamColor} size="xs" />
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="flex justify-between items-center text-[0.6rem] font-mono text-[#64748b]">
          <div className="flex gap-3">
            <span>
              <span className="text-[#374151] uppercase tracking-wider">Model:</span>{" "}
              <span className="text-[#64748b]">{task.model}</span>
            </span>
            <span>
              <span className="text-[#374151] uppercase tracking-wider">Tokens:</span>{" "}
              <span className="text-[#c87941] rust-glow-text">{formatTokens(task.tokensUsed)}</span>
            </span>
          </div>
          <span className="text-[#374151]">{elapsedTime(task.startedAt)} elapsed</span>
        </div>
      </div>
    </div>
  );
}

// ─── Queue Row ────────────────────────────────────────────────────────────────

function QueuedTaskRow({ task, index }: { task: DisplayTask; index: number }) {
  const teamColor = TEAM_COLORS[task.team as TeamName] ?? "#64748b";

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#1e2535] hover:bg-[#0f1220] transition-colors">
      <span className="text-[0.65rem] font-mono font-bold text-[#374151] w-5 text-right flex-shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div
        className="w-0.5 h-6 flex-shrink-0"
        style={{ background: teamColor, opacity: 0.6 }}
      />
      <span
        className="text-[0.6rem] font-mono font-bold uppercase tracking-wider w-24 flex-shrink-0"
        style={{ color: teamColor }}
      >
        {task.team}
      </span>
      <span className="flex-1 text-[0.75rem] font-mono text-[#e2e8f0] truncate">
        {task.title}
      </span>
      <div className="flex gap-1.5 flex-shrink-0">
        {task.assignedAgents.slice(0, 3).map((a) => (
          <AgentBadge key={a} name={a} color={teamColor} size="xs" />
        ))}
        {task.assignedAgents.length > 3 && (
          <span className="text-[0.55rem] font-mono text-[#374151]">
            +{task.assignedAgents.length - 3}
          </span>
        )}
      </div>
      <span
        className="text-[0.6rem] font-mono w-16 text-right flex-shrink-0"
        style={{ color: task.model === "sonnet" ? "#8b5cf6" : "#64748b" }}
      >
        {task.model}
      </span>
    </div>
  );
}

// ─── Completed Row ────────────────────────────────────────────────────────────

function CompletedTaskRow({ task }: { task: DisplayTask }) {
  const teamColor = TEAM_COLORS[task.team as TeamName] ?? "#64748b";
  const firstAgent = task.agentLog[0]?.agentName ?? task.assignedAgents[0] ?? "—";
  const resultSnippet = task.result
    ? task.result.split("\n")[0].slice(0, 80)
    : task.title;

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 font-mono text-[0.65rem] border-b border-[#1e2535]/40 hover:bg-[#0f1220]/50 transition-colors">
      <span className="text-[#374151] w-12 flex-shrink-0">
        {formatTime(task.startedAt)}
      </span>
      <div
        className="w-0.5 h-4 flex-shrink-0 opacity-60"
        style={{ background: teamColor }}
      />
      <span
        className="w-20 flex-shrink-0 truncate font-bold"
        style={{ color: teamColor }}
      >
        {firstAgent}
      </span>
      <span className="flex-1 text-[#64748b] truncate">{resultSnippet}</span>
      <span className="text-[#c87941] w-12 text-right flex-shrink-0">
        {formatTokens(task.tokensUsed)}
      </span>
      <span className="text-[0.55rem] font-bold tracking-wider text-[#22c55e] w-16 text-right flex-shrink-0">
        ✓ DONE
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [activeTasks, setActiveTasks] = useState<DisplayTask[]>(
    ACTIVE_TASKS.map(mockToDisplay)
  );
  const [queuedTasks, setQueuedTasks] = useState<DisplayTask[]>(
    QUEUED_TASKS.map(mockToDisplay)
  );
  const [completedTasks, setCompletedTasks] = useState<DisplayTask[]>(
    COMPLETED_TASKS.map(mockToDisplay)
  );
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      const hasData =
        (data.active?.length ?? 0) > 0 ||
        (data.queue?.length ?? 0) > 0 ||
        (data.completedToday?.length ?? 0) > 0;

      if (hasData) {
        if (data.active?.length) setActiveTasks(data.active.map(apiToDisplay));
        if (data.queue?.length) setQueuedTasks(data.queue.map(apiToDisplay));
        if (data.completedToday?.length)
          setCompletedTasks(data.completedToday.map(apiToDisplay));
      }
    } catch {
      // silently fall back to mock
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // SSE: live task updates
  const handleSSEEvent = useCallback(
    (event: Record<string, unknown>) => {
      const taskId = event.taskId as string;

      if (event.type === "task_status") {
        // Update status label on active task
        setActiveTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: event.status as string } : t
          )
        );
      }

      if (event.type === "agent_log") {
        const entry = event.entry as AgentLogEntry;
        setActiveTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, agentLog: [...t.agentLog, entry] }
              : t
          )
        );
      }

      if (event.type === "task_complete") {
        // Re-fetch to get updated data
        fetchTasks();
      }

      if (event.type === "task_failed") {
        setActiveTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: "failed" } : t
          )
        );
      }
    },
    [fetchTasks]
  );

  useSSE(handleSSEEvent);

  return (
    <div className="h-full overflow-y-auto bg-[#080a12]">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* ── TASK INPUT BAR ── */}
        <TaskInputBar onTaskStarted={fetchTasks} />

        {/* ── ACTIVE OPERATIONS ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <StatusDot status="active" pulse={true} size="md" />
              <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-[#e2e8f0] uppercase">
                Active Operations
              </h2>
            </div>
            <div
              className="px-2 py-0.5 text-[0.65rem] font-mono font-bold tracking-wider border"
              style={{
                color: "#22c55e",
                borderColor: "#22c55e",
                background: "rgba(34,197,94,0.08)",
              }}
            >
              {loading ? "..." : `${activeTasks.length} RUNNING`}
            </div>
            <div className="flex-1 h-px bg-[#1e2535]" />
            {loading && (
              <span className="text-[0.6rem] font-mono text-[#374151]">LOADING...</span>
            )}
          </div>

          {activeTasks.length === 0 ? (
            <div className="bg-[#0f1220] border border-[#2a3a5c] p-8 text-center">
              <p className="text-[0.7rem] font-mono text-[#374151]">
                No active tasks — use the terminal above to start one
              </p>
            </div>
          ) : (
            <div className="flex gap-4">
              {activeTasks.map((task) => (
                <ActiveTaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>

        {/* ── QUEUE ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-[#e2e8f0] uppercase">
              Queue
            </h2>
            <div className="px-2 py-0.5 text-[0.65rem] font-mono font-bold tracking-wider border border-[#2a3a5c] text-[#64748b]">
              {loading ? "..." : `${queuedTasks.length} PENDING`}
            </div>
            <div className="flex-1 h-px bg-[#1e2535]" />
          </div>

          <div className="bg-[#0f1220] border border-[#2a3a5c]">
            <div className="flex items-center gap-4 px-4 py-2 border-b border-[#2a3a5c] bg-[#141828]">
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-5">#</span>
              <div className="w-0.5 opacity-0" />
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-24">Team</span>
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase flex-1">Task</span>
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase">Agents</span>
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-16 text-right">Model</span>
            </div>
            {queuedTasks.length === 0 ? (
              <div className="px-4 py-3 text-[0.7rem] font-mono text-[#374151]">
                Queue is empty
              </div>
            ) : (
              queuedTasks.map((task, i) => (
                <QueuedTaskRow key={task.id} task={task} index={i} />
              ))
            )}
          </div>
        </section>

        {/* ── COMPLETED TODAY ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-[#e2e8f0] uppercase">
              Completed Today
            </h2>
            <div className="px-2 py-0.5 text-[0.65rem] font-mono font-bold tracking-wider border border-[#2a3a5c] text-[#64748b]">
              {loading ? "..." : `${completedTasks.length} TASKS`}
            </div>
            <div className="flex-1 h-px bg-[#1e2535]" />
          </div>

          <div className="bg-[#080a12] border border-[#1e2535]">
            <div className="flex items-center gap-4 px-4 py-2 border-b border-[#1e2535] bg-[#0c0e1a]">
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-12">Time</span>
              <div className="w-0.5 opacity-0" />
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-20">Agent</span>
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase flex-1">Task / Result</span>
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-12 text-right">Tokens</span>
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-16 text-right">Status</span>
            </div>
            {completedTasks.map((task) => (
              <CompletedTaskRow key={task.id} task={task} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
