"use client";

type StatusType = "active" | "idle" | "offline" | "warning" | "error";

interface StatusDotProps {
  status: StatusType;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const STATUS_COLORS: Record<StatusType, string> = {
  active: "#22c55e",
  idle: "#f59e0b",
  offline: "#64748b",
  warning: "#f59e0b",
  error: "#ef4444",
};

const SIZES = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

export default function StatusDot({
  status,
  pulse = false,
  size = "md",
  className = "",
}: StatusDotProps) {
  const color = STATUS_COLORS[status];

  return (
    <span
      className={`inline-block rounded-full ${SIZES[size]} ${pulse ? "dot-pulse" : ""} flex-shrink-0 ${className}`}
      style={{ backgroundColor: color, boxShadow: pulse ? `0 0 6px ${color}` : undefined }}
    />
  );
}
