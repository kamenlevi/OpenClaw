"use client";

import { ACTIVE_TASKS, QUEUED_TASKS, COMPLETED_TASKS, Task } from "@/lib/mock-data";
import { TEAM_COLORS, TeamName } from "@/lib/agents";
import StatusDot from "@/components/StatusDot";
import AgentBadge from "@/components/AgentBadge";

function formatTime(isoString: string): string {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function elapsedTime(isoString: string): string {
  if (!isoString) return "—";
  const start = new Date(isoString).getTime();
  const now = new Date("2026-05-03T12:00:00Z").getTime();
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

function ActiveTaskCard({ task }: { task: Task }) {
  const teamColor = TEAM_COLORS[task.team as TeamName] ?? "#64748b";

  return (
    <div
      className="flex-1 min-w-0 bg-[#0f1220] border border-[#2a3a5c] relative overflow-hidden"
      style={{ borderLeft: `4px solid ${teamColor}` }}
    >
      {/* Subtle team color tint */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ background: teamColor }}
      />

      <div className="relative p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <StatusDot status="active" pulse={true} size="sm" />
            <span className="text-[0.6rem] font-mono font-bold tracking-[0.15em] uppercase" style={{ color: teamColor }}>
              {task.team.toUpperCase()}
            </span>
          </div>
          <span
            className="text-[0.55rem] font-mono font-bold px-1.5 py-0.5 border tracking-wider uppercase"
            style={{ color: "#22c55e", borderColor: "#22c55e", background: "rgba(34,197,94,0.08)" }}
          >
            ACTIVE
          </span>
        </div>

        {/* Task title */}
        <h3 className="text-[0.8rem] font-mono font-bold text-[#e2e8f0] leading-snug mb-3">
          {task.title}
        </h3>

        {/* Agents */}
        <div className="flex flex-wrap gap-1 mb-3">
          {task.assignedAgents.map((agent) => (
            <AgentBadge
              key={agent}
              name={agent}
              color={teamColor}
              size="xs"
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[0.6rem] font-mono text-[#64748b] uppercase tracking-wider">Progress</span>
            <span className="text-[0.65rem] font-mono font-bold" style={{ color: teamColor }}>
              {task.progress}%
            </span>
          </div>
          <div className="h-1.5 bg-[#1e2535] relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 transition-all duration-500"
              style={{
                width: `${task.progress}%`,
                background: teamColor,
                boxShadow: `0 0 6px ${teamColor}`,
              }}
            />
          </div>
        </div>

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
          <span className="text-[#374151]">
            {elapsedTime(task.startedAt)} elapsed
          </span>
        </div>
      </div>
    </div>
  );
}

function QueuedTaskRow({ task, index }: { task: Task; index: number }) {
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

function CompletedTaskRow({ task }: { task: Task }) {
  const teamColor = TEAM_COLORS[task.team as TeamName] ?? "#64748b";

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 font-mono text-[0.65rem] border-b border-[#1e2535]/40 hover:bg-[#0f1220]/50 transition-colors">
      <span className="text-[#374151] w-12 flex-shrink-0">
        {formatTime(task.startedAt)}
      </span>
      <div
        className="w-0.5 h-4 flex-shrink-0 opacity-60"
        style={{ background: teamColor }}
      />
      <span className="w-20 flex-shrink-0 truncate font-bold" style={{ color: teamColor }}>
        {task.assignedAgents[0]}
      </span>
      <span className="flex-1 text-[#64748b] truncate">
        {task.title}
      </span>
      <span className="text-[#c87941] w-12 text-right flex-shrink-0">
        {formatTokens(task.tokensUsed)}
      </span>
      <span
        className="text-[0.55rem] font-bold tracking-wider text-[#22c55e] w-16 text-right flex-shrink-0"
      >
        ✓ DONE
      </span>
    </div>
  );
}

export default function TasksPage() {
  return (
    <div className="h-full overflow-y-auto bg-[#080a12]">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

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
              style={{ color: "#22c55e", borderColor: "#22c55e", background: "rgba(34,197,94,0.08)" }}
            >
              {ACTIVE_TASKS.length} RUNNING
            </div>
            <div className="flex-1 h-px bg-[#1e2535]" />
          </div>

          <div className="flex gap-4">
            {ACTIVE_TASKS.map((task) => (
              <ActiveTaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>

        {/* ── QUEUE ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-[#e2e8f0] uppercase">
              Queue
            </h2>
            <div
              className="px-2 py-0.5 text-[0.65rem] font-mono font-bold tracking-wider border border-[#2a3a5c] text-[#64748b]"
            >
              {QUEUED_TASKS.length} PENDING
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
            {QUEUED_TASKS.map((task, i) => (
              <QueuedTaskRow key={task.id} task={task} index={i} />
            ))}
          </div>
        </section>

        {/* ── COMPLETED TODAY ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-[#e2e8f0] uppercase">
              Completed Today
            </h2>
            <div
              className="px-2 py-0.5 text-[0.65rem] font-mono font-bold tracking-wider border border-[#2a3a5c] text-[#64748b]"
            >
              {COMPLETED_TASKS.length} TASKS
            </div>
            <div className="flex-1 h-px bg-[#1e2535]" />
          </div>

          <div className="bg-[#080a12] border border-[#1e2535]">
            {/* Terminal-style header */}
            <div className="flex items-center gap-4 px-4 py-2 border-b border-[#1e2535] bg-[#0c0e1a]">
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-12">Time</span>
              <div className="w-0.5 opacity-0" />
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-20">Agent</span>
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase flex-1">Task</span>
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-12 text-right">Tokens</span>
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-16 text-right">Status</span>
            </div>
            {COMPLETED_TASKS.map((task) => (
              <CompletedTaskRow key={task.id} task={task} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
