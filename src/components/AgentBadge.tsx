"use client";

import { TEAM_COLORS, TeamName } from "@/lib/agents";

interface AgentBadgeProps {
  name: string;
  team?: TeamName;
  color?: string;
  size?: "xs" | "sm" | "md";
}

export default function AgentBadge({
  name,
  team,
  color,
  size = "sm",
}: AgentBadgeProps) {
  const badgeColor = color ?? (team ? TEAM_COLORS[team] : "#64748b");

  const sizeClasses = {
    xs: "text-[0.55rem] px-1 py-0",
    sm: "text-[0.65rem] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
  };

  return (
    <span
      className={`inline-block font-mono font-bold uppercase tracking-wider border ${sizeClasses[size]}`}
      style={{
        color: badgeColor,
        borderColor: badgeColor,
        backgroundColor: `${badgeColor}18`,
      }}
    >
      {name}
    </span>
  );
}
