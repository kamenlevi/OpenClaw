"use client";

import { SCHEDULED_JOBS, ScheduledJob } from "@/lib/mock-data";

const TYPE_CONFIG = {
  daily: { color: "#22c55e", label: "DAILY" },
  recurring: { color: "#8b5cf6", label: "RECURRING" },
  "one-shot": { color: "#f472b6", label: "ONE-SHOT" },
};

function formatNextRun(isoString: string): string {
  const target = new Date(isoString);
  const now = new Date("2026-05-03T12:00:00Z");
  const diffMs = target.getTime() - now.getTime();

  if (diffMs < 0) return "OVERDUE";

  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 60) return `in ${diffMin}m`;
  if (diffH < 24) return `in ${diffH}h ${diffMin % 60}m`;
  return `in ${diffD}d ${diffH % 24}h`;
}

function formatLastRun(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date("2026-05-03T12:00:00Z");
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  return `${diffD}d ago`;
}

function JobCard({ job }: { job: ScheduledJob }) {
  const typeCfg = TYPE_CONFIG[job.type];

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
              <span
                className={`text-[0.55rem] font-mono font-bold px-1.5 py-0.5 border tracking-wider uppercase ${
                  job.enabled
                    ? "text-[#22c55e] border-[#22c55e] bg-[#22c55e]/10"
                    : "text-[#64748b] border-[#374151] bg-transparent"
                }`}
              >
                {job.enabled ? "ENABLED" : "DISABLED"}
              </span>
            </div>

            {/* Cron expression */}
            <div className="flex items-center gap-3 mb-2">
              <code className="cron-display bg-[#080a12] px-2 py-1 border border-[#1e2535] text-[#c87941]">
                {job.cronExpression}
              </code>
              <span className="text-[0.65rem] font-mono text-[#64748b]">
                {job.cronHuman}
              </span>
            </div>

            {/* Agent */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[0.6rem] font-mono text-[#374151] uppercase tracking-wider">Agent:</span>
              <span className="text-[0.65rem] font-mono font-bold text-[#e2e8f0]">{job.agent}</span>
              <span className="text-[#374151]">·</span>
              <span className="text-[0.6rem] font-mono text-[#374151]">
                {job.runCount} runs total
              </span>
            </div>

            {/* Prompt preview */}
            <div className="bg-[#080a12] border border-[#1e2535] px-3 py-2">
              <span className="text-[0.55rem] font-mono text-[#374151] uppercase tracking-wider block mb-1">
                Prompt Preview
              </span>
              <p className="text-[0.65rem] font-mono text-[#64748b] leading-relaxed line-clamp-2">
                {job.promptPreview}
              </p>
            </div>
          </div>

          {/* Right side — timing */}
          <div className="flex-shrink-0 text-right space-y-3 min-w-[120px]">
            <div>
              <div className="text-[0.55rem] font-mono text-[#374151] uppercase tracking-wider mb-0.5">
                Next Run
              </div>
              <div
                className={`text-sm font-mono font-bold ${
                  job.enabled ? "" : "text-[#374151]"
                }`}
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

export default function CalendarPage() {
  const enabledCount = SCHEDULED_JOBS.filter((j) => j.enabled).length;
  const disabledCount = SCHEDULED_JOBS.filter((j) => !j.enabled).length;

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
          </div>
        </div>

        {/* Jobs list */}
        <div className="space-y-3">
          {SCHEDULED_JOBS.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

      </div>
    </div>
  );
}
