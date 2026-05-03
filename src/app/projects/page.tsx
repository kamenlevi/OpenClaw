"use client";

import { PROJECTS, RECENT_ACTIVITY, Project, ActivityItem } from "@/lib/mock-data";
import { TEAM_COLORS, TeamName } from "@/lib/agents";
import StatusDot from "@/components/StatusDot";

const STATUS_CONFIG = {
  active: { color: "#22c55e", label: "ACTIVE" },
  paused: { color: "#f59e0b", label: "PAUSED" },
  completed: { color: "#8b5cf6", label: "COMPLETE" },
  planning: { color: "#0e7490", label: "PLANNING" },
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date("2026-05-03T12:00:00Z");
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  return `${diffD}d ago`;
}

function ProjectCard({ project }: { project: Project }) {
  const teamColor = TEAM_COLORS[project.team as TeamName] ?? "#64748b";
  const statusCfg = STATUS_CONFIG[project.status];

  return (
    <div className="bg-[#0f1220] border border-[#2a3a5c] relative overflow-hidden">
      {/* Team color top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: teamColor }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-sm font-mono font-bold text-[#e2e8f0] leading-tight">
              {project.name}
            </h3>
          </div>
          <span
            className="text-[0.55rem] font-mono font-bold px-2 py-1 border tracking-wider uppercase flex-shrink-0"
            style={{
              color: statusCfg.color,
              borderColor: statusCfg.color,
              background: `${statusCfg.color}12`,
            }}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-[0.7rem] font-mono text-[#64748b] leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Team badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-[0.6rem] font-mono font-bold px-1.5 py-0.5 border uppercase tracking-wider"
            style={{
              color: teamColor,
              borderColor: teamColor,
              background: `${teamColor}15`,
            }}
          >
            {project.team.toUpperCase()} TEAM
          </span>
          <span className="text-[0.6rem] font-mono text-[#374151]">
            {project.completedTasks}/{project.taskCount} tasks
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[0.6rem] font-mono uppercase tracking-wider text-[#374151]">
              Progress
            </span>
            <span
              className="text-[0.7rem] font-mono font-bold"
              style={{ color: project.progress === 100 ? "#22c55e" : teamColor }}
            >
              {project.progress}%
            </span>
          </div>
          <div className="h-1.5 bg-[#1e2535] relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 transition-all duration-500"
              style={{
                width: `${project.progress}%`,
                background: project.progress === 100 ? "#22c55e" : teamColor,
                boxShadow: `0 0 6px ${project.progress === 100 ? "#22c55e" : teamColor}`,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-[#1e2535] flex justify-between items-center">
          <span className="text-[0.6rem] font-mono text-[#374151]">
            Last active
          </span>
          <span className="text-[0.6rem] font-mono text-[#64748b]">
            {formatTimestamp(project.lastActivity)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const project = PROJECTS.find((p) => p.id === item.projectId);
  const teamColor = project ? TEAM_COLORS[project.team as TeamName] ?? "#64748b" : "#64748b";

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-[#1e2535]/50 hover:bg-[#0f1220]/50 transition-colors">
      <span className="text-[0.6rem] font-mono text-[#374151] w-16 flex-shrink-0">
        {formatTimestamp(item.timestamp)}
      </span>
      <div
        className="w-0.5 h-4 flex-shrink-0"
        style={{ background: teamColor, opacity: 0.7 }}
      />
      <span
        className="text-[0.65rem] font-mono font-bold w-20 flex-shrink-0 truncate"
        style={{ color: teamColor }}
      >
        {item.agentName}
      </span>
      <span className="flex-1 text-[0.7rem] font-mono text-[#64748b] truncate">
        {item.action}
      </span>
      {project && (
        <span className="text-[0.6rem] font-mono text-[#374151] w-32 text-right truncate flex-shrink-0">
          {project.name}
        </span>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div className="h-full overflow-y-auto bg-[#080a12]">
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <h1 className="text-xs font-mono font-bold tracking-[0.2em] text-[#e2e8f0] uppercase">
            Projects
          </h1>
          <div className="flex gap-2">
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
              const count = PROJECTS.filter((p) => p.status === status).length;
              if (count === 0) return null;
              return (
                <span
                  key={status}
                  className="px-2 py-0.5 text-[0.55rem] font-mono font-bold border tracking-wider uppercase"
                  style={{ color: cfg.color, borderColor: cfg.color, background: `${cfg.color}10` }}
                >
                  {count} {cfg.label}
                </span>
              );
            })}
          </div>
          <div className="flex-1 h-px bg-[#1e2535]" />
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-2 gap-4">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-[#e2e8f0] uppercase">
              Recent Activity
            </h2>
            <div className="flex-1 h-px bg-[#1e2535]" />
          </div>

          <div className="bg-[#0c0e1a] border border-[#1e2535]">
            <div className="flex items-center gap-3 px-4 py-2 border-b border-[#1e2535] bg-[#141828]">
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-16">Time</span>
              <div className="w-0.5 opacity-0 h-4" />
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-20">Agent</span>
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase flex-1">Action</span>
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase w-32 text-right">Project</span>
            </div>
            {RECENT_ACTIVITY.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
