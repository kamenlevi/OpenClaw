"use client";

import { useState, useEffect } from "react";
import { AGENTS, TEAMS, TEAM_COLORS, TEAM_LABELS, TeamName, Agent } from "@/lib/agents";
import MisoAvatar from "@/components/MisoAvatar";
import StatusDot from "@/components/StatusDot";
import AgentBadge from "@/components/AgentBadge";

// ── Pixel art robot sprite using CSS box-shadow ──────────────────────────────

// Robot body types (4 variants) — each is a 12x16px grid
// We'll encode as a CSS box-shadow on a 1px x 1px div

interface SpriteProps {
  color: string;
  variant?: 0 | 1 | 2 | 3;
  scale?: number;
}

function PixelSprite({ color, variant = 0, scale = 2 }: SpriteProps) {
  const dim = color;
  const bright = color;

  // Each sprite is defined as [x, y, shade] tuples
  // shade: 0=base, 1=highlight, 2=dark, 3=black, 4=white
  const sprites: Array<Array<[number, number, number]>> = [
    // Variant 0: Rounded robot
    [
      // Head
      [2,0,1],[3,0,1],[4,0,1],[5,0,1],[6,0,1],[7,0,1],[8,0,1],[9,0,1],
      [1,1,0],[2,1,1],[3,1,1],[4,1,1],[5,1,1],[6,1,1],[7,1,1],[8,1,1],[9,1,1],[10,1,0],
      [1,2,0],[2,2,0],[3,2,3],[4,2,3],[5,2,4],[6,2,4],[7,2,3],[8,2,3],[9,2,0],[10,2,0],
      [1,3,0],[2,3,0],[3,3,3],[4,3,3],[5,3,4],[6,3,4],[7,3,3],[8,3,3],[9,3,0],[10,3,0],
      [1,4,0],[2,4,1],[3,4,1],[4,4,1],[5,4,1],[6,4,1],[7,4,1],[8,4,1],[9,4,1],[10,4,0],
      // Body
      [2,5,0],[3,5,0],[4,5,0],[5,5,0],[6,5,0],[7,5,0],[8,5,0],[9,5,0],
      [1,6,2],[2,6,0],[3,6,1],[4,6,1],[5,6,1],[6,6,1],[7,6,1],[8,6,1],[9,6,0],[10,6,2],
      [1,7,2],[2,7,0],[3,7,0],[4,7,4],[5,7,0],[6,7,0],[7,7,4],[8,7,0],[9,7,0],[10,7,2],
      [1,8,2],[2,8,0],[3,8,0],[4,8,4],[5,8,0],[6,8,0],[7,8,4],[8,8,0],[9,8,0],[10,8,2],
      [1,9,2],[2,9,0],[3,9,1],[4,9,1],[5,9,1],[6,9,1],[7,9,1],[8,9,1],[9,9,0],[10,9,2],
      // Arms
      [0,6,2],[0,7,2],[0,8,2],[11,6,2],[11,7,2],[11,8,2],
      // Legs
      [3,10,2],[4,10,2],[7,10,2],[8,10,2],
      [3,11,2],[4,11,2],[7,11,2],[8,11,2],
      [2,12,2],[3,12,2],[4,12,2],[7,12,2],[8,12,2],[9,12,2],
    ],
    // Variant 1: Angular robot
    [
      // Antenna
      [6,0,1],
      // Head
      [2,1,0],[3,1,1],[4,1,1],[5,1,1],[6,1,1],[7,1,1],[8,1,1],[9,1,0],
      [2,2,0],[3,2,0],[4,2,3],[5,2,4],[6,2,4],[7,2,3],[8,2,0],[9,2,0],
      [2,3,0],[3,3,1],[4,3,1],[5,3,1],[6,3,1],[7,3,1],[8,3,1],[9,3,0],
      // Neck
      [5,4,2],[6,4,2],
      // Body
      [2,5,0],[3,5,1],[4,5,1],[5,5,1],[6,5,1],[7,5,1],[8,5,1],[9,5,0],
      [2,6,0],[3,6,0],[4,6,1],[5,6,2],[6,6,2],[7,6,1],[8,6,0],[9,6,0],
      [2,7,0],[3,7,1],[4,7,4],[5,7,0],[6,7,0],[7,7,4],[8,7,1],[9,7,0],
      [2,8,0],[3,8,1],[4,8,0],[5,8,0],[6,8,0],[7,8,0],[8,8,1],[9,8,0],
      [2,9,2],[3,9,2],[4,9,2],[5,9,2],[6,9,2],[7,9,2],[8,9,2],[9,9,2],
      // Arms
      [1,5,2],[1,6,2],[1,7,2],[10,5,2],[10,6,2],[10,7,2],
      [0,7,2],[11,7,2],
      // Legs
      [3,10,2],[4,10,2],[7,10,2],[8,10,2],
      [3,11,2],[4,11,2],[7,11,2],[8,11,2],
      [2,12,2],[3,12,2],[8,12,2],[9,12,2],
    ],
    // Variant 2: Squat robot
    [
      // Head (wider)
      [1,0,0],[2,0,1],[3,0,1],[4,0,1],[5,0,1],[6,0,1],[7,0,1],[8,0,1],[9,0,1],[10,0,0],
      [1,1,0],[2,1,0],[3,1,4],[4,1,4],[5,1,4],[6,1,4],[7,1,4],[8,1,4],[9,1,0],[10,1,0],
      [1,2,0],[2,2,1],[3,2,3],[4,2,4],[5,2,0],[6,2,0],[7,2,4],[8,2,3],[9,2,1],[10,2,0],
      [1,3,0],[2,3,1],[3,3,1],[4,3,1],[5,3,1],[6,3,1],[7,3,1],[8,3,1],[9,3,1],[10,3,0],
      // Body (tall)
      [2,4,0],[3,4,1],[4,4,1],[5,4,1],[6,4,1],[7,4,1],[8,4,1],[9,4,0],
      [2,5,2],[3,5,0],[4,5,0],[5,5,4],[6,5,4],[7,5,0],[8,5,0],[9,5,2],
      [2,6,2],[3,6,0],[4,6,4],[5,6,0],[6,6,0],[7,6,4],[8,6,0],[9,6,2],
      [2,7,2],[3,7,0],[4,7,0],[5,7,0],[6,7,0],[7,7,0],[8,7,0],[9,7,2],
      [2,8,0],[3,8,1],[4,8,1],[5,8,1],[6,8,1],[7,8,1],[8,8,1],[9,8,0],
      // Arms
      [0,5,2],[0,6,2],[1,5,2],[1,6,2],[10,5,2],[10,6,2],[11,5,2],[11,6,2],
      // Legs
      [3,9,2],[4,9,2],[7,9,2],[8,9,2],
      [3,10,2],[7,10,2],
      [2,11,2],[3,11,2],[4,11,2],[7,11,2],[8,11,2],[9,11,2],
    ],
    // Variant 3: Tall thin robot
    [
      // Antenna
      [5,0,1],[6,0,1],
      [5,1,1],
      // Head
      [3,2,1],[4,2,1],[5,2,1],[6,2,1],[7,2,1],[8,2,1],
      [3,3,0],[4,3,3],[5,3,4],[6,3,4],[7,3,3],[8,3,0],
      [3,4,1],[4,4,1],[5,4,1],[6,4,1],[7,4,1],[8,4,1],
      // Body
      [4,5,0],[5,5,1],[6,5,1],[7,5,0],
      [3,6,2],[4,6,1],[5,6,0],[6,6,0],[7,6,1],[8,6,2],
      [3,7,2],[4,7,0],[5,7,4],[6,7,4],[7,7,0],[8,7,2],
      [3,8,2],[4,8,0],[5,8,0],[6,8,0],[7,8,0],[8,8,2],
      [3,9,0],[4,9,1],[5,9,1],[6,9,1],[7,9,1],[8,9,0],
      // Arms
      [1,6,2],[2,6,2],[2,7,2],[9,6,2],[10,6,2],[10,7,2],
      // Legs
      [4,10,2],[5,10,2],[6,10,2],[7,10,2],
      [4,11,2],[7,11,2],
      [4,12,2],[5,12,2],[6,12,2],[7,12,2],
    ],
  ];

  const pixels = sprites[variant] || sprites[0];

  // Convert color to rgb components for shading
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const rgb = hexToRgb(color.startsWith("#") ? color : "#64748b");

  const shadeColors = [
    color, // 0: base
    `rgb(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)})`, // 1: highlight
    `rgb(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)})`, // 2: dark
    "#080a12", // 3: black (eyes/details)
    "#e2e8f0", // 4: white (eye whites)
  ];

  const shadows = pixels
    .map(([x, y, shade]) => `${x * scale}px ${y * scale}px 0 ${shadeColors[shade]}`)
    .join(", ");

  return (
    <div
      style={{
        width: scale,
        height: scale,
        boxShadow: shadows,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

// ── Agent sprite in room ─────────────────────────────────────────────────────

interface AgentSpriteInRoomProps {
  agent: Agent;
  index: number;
  onClickAgent: (agent: Agent) => void;
}

function AgentSpriteInRoom({ agent, index, onClickAgent }: AgentSpriteInRoomProps) {
  const variant = (index % 4) as 0 | 1 | 2 | 3;
  // Stagger animation delays
  const bobDelay = `${(index * 0.4) % 2}s`;
  const walkOffset = index * 18;

  return (
    <div
      className="agent-sprite-container relative cursor-pointer group"
      style={{
        animationDelay: bobDelay,
        transform: `translateX(${walkOffset}px)`,
      }}
      onClick={() => onClickAgent(agent)}
      title={agent.name}
    >
      {/* The sprite */}
      <div
        className="agent-bob pixel-art"
        style={{ animationDelay: bobDelay }}
      >
        <PixelSprite color={agent.color} variant={variant} scale={2} />
      </div>

      {/* Name label below sprite */}
      <div className="text-center mt-1">
        <span
          className="text-[0.45rem] font-mono font-bold uppercase tracking-wider"
          style={{ color: agent.color, opacity: 0.8 }}
        >
          {agent.name.slice(0, 6)}
        </span>
      </div>

      {/* Tooltip on hover */}
      <div className="agent-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 pointer-events-none">
        <div
          className="bg-[#141828] border px-2 py-1 whitespace-nowrap text-[0.6rem] font-mono"
          style={{ borderColor: agent.color }}
        >
          <div className="font-bold" style={{ color: agent.color }}>{agent.name}</div>
          <div className="text-[#64748b]">{agent.role}</div>
        </div>
      </div>
    </div>
  );
}

// ── Team Room ────────────────────────────────────────────────────────────────

interface TeamRoomProps {
  team: TeamName;
  agents: Agent[];
  onClickRoom: (team: TeamName) => void;
  onClickAgent: (agent: Agent) => void;
}

function TeamRoom({ team, agents, onClickRoom, onClickAgent }: TeamRoomProps) {
  const color = TEAM_COLORS[team];
  const label = TEAM_LABELS[team];

  return (
    <div
      className="relative overflow-hidden cursor-pointer room-floor"
      style={{
        background: `#0a0c17`,
        border: `1px solid ${color}`,
        borderTop: `2px solid ${color}`,
        minHeight: "180px",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: "16px 16px",
      }}
      onClick={() => onClickRoom(team)}
    >
      {/* Team color overlay tint */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ background: color }}
      />

      {/* Room label */}
      <div
        className="px-2 py-1 border-b flex items-center justify-between"
        style={{ borderColor: `${color}40`, background: `${color}12` }}
      >
        <span
          className="text-[0.55rem] font-mono font-bold uppercase tracking-[0.15em]"
          style={{ color }}
        >
          {label} Team
        </span>
        <span className="text-[0.5rem] font-mono text-[#374151]">
          {agents.length} agents
        </span>
      </div>

      {/* Agent sprites */}
      <div className="relative p-3 flex flex-wrap gap-x-3 gap-y-4 items-end justify-start">
        {agents.map((agent, i) => (
          <AgentSpriteInRoom
            key={agent.id}
            agent={agent}
            index={i}
            onClickAgent={(a) => {
              onClickAgent(a);
            }}
          />
        ))}
      </div>

      {/* Click to expand hint */}
      <div
        className="absolute bottom-1 right-2 text-[0.5rem] font-mono opacity-40 pointer-events-none"
        style={{ color }}
      >
        CLICK TO EXPAND
      </div>
    </div>
  );
}

// ── Miso's Command Center (center room) ─────────────────────────────────────

function MisoRoom({ onClickRoom }: { onClickRoom: () => void }) {
  const readouts = [
    "TASKS ACTIVE......... 03",
    "TASKS QUEUED......... 05",
    "AGENTS ONLINE........ 46",
    "TOKENS TODAY........ 47k",
    "QUEUE DEPTH.......... LOW",
    "SECURITY STATUS... GREEN",
  ];

  return (
    <div
      className="relative overflow-hidden cursor-pointer room-floor indigo-glow"
      style={{
        background: "#08091a",
        border: "2px solid #6d28d9",
        borderTop: "3px solid #8b5cf6",
        minHeight: "180px",
        backgroundImage: `
          linear-gradient(rgba(109,40,217,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(109,40,217,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "16px 16px",
      }}
      onClick={onClickRoom}
    >
      {/* Purple tint */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[#6d28d9]" />

      {/* Room label */}
      <div
        className="px-2 py-1 border-b flex items-center justify-between"
        style={{ borderColor: "#6d28d9", background: "rgba(109,40,217,0.15)" }}
      >
        <span className="text-[0.55rem] font-mono font-bold text-[#a78bfa] uppercase tracking-[0.15em]">
          ✦ Command Center
        </span>
        <span className="text-[0.5rem] font-mono text-[#6d28d9]">MISO</span>
      </div>

      <div className="p-3 flex gap-3">
        {/* Miso avatar */}
        <div className="flex flex-col items-center">
          <MisoAvatar size={48} animate={true} />
          <span className="text-[0.5rem] font-mono font-bold text-[#f97316] mt-1 tracking-wider">
            MISO
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-1 h-1 rounded-full bg-[#22c55e] dot-pulse" />
            <span className="text-[0.45rem] font-mono text-[#22c55e]">ONLINE</span>
          </div>
        </div>

        {/* Terminal readout */}
        <div className="flex-1 bg-[#050608] border border-[#1e2535] p-2 font-mono text-[0.5rem]">
          <div className="text-[#374151] mb-1 tracking-wider">SYSTEM STATUS</div>
          {readouts.map((line, i) => (
            <div
              key={i}
              className="text-[#c87941] leading-relaxed"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {line}
            </div>
          ))}
          <div className="text-[#6d28d9] mt-1 animate-pulse">_</div>
        </div>
      </div>
    </div>
  );
}

// ── Room expand modal ────────────────────────────────────────────────────────

interface RoomModalProps {
  team: TeamName | "miso";
  agents: Agent[];
  onClose: () => void;
}

function RoomModal({ team, agents, onClose }: RoomModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const color = team === "miso" ? "#f97316" : TEAM_COLORS[team as TeamName];
  const label = team === "miso" ? "Command Center" : TEAM_LABELS[team as TeamName] + " Team";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ background: "rgba(8,10,18,0.92)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[80vh] overflow-y-auto relative"
        style={{
          background: "#0a0c17",
          border: `2px solid ${color}`,
          boxShadow: `0 0 40px ${color}30`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: `${color}50`, background: `${color}10` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            />
            <h2 className="text-sm font-mono font-bold tracking-wider uppercase" style={{ color }}>
              {label}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[0.65rem] font-mono text-[#64748b] hover:text-[#e2e8f0] border border-[#2a3a5c] px-2 py-1 tracking-wider uppercase"
          >
            ESC / CLOSE
          </button>
        </div>

        {/* Agents grid */}
        <div className="p-6">
          <h3 className="text-[0.6rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase mb-4">
            Team Members — {agents.length} Agents
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {agents.map((agent, i) => (
              <div
                key={agent.id}
                className="flex items-start gap-3 p-3 bg-[#0f1220] border border-[#1e2535]"
              >
                {/* Sprite */}
                <div className="flex-shrink-0 pt-1">
                  <div className="agent-bob pixel-art" style={{ animationDelay: `${i * 0.2}s` }}>
                    <PixelSprite color={agent.color} variant={(i % 4) as 0|1|2|3} scale={2} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.7rem] font-mono font-bold" style={{ color: agent.color }}>
                      {agent.name}
                    </span>
                    <span
                      className="text-[0.5rem] font-mono px-1 py-0.5 border uppercase tracking-wider"
                      style={{ color: agent.model === "sonnet" ? "#8b5cf6" : "#64748b", borderColor: agent.model === "sonnet" ? "#8b5cf6" : "#374151" }}
                    >
                      {agent.model}
                    </span>
                  </div>
                  <div className="text-[0.6rem] font-mono text-[#64748b] mb-1">{agent.role}</div>
                  <div className="text-[0.6rem] font-mono text-[#374151] leading-relaxed line-clamp-2">
                    {agent.description}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <StatusDot status="active" size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Agent clicked popup ──────────────────────────────────────────────────────

interface AgentPopupProps {
  agent: Agent;
  onClose: () => void;
}

function AgentPopup({ agent, onClose }: AgentPopupProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ background: "rgba(8,10,18,0.75)" }}
      onClick={onClose}
    >
      <div
        className="w-72 relative"
        style={{
          background: "#0f1220",
          border: `1px solid ${agent.color}`,
          boxShadow: `0 0 24px ${agent.color}40`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-4 py-3 border-b flex items-center gap-3"
          style={{ borderColor: `${agent.color}40`, background: `${agent.color}15` }}
        >
          <div className="pixel-art">
            <PixelSprite color={agent.color} scale={2} />
          </div>
          <div>
            <div className="font-mono font-bold text-sm" style={{ color: agent.color }}>
              {agent.name}
            </div>
            <div className="text-[0.6rem] font-mono text-[#64748b]">{agent.role}</div>
          </div>
          <StatusDot status="active" pulse={true} size="sm" className="ml-auto" />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <span className="text-[0.55rem] font-mono text-[#374151] uppercase tracking-wider">Team</span>
            <div>
              <AgentBadge name={agent.team} color={agent.color} size="xs" />
            </div>
          </div>
          <div>
            <span className="text-[0.55rem] font-mono text-[#374151] uppercase tracking-wider">Model</span>
            <div
              className="text-[0.7rem] font-mono font-bold mt-0.5"
              style={{ color: agent.model === "sonnet" ? "#8b5cf6" : "#64748b" }}
            >
              claude-3-{agent.model}
            </div>
          </div>
          <div>
            <span className="text-[0.55rem] font-mono text-[#374151] uppercase tracking-wider block mb-1">Description</span>
            <p className="text-[0.65rem] font-mono text-[#64748b] leading-relaxed">
              {agent.description}
            </p>
          </div>
        </div>
        <div className="px-4 pb-3 text-[0.55rem] font-mono text-[#374151] text-right">
          ESC or click outside to close
        </div>
      </div>
    </div>
  );
}

// ── Bottom status bar ─────────────────────────────────────────────────────────

function StatusBar() {
  const teamAgents = TEAMS.slice(0, 8).map((team) => {
    const lead = AGENTS.find((a) => a.team === team && (a.role === "Lead" || a.role.includes("Lead")));
    return { team, lead, color: TEAM_COLORS[team] };
  });

  return (
    <div className="border-t border-[#1e2535] bg-[#0c0e1a] px-4 py-2 flex items-center gap-4 overflow-x-auto">
      {/* Miso */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-[#f97316] flex-shrink-0" style={{ boxShadow: "0 0 6px #f97316" }} />
        <span className="text-[0.6rem] font-mono font-bold text-[#e2e8f0]">Miso</span>
        <span className="text-[0.55rem] font-mono text-[#22c55e] border border-[#22c55e]/40 px-1">ACTIVE</span>
      </div>

      <div className="w-px h-4 bg-[#1e2535] flex-shrink-0" />

      {teamAgents.map(({ team, lead, color }) => (
        <div key={team} className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: color, boxShadow: `0 0 4px ${color}` }}
          />
          <span className="text-[0.6rem] font-mono font-bold" style={{ color }}>
            {lead?.name ?? TEAM_LABELS[team]}
          </span>
          <span className="text-[0.55rem] font-mono text-[#22c55e] border border-[#22c55e]/30 px-1">OK</span>
        </div>
      ))}
    </div>
  );
}

// ── Ticker ───────────────────────────────────────────────────────────────────

function Ticker() {
  const items = [
    "LIVE",
    "Miso: ACTIVE",
    "Navier: RUNNING (research brief 67%)",
    "Cache: ACTIVE (dedup script 44%)",
    "Sprocket: ACTIVE (batch rename 81%)",
    "Dawn: OK (brief delivered 07:00)",
    "Hertz: OK (last check 12:00)",
    "Ratchet: RECURRING (every 30min)",
    "Security: ALL CLEAR",
    "Vault: 847 notes / 844 clean",
    "Tokens today: ~47.5k",
    "Queue: 5 tasks pending",
  ];

  const tickerText = items.join("  ✦  ");

  return (
    <div className="border-t border-[#1e2535] bg-[#080a12] overflow-hidden h-7 flex items-center">
      <div
        className="text-[0.6rem] font-mono text-[#c87941] flex-shrink-0 px-3 border-r border-[#1e2535] h-full flex items-center"
        style={{ background: "#0c0e1a" }}
      >
        ◉ LIVE
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="ticker-scroll inline-block text-[0.6rem] font-mono text-[#64748b] tracking-wider">
          {tickerText} ✦ {tickerText}
        </div>
      </div>
    </div>
  );
}

// ── Main Visual Page ─────────────────────────────────────────────────────────

export default function VisualPage() {
  const [expandedRoom, setExpandedRoom] = useState<TeamName | "miso" | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const teamsByPosition: (TeamName | "miso")[] = [
    "research", "obsidian", "code",
    "files",    "miso",    "scheduler",
    "security", "automation", "notifications",
  ];

  const getAgentsForCell = (cell: TeamName | "miso"): Agent[] => {
    if (cell === "miso") return AGENTS.filter((a) => a.team === "orchestrator");
    return AGENTS.filter((a) => a.team === cell);
  };

  return (
    <div className="h-full flex flex-col bg-[#080a12]">
      {/* Header */}
      <div className="px-6 py-3 border-b border-[#1e2535] flex items-center gap-3 flex-shrink-0">
        <h1 className="text-xs font-mono font-bold tracking-[0.2em] text-[#e2e8f0] uppercase">
          Agent Office
        </h1>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] dot-pulse" />
          <span className="text-[0.6rem] font-mono text-[#22c55e]">46/46 ONLINE</span>
        </div>
        <div className="flex-1 h-px bg-[#1e2535]" />
        <span className="text-[0.6rem] font-mono text-[#374151]">Click any room to expand</span>
      </div>

      {/* 3x3 Room Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div
          className="grid gap-3"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr 1fr",
            minHeight: "500px",
          }}
        >
          {teamsByPosition.map((cell) => {
            if (cell === "miso") {
              return (
                <MisoRoom
                  key="miso"
                  onClickRoom={() => setExpandedRoom("miso")}
                />
              );
            }
            const agents = getAgentsForCell(cell);
            return (
              <TeamRoom
                key={cell}
                team={cell}
                agents={agents}
                onClickRoom={(t) => setExpandedRoom(t)}
                onClickAgent={(a) => {
                  setSelectedAgent(a);
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Ticker */}
      <Ticker />

      {/* Status Bar */}
      <StatusBar />

      {/* Room expand modal */}
      {expandedRoom && (
        <RoomModal
          team={expandedRoom}
          agents={expandedRoom === "miso"
            ? AGENTS.filter((a) => a.team === "orchestrator")
            : AGENTS.filter((a) => a.team === expandedRoom)
          }
          onClose={() => setExpandedRoom(null)}
        />
      )}

      {/* Agent popup */}
      {selectedAgent && (
        <AgentPopup
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
