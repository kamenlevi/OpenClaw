"use client";

import { useState, useEffect } from "react";
import { SCHEDULED_JOBS } from "@/lib/mock-data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduledJob {
  id: string;
  name: string;
  type: "daily" | "recurring" | "one-shot";
  cron: string;
  enabled: boolean;
  agent: string;
  prompt: string;
  lastRun?: string;
  nextRun?: string;
}

interface ApiJob {
  id: string;
  name: string;
  type: "daily" | "recurring" | "one-shot";
  cron: string;
  enabled: boolean;
  agent: string;
  prompt: string;
  lastRun?: string;
  nextRun?: string;
}

// Adapt mock data
function mockToJob(m: (typeof SCHEDULED_JOBS)[0]): ScheduledJob {
  return {
    id: m.id,
    name: m.name,
    type: m.type,
    cron: m.cronExpression,
    enabled: m.enabled,
    agent: m.agent,
    prompt: m.promptPreview,
    lastRun: m.lastRun,
    nextRun: m.nextRun,
  };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  daily: { color: "#22c55e", label: "DAILY" },
  recurring: { color: "#8b5cf6", label: "RECURRING" },
  "one-shot": { color: "#f472b6", label: "ONE-SHOT" },
};

function formatNextRun(isoString: string | undefined): string {
  if (!isoString) return "—";
  const target = new Date(isoString);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs < 0) return "OVERDUE";

  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 60) return `in ${diffMin}m`;
  if (diffH < 24) return `in ${diffH}h ${diffMin % 60}m`;
  return `in ${diffD}d ${diffH % 24}h`;
}

function formatLastRun(isoString: string | undefined): string {
  if (!isoString) return "—";
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  return `${diffD}d ago`;
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({
  job,
  onToggle,
  flashUpdated,
}: {
  job: ScheduledJob;
  onToggle: (id: string, enabled: boolean) => void;
  flashUpdated: boolean;
}) {
  const typeCfg = TYPE_CONFIG[job.type] ?? TYPE_CONFIG.recurring;

  return (
    <div
      className="bg-[#0f1220] border border-[#2a3a5c] relative overflow-hidden"
      style={{ borderLeft: `4px solid ${typeCfg.color}` }}
    >
      {/* Subtle tint */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ background: typeCfg.color }}
      />

      <div className="relative p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side */}
          <div className="flex-1 min-w-0">
            {/* Name + badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3
                className="text-sm font-mono font-bold"
                style={{ color: typeCfg.color }}
              >
                {job.name}
              </h3>
              <span
                className="text-[0.55rem] font-mono font-bold px-1.5 py-0.5 border tracking-wider uppercase"
                style={{
                  color: typeCfg.color,
                  borderColor: typeCfg.color,
                  background: `${typeCfg.color}15`,
                }}
              >
                {typeCfg.label}
              </span>

              {/* Flash badge */}
              {flashUpdated && (
                <span className="text-[0.55rem] font-mono font-bold px-1.5 py-0.5 border tracking-wider uppercase text-[#22c55e] border-[#22c55e] bg-[#22c55e]/10">
                  UPDATED ✓
                </span>
              )}
            </div>

            {/* Cron expression */}
            <div className="flex items-center gap-3 mb-2">
              <code className="cron-display bg-[#080a12] px-2 py-1 border border-[#1e2535] text-[#c87941] font-mono text-[0.65rem]">
                {job.cron}
              </code>
            </div>

            {/* Agent */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[0.6rem] font-mono text-[#374151] uppercase tracking-wider">
                Agent:
              </span>
              <span className="text-[0.65rem] font-mono font-bold text-[#e2e8f0]">
                {job.agent}
              </span>
            </div>

            {/* Prompt preview */}
            <div className="bg-[#080a12] border border-[#1e2535] px-3 py-2">
              <span className="text-[0.55rem] font-mono text-[#374151] uppercase tracking-wider block mb-1">
                Prompt Preview
              </span>
              <p className="text-[0.65rem] font-mono text-[#64748b] leading-relaxed line-clamp-2">
                {job.prompt}
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex-shrink-0 text-right space-y-3 min-w-[130px]">
            {/* Toggle button */}
            <div>
              <button
                onClick={() => onToggle(job.id, !job.enabled)}
                className="font-mono text-[0.7rem] font-bold tracking-wider px-3 py-1 border transition-all duration-150 hover:opacity-80 active:scale-95"
                style={
                  job.enabled
                    ? {
                        color: "#22c55e",
                        borderColor: "#22c55e",
                        background: "rgba(34,197,94,0.1)",
                      }
                    : {
                        color: "#ef4444",
                        borderColor: "#ef4444",
                        background: "rgba(239,68,68,0.08)",
                      }
                }
              >
                {job.enabled ? "[ON]" : "[OFF]"}
              </button>
            </div>

            {/* Timing */}
            <div>
              <div className="text-[0.55rem] font-mono text-[#374151] uppercase tracking-wider mb-0.5">
                Next Run
              </div>
              <div
                className={`text-sm font-mono font-bold ${!job.enabled ? "text-[#374151]" : ""}`}
                style={job.enabled ? { color: typeCfg.color } : {}}
              >
                {job.enabled ? formatNextRun(job.nextRun) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[0.55rem] font-mono text-[#374151] uppercase tracking-wider mb-0.5">
                Last Run
              </div>
              <div className="text-[0.7rem] font-mono text-[#64748b]">
                {formatLastRun(job.lastRun)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [jobs, setJobs] = useState<ScheduledJob[]>(SCHEDULED_JOBS.map(mockToJob));
  const [loading, setLoading] = useState(true);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((data: ApiJob[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setJobs(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id: string, enabled: boolean) => {
    // Optimistic update
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, enabled } : j)));

    try {
      await fetch("/api/calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled }),
      });
    } catch {
      // Revert on failure
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, enabled: !enabled } : j)));
      return;
    }

    // Flash "Updated" badge for 2 seconds
    setFlashIds((prev) => new Set(Array.from(prev).concat(id)));
    setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(Array.from(prev));
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  const enabledCount = jobs.filter((j) => j.enabled).length;
  const disabledCount = jobs.filter((j) => !j.enabled).length;

  return (
    <div className="h-full overflow-y-auto bg-[#080a12]">
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-xs font-mono font-bold tracking-[0.2em] text-[#e2e8f0] uppercase">
              Scheduled Jobs
            </h1>
            <span className="text-[0.65rem] font-mono font-bold px-2 py-0.5 border border-[#22c55e] text-[#22c55e] bg-[#22c55e]/8">
              {enabledCount} ACTIVE
            </span>
            {disabledCount > 0 && (
              <span className="text-[0.65rem] font-mono font-bold px-2 py-0.5 border border-[#374151] text-[#64748b]">
                {disabledCount} DISABLED
              </span>
            )}
            {loading && (
              <span className="text-[0.6rem] font-mono text-[#374151]">LOADING...</span>
            )}
            <div className="flex-1 h-px bg-[#1e2535]" />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6">
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
                />
                <span className="text-[0.6rem] font-mono text-[#64748b] uppercase tracking-wider">
                  {cfg.label}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-3 ml-auto text-[0.6rem] font-mono text-[#374151]">
              <span>
                <span className="text-[#22c55e] font-bold">[ON]</span> = enabled
              </span>
              <span>
                <span className="text-[#ef4444] font-bold">[OFF]</span> = disabled
              </span>
            </div>
          </div>
        </div>

        {/* Jobs list */}
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onToggle={handleToggle}
              flashUpdated={flashIds.has(job.id)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
