"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AGENTS, TEAM_COLORS, TEAM_LABELS, TeamName, Agent } from "@/lib/agents";
import MisoAvatar from "@/components/MisoAvatar";

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS & ROOM LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

const CANVAS_W = 1600;
const CANVAS_H = 1020;

const ROOMS = {
  automation:     { x: 0,    y: 0,   w: 320, h: 290 },
  command:        { x: 400,  y: 0,   w: 300, h: 290 },
  research:       { x: 800,  y: 0,   w: 340, h: 290 },
  notifications:  { x: 1200, y: 0,   w: 400, h: 290 },
  security:       { x: 0,    y: 410, w: 320, h: 250 },
  breakroom:      { x: 400,  y: 410, w: 300, h: 250 },
  files:          { x: 800,  y: 410, w: 340, h: 250 },
  code:           { x: 1200, y: 410, w: 400, h: 250 },
  schedulerTower: { x: 0,    y: 720, w: 180, h: 300 },
  obsidian:       { x: 240,  y: 720, w: 320, h: 300 },
  fileroom2:      { x: 620,  y: 720, w: 280, h: 300 },
  codecave2:      { x: 960,  y: 720, w: 640, h: 300 },
};

// Horizontal corridors
const H1 = { x: 0,    y: 290, w: CANVAS_W, h: 120 };
const H2 = { x: 0,    y: 660, w: CANVAS_W, h: 60  };
// Vertical corridors
const V1 = { x: 320,  y: 0,   w: 80,  h: 660 };
const V2 = { x: 700,  y: 0,   w: 100, h: 660 };
const V3 = { x: 1140, y: 0,   w: 60,  h: 660 };

const PHRASES = [
  "processing…", "routing task", "found it!", "checking…",
  "on it", "error caught", "compiled ✓", "scheduled!", "indexing…",
  "linked!", "analyzing…", "done ✓", "alert sent", "scanning…",
  "no conflicts", "brief ready", "cross-ref?", "sync ok",
];

// ─────────────────────────────────────────────────────────────────────────────
// AGENT HOME POSITIONS  (absolute canvas coords)
// ─────────────────────────────────────────────────────────────────────────────

const HOME_POSITIONS: Record<string, { x: number; y: number }> = {
  // orchestrator
  miso:        { x: 510, y: 200 },
  // research
  navier:      { x: 830, y: 180 }, bokeh:  { x: 870, y: 220 }, fermat:    { x: 910, y: 180 },
  aperture:    { x: 950, y: 220 }, flux:   { x: 990, y: 180 }, refract:   { x: 1030,y: 220 },
  quill:       { x: 1070,y: 180 },
  // files
  grynk:       { x: 830, y: 490 }, plonk:  { x: 870, y: 530 }, rivet:     { x: 910, y: 490 },
  bracket:     { x: 950, y: 530 }, slag:   { x: 990, y: 490 }, shear:     { x: 1030,y: 530 },
  ledger:      { x: 1070,y: 490 },
  // obsidian
  spore:       { x: 260, y: 800 }, slate:  { x: 300, y: 840 }, lichen:    { x: 340, y: 800 },
  ochre:       { x: 380, y: 840 }, pumice: { x: 420, y: 800 }, flint:     { x: 460, y: 840 },
  // code
  cache:       { x: 1220,y: 490 }, wafer:  { x: 1270,y: 530 }, shader:    { x: 1320,y: 490 },
  solder:      { x: 1370,y: 530 }, die:    { x: 1420,y: 490 }, temper:    { x: 1470,y: 530 },
  ping:        { x: 1520,y: 490 }, codex:  { x: 1560,y: 530 },
  // scheduler
  verge:       { x: 30,  y: 800 }, escapement: { x: 70, y: 840 },
  tick:        { x: 110, y: 800 }, deadlock:   { x: 150,y: 840 },
  // notifications
  volta:       { x: 1220,y: 180 }, dawn:   { x: 1280,y: 220 }, hertz:     { x: 1340,y: 180 },
  pulse:       { x: 1400,y: 220 }, flare:  { x: 1460,y: 180 },
  // security
  latch:       { x: 50,  y: 490 }, keyway: { x: 100, y: 530 },
  shroud:      { x: 150, y: 490 }, char:   { x: 200, y: 530 },
  // automation
  sprocket:    { x: 50,  y: 150 }, cinder: { x: 100, y: 190 },
  cam:         { x: 150, y: 150 }, ratchet:{ x: 200, y: 190 },
};

// Corridor / break room meeting spots
const WANDER_SPOTS = [
  // break room
  { x: 430, y: 470 }, { x: 460, y: 490 }, { x: 490, y: 510 },
  { x: 520, y: 480 }, { x: 550, y: 500 }, { x: 580, y: 470 },
  { x: 610, y: 510 }, { x: 640, y: 480 },
  // h corridor 1 waypoints
  { x: 100, y: 340 }, { x: 250, y: 355 }, { x: 400, y: 340 },
  { x: 550, y: 355 }, { x: 750, y: 340 }, { x: 900, y: 355 },
  { x: 1050,y: 340 }, { x: 1200,y: 355 }, { x: 1400,y: 340 },
  // v corridor 1
  { x: 350, y: 100 }, { x: 360, y: 250 }, { x: 355, y: 500 }, { x: 350, y: 600 },
  // v corridor 2
  { x: 740, y: 100 }, { x: 750, y: 300 }, { x: 745, y: 500 }, { x: 740, y: 600 },
];

// ─────────────────────────────────────────────────────────────────────────────
// PIXEL SPRITE
// ─────────────────────────────────────────────────────────────────────────────

interface SpriteProps {
  color: string;
  variant?: 0 | 1 | 2 | 3 | 4;
  scale?: number;
  facingLeft?: boolean;
}

function PixelSprite({ color, variant = 0, scale = 2, facingLeft = false }: SpriteProps) {
  const sprites: Array<Array<[number, number, number]>> = [
    // Variant 0: Round head robot
    [
      [2,0,1],[3,0,1],[4,0,1],[5,0,1],[6,0,1],[7,0,1],[8,0,1],[9,0,1],
      [1,1,0],[2,1,1],[3,1,1],[4,1,1],[5,1,1],[6,1,1],[7,1,1],[8,1,1],[9,1,1],[10,1,0],
      [1,2,0],[2,2,0],[3,2,3],[4,2,3],[5,2,4],[6,2,4],[7,2,3],[8,2,3],[9,2,0],[10,2,0],
      [1,3,0],[2,3,0],[3,3,3],[4,3,3],[5,3,4],[6,3,4],[7,3,3],[8,3,3],[9,3,0],[10,3,0],
      [1,4,0],[2,4,1],[3,4,1],[4,4,1],[5,4,1],[6,4,1],[7,4,1],[8,4,1],[9,4,1],[10,4,0],
      [2,5,0],[3,5,0],[4,5,0],[5,5,0],[6,5,0],[7,5,0],[8,5,0],[9,5,0],
      [1,6,2],[2,6,0],[3,6,1],[4,6,1],[5,6,1],[6,6,1],[7,6,1],[8,6,1],[9,6,0],[10,6,2],
      [1,7,2],[2,7,0],[3,7,0],[4,7,4],[5,7,0],[6,7,0],[7,7,4],[8,7,0],[9,7,0],[10,7,2],
      [1,8,2],[2,8,0],[3,8,0],[4,8,4],[5,8,0],[6,8,0],[7,8,4],[8,8,0],[9,8,0],[10,8,2],
      [1,9,2],[2,9,0],[3,9,1],[4,9,1],[5,9,1],[6,9,1],[7,9,1],[8,9,1],[9,9,0],[10,9,2],
      [0,6,2],[0,7,2],[0,8,2],[11,6,2],[11,7,2],[11,8,2],
      [3,10,2],[4,10,2],[7,10,2],[8,10,2],[3,11,2],[4,11,2],[7,11,2],[8,11,2],
    ],
    // Variant 1: Angular head
    [
      [6,0,1],[2,1,0],[3,1,1],[4,1,1],[5,1,1],[6,1,1],[7,1,1],[8,1,1],[9,1,0],
      [2,2,0],[3,2,0],[4,2,3],[5,2,4],[6,2,4],[7,2,3],[8,2,0],[9,2,0],
      [2,3,0],[3,3,1],[4,3,1],[5,3,1],[6,3,1],[7,3,1],[8,3,1],[9,3,0],
      [5,4,2],[6,4,2],
      [2,5,0],[3,5,1],[4,5,1],[5,5,1],[6,5,1],[7,5,1],[8,5,1],[9,5,0],
      [2,6,0],[3,6,0],[4,6,1],[5,6,2],[6,6,2],[7,6,1],[8,6,0],[9,6,0],
      [2,7,0],[3,7,1],[4,7,4],[5,7,0],[6,7,0],[7,7,4],[8,7,1],[9,7,0],
      [2,8,0],[3,8,1],[4,8,0],[5,8,0],[6,8,0],[7,8,0],[8,8,1],[9,8,0],
      [2,9,2],[3,9,2],[4,9,2],[5,9,2],[6,9,2],[7,9,2],[8,9,2],[9,9,2],
      [1,5,2],[1,6,2],[1,7,2],[10,5,2],[10,6,2],[10,7,2],[0,7,2],[11,7,2],
      [3,10,2],[4,10,2],[7,10,2],[8,10,2],[3,11,2],[4,11,2],[7,11,2],[8,11,2],
    ],
    // Variant 2: Wide squat
    [
      [1,0,0],[2,0,1],[3,0,1],[4,0,1],[5,0,1],[6,0,1],[7,0,1],[8,0,1],[9,0,1],[10,0,0],
      [1,1,0],[2,1,0],[3,1,4],[4,1,4],[5,1,4],[6,1,4],[7,1,4],[8,1,4],[9,1,0],[10,1,0],
      [1,2,0],[2,2,1],[3,2,3],[4,2,4],[5,2,0],[6,2,0],[7,2,4],[8,2,3],[9,2,1],[10,2,0],
      [1,3,0],[2,3,1],[3,3,1],[4,3,1],[5,3,1],[6,3,1],[7,3,1],[8,3,1],[9,3,1],[10,3,0],
      [2,4,0],[3,4,1],[4,4,1],[5,4,1],[6,4,1],[7,4,1],[8,4,1],[9,4,0],
      [2,5,2],[3,5,0],[4,5,0],[5,5,4],[6,5,4],[7,5,0],[8,5,0],[9,5,2],
      [2,6,2],[3,6,0],[4,6,4],[5,6,0],[6,6,0],[7,6,4],[8,6,0],[9,6,2],
      [2,7,2],[3,7,0],[4,7,0],[5,7,0],[6,7,0],[7,7,0],[8,7,0],[9,7,2],
      [2,8,0],[3,8,1],[4,8,1],[5,8,1],[6,8,1],[7,8,1],[8,8,1],[9,8,0],
      [0,5,2],[0,6,2],[1,5,2],[1,6,2],[10,5,2],[10,6,2],[11,5,2],[11,6,2],
      [3,9,2],[4,9,2],[7,9,2],[8,9,2],[3,10,2],[7,10,2],
    ],
    // Variant 3: Tall thin
    [
      [5,0,1],[6,0,1],[5,1,1],[3,2,1],[4,2,1],[5,2,1],[6,2,1],[7,2,1],[8,2,1],
      [3,3,0],[4,3,3],[5,3,4],[6,3,4],[7,3,3],[8,3,0],
      [3,4,1],[4,4,1],[5,4,1],[6,4,1],[7,4,1],[8,4,1],
      [4,5,0],[5,5,1],[6,5,1],[7,5,0],
      [3,6,2],[4,6,1],[5,6,0],[6,6,0],[7,6,1],[8,6,2],
      [3,7,2],[4,7,0],[5,7,4],[6,7,4],[7,7,0],[8,7,2],
      [3,8,2],[4,8,0],[5,8,0],[6,8,0],[7,8,0],[8,8,2],
      [3,9,0],[4,9,1],[5,9,1],[6,9,1],[7,9,1],[8,9,0],
      [1,6,2],[2,6,2],[2,7,2],[9,6,2],[10,6,2],[10,7,2],
      [4,10,2],[5,10,2],[6,10,2],[7,10,2],[4,11,2],[7,11,2],[4,12,2],[5,12,2],[6,12,2],[7,12,2],
    ],
    // Variant 4: Compact square
    [
      [3,0,1],[4,0,1],[5,0,1],[6,0,1],[7,0,1],[8,0,1],
      [2,1,0],[3,1,1],[4,1,4],[5,1,4],[6,1,4],[7,1,4],[8,1,1],[9,1,0],
      [2,2,0],[3,2,0],[4,2,3],[5,2,3],[6,2,3],[7,2,3],[8,2,0],[9,2,0],
      [2,3,0],[3,3,1],[4,3,1],[5,3,4],[6,3,4],[7,3,1],[8,3,1],[9,3,0],
      [2,4,1],[3,4,1],[4,4,1],[5,4,1],[6,4,1],[7,4,1],[8,4,1],[9,4,1],
      [2,5,2],[3,5,0],[4,5,1],[5,5,4],[6,5,4],[7,5,1],[8,5,0],[9,5,2],
      [2,6,2],[3,6,0],[4,6,0],[5,6,0],[6,6,0],[7,6,0],[8,6,0],[9,6,2],
      [2,7,0],[3,7,1],[4,7,1],[5,7,1],[6,7,1],[7,7,1],[8,7,1],[9,7,0],
      [1,4,2],[1,5,2],[1,6,2],[10,4,2],[10,5,2],[10,6,2],
      [3,8,2],[4,8,2],[7,8,2],[8,8,2],[3,9,2],[4,9,2],[7,9,2],[8,9,2],
    ],
  ];

  const pixels = sprites[variant] || sprites[0];
  const hexToRgb = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });
  const rgb = hexToRgb(color.startsWith("#") ? color : "#64748b");
  const shadeColors = [
    color,
    `rgb(${Math.min(255,rgb.r+55)},${Math.min(255,rgb.g+55)},${Math.min(255,rgb.b+55)})`,
    `rgb(${Math.max(0,rgb.r-45)},${Math.max(0,rgb.g-45)},${Math.max(0,rgb.b-45)})`,
    "#080a12", "#e2e8f0",
  ];
  const shadows = pixels.map(([x, y, shade]) => `${x * scale}px ${y * scale}px 0 ${shadeColors[shade]}`).join(", ");

  return (
    <div style={{
      width: scale, height: scale, boxShadow: shadows,
      display: "inline-block", flexShrink: 0,
      transform: facingLeft ? "scaleX(-1)" : "scaleX(1)",
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FURNITURE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function AutomationFurniture() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.55 }}>
      <div className="absolute" style={{ left: 14, top: 36, width: 72, height: 60, background: "#1e2535", border: "2px solid #475569" }}>
        <div style={{ margin: 6, width: 20, height: 20, background: "#334155", border: "1px solid #64748b" }} />
        <div style={{ position: "absolute", right: 6, top: 6, width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px #ef4444" }} />
        <div style={{ position: "absolute", right: 6, bottom: 6, width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
      </div>
      <div className="absolute" style={{ left: 100, top: 44, width: 60, height: 52, background: "#1e2535", border: "2px solid #475569" }}>
        <div style={{ margin: 4, height: 12, background: "#334155", border: "1px dashed #64748b" }} />
        <div style={{ margin: "4px 4px", height: 12, background: "#0f172a", border: "1px solid #475569" }} />
      </div>
      <div className="absolute" style={{ left: 14, top: 118, width: 200, height: 16, border: "2px dashed #475569", background: "#0f172a" }}>
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{ position: "absolute", left: i * 24 + 4, top: 4, width: 14, height: 8, background: "#1e2535" }} />
        ))}
      </div>
      <div className="absolute" style={{ left: 230, top: 55, width: 42, height: 42, borderRadius: "50%", border: "4px solid #475569", background: "#0f172a" }}>
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: 8, height: 6, background: "#334155", transform: `rotate(${deg}deg) translateX(14px) translateY(-50%)` }} />
        ))}
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 10, height: 10, background: "#64748b", borderRadius: "50%", transform: "translate(-50%,-50%)" }} />
      </div>
      <div className="absolute" style={{ left: 180, top: 118, width: 80, height: 60, background: "#0f172a", border: "2px solid #334155" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ margin: "6px 6px 0", height: 8, background: "#1e2535", borderTop: "1px solid #475569" }} />
        ))}
      </div>
    </div>
  );
}

function CommandFurniture() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.6 }}>
      <div className="absolute" style={{ left: "50%", top: 110, width: 160, height: 60, background: "#1a0d02", border: "2px solid #f97316", transform: "translateX(-50%)", boxShadow: "0 0 12px rgba(249,115,22,0.3)" }} />
      {[-60,-30,0,30,60].map((deg, i) => (
        <div key={i} className="absolute" style={{
          left: `calc(50% + ${Math.sin(deg*Math.PI/180)*80}px - 18px)`,
          top:  `calc(100px - ${Math.cos(deg*Math.PI/180)*30}px - 20px)`,
          width: 36, height: 24, background: "#0a0502", border: "2px solid #f97316",
          boxShadow: "0 0 8px rgba(249,115,22,0.5)",
        }}>
          <div style={{ margin: 3, height: 4, background: "#f97316", opacity: 0.6 }} />
          <div style={{ margin: "1px 3px", height: 4, background: "#f97316", opacity: 0.3 }} />
        </div>
      ))}
    </div>
  );
}

function ResearchFurniture() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.55 }}>
      <div className="absolute" style={{ right: 12, top: 28, width: 90, height: 60, background: "#0f1025", border: "3px solid #e2e8f0" }}>
        <div style={{ margin: "6px 6px 2px", height: 2, background: "#6d28d9", opacity: 0.6 }} />
        <div style={{ margin: "4px 14px 2px", height: 2, background: "#6d28d9", opacity: 0.4 }} />
        <div style={{ margin: "4px 6px 2px", height: 2, background: "#6d28d9", opacity: 0.3 }} />
      </div>
      <div className="absolute" style={{ left: 12, top: 28, width: 28, height: 100, background: "#0a0814", border: "2px solid #3b0764" }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{ margin: "2px 2px", height: 13, background: i%2===0?"#1e1030":"#150d24", borderTop: "1px solid #3b0764" }} />
        ))}
      </div>
      {[[50,28],[140,28],[50,120],[140,120]].map(([x,y],i) => (
        <div key={i} className="absolute" style={{ left: x, top: y, width: 70, height: 44, background: "#0f0a1e", border: "1px solid #3b0764" }}>
          <div style={{ margin: "4px auto", width: 46, height: 26, background: "#0a0512", border: "2px solid #6d28d9", boxShadow: "0 0 6px rgba(109,40,217,0.4)" }} />
        </div>
      ))}
    </div>
  );
}

function SecurityFurniture() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.55 }}>
      <div className="absolute" style={{ left: "50%", top: 44, width: 140, height: 60, background: "#140808", border: "3px solid #991b1b", transform: "translateX(-50%)" }}>
        <div style={{ position: "absolute", left: 8, top: 8, width: 48, height: 32, background: "#0a0202", border: "2px solid #7f1d1d", boxShadow: "0 0 6px rgba(153,27,27,0.4)" }} />
        <div style={{ position: "absolute", right: 8, top: 8, width: 48, height: 32, background: "#0a0202", border: "2px solid #7f1d1d", boxShadow: "0 0 6px rgba(153,27,27,0.4)" }} />
      </div>
      <div className="absolute" style={{ left: 20, top: 54, width: 12, height: 12, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
      <div className="absolute" style={{ left: 10, top: 70, fontFamily: "monospace", fontSize: 7, color: "#22c55e", letterSpacing: 1 }}>SECURE</div>
      <div className="absolute" style={{ left: 40, bottom: 28, width: 180, height: 10, background: "repeating-linear-gradient(45deg,#7f1d1d,#7f1d1d 6px,#1a0505 6px,#1a0505 12px)" }} />
    </div>
  );
}

function BreakroomFurniture() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.6 }}>
      <div className="absolute" style={{ left: "50%", top: 56, width: 80, height: 80, borderRadius: "50%", background: "#1a0f04", border: "3px solid #92400e", transform: "translateX(-50%)" }}>
        {[[40,-12],[82,28],[-4,28],[40,70]].map(([cx,cy],i) => (
          <div key={i} style={{ position: "absolute", left: cx-8, top: cy-8, width: 16, height: 16, borderRadius: "50%", background: "#78350f", border: "1px solid #92400e" }} />
        ))}
      </div>
      <div className="absolute" style={{ right: 14, top: 20, width: 14, height: 130, background: "#120601", border: "2px solid #78350f" }} />
      <div className="absolute" style={{ right: 14, top: 20, width: 90, height: 14, background: "#120601", border: "2px solid #78350f" }} />
      <div className="absolute" style={{ right: 32, top: 24, width: 30, height: 42, background: "#1a0b02", border: "2px solid #92400e" }}>
        <div style={{ margin: "4px auto", width: 16, height: 16, borderRadius: "50%", background: "#78350f", border: "1px solid #c2530a" }} />
        <div style={{ margin: "2px 4px", height: 6, background: "#0a0402" }} />
      </div>
      <div className="absolute" style={{ right: 80, top: 20, width: 30, height: 56, background: "#0a0603", border: "2px solid #92400e" }}>
        <div style={{ position: "absolute", left: 7, top: 8, width: 2, height: 40, background: "#78350f" }} />
      </div>
      <div className="absolute" style={{ left: 14, top: 160, fontFamily: "monospace", fontSize: 8, color: "#92400e", letterSpacing: 1 }}>BREAK ROOM</div>
    </div>
  );
}

function NotificationsFurniture() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.55 }}>
      <div className="absolute" style={{ left: 14, top: 20, width: 200, height: 120, background: "#0c0b00", border: "2px solid #78450a" }}>
        {[0,1,2,3,4,5,6,7,8,9].map(i => (
          <div key={i} style={{
            position: "absolute", left: (i%5)*36+10, top: Math.floor(i/5)*48+12,
            width: 28, height: 34, background: "#050400", border: "1px solid #a16207",
            boxShadow: i%3===0?"0 0 5px rgba(161,98,7,0.5)":"none",
          }}>
            <div style={{ margin: "3px 3px", height: 4, background: "#a16207", opacity: 0.5 }} />
            <div style={{ margin: "2px 3px", height: 4, background: "#78450a", opacity: 0.4 }} />
          </div>
        ))}
      </div>
      <div className="absolute" style={{ right: 40, top: 16, width: 8, height: 90, background: "#3d2900", border: "1px solid #a16207" }}>
        {[18,32,48,64].map(y => (
          <div key={y} style={{ position: "absolute", left: -12, top: y, width: 32, height: 2, background: "#a16207", opacity: 0.6 }} />
        ))}
      </div>
      <div className="absolute" style={{ right: 14, top: 130, width: 120, height: 38, background: "#0a0800", border: "2px solid #78450a" }}>
        <div style={{ position: "absolute", left: 10, top: 7, width: 50, height: 22, background: "#050400", border: "1px solid #a16207" }} />
      </div>
    </div>
  );
}

function ObsidianFurniture() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.55 }}>
      {[14,60,106].map((x,si) => (
        <div key={si} className="absolute" style={{ left: x, top: 20, width: 34, height: 130, background: "#030f05", border: "2px solid #166534" }}>
          {[0,1,2,3,4,5,6].map(i => (
            <div key={i} style={{ margin: "2px 2px", height: 15, background: i%2===0?"#0a1f0d":"#06140a", borderTop: "1px solid #166534" }} />
          ))}
        </div>
      ))}
      <div className="absolute" style={{ left: 160, top: 55, width: 110, height: 65, background: "#050e06", border: "2px solid #166534" }}>
        <div style={{ margin: "8px auto", width: 80, height: 38, background: "#0a1f0d", border: "1px solid #15803d" }} />
      </div>
      <div className="absolute" style={{ right: 14, bottom: 24, width: 32, height: 32, borderRadius: "50%", background: "#052a0c", border: "2px solid #166534", boxShadow: "0 0 8px rgba(22,101,52,0.3)" }}>
        {[-9,-4,5,9].map((dx,i) => (
          <div key={i} style={{ position: "absolute", left: 16+dx-5, top: i<2?-5:20, width: 10, height: 10, borderRadius: "50%", background: "#15803d" }} />
        ))}
      </div>
    </div>
  );
}

function FileFurniture() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.55 }}>
      {[14,54,94,134].map((x,i) => (
        <div key={i} className="absolute" style={{ left: x, top: 20, width: 32, height: 90, background: "#100a02", border: "2px solid #92400e" }}>
          {[0,1,2,3].map(d => (
            <div key={d} style={{ margin: "2px 2px", height: 18, background: "#1a0f04", border: "1px solid #78350f", position: "relative" }}>
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 12, height: 3, background: "#92400e", transform: "translate(-50%,-50%)" }} />
            </div>
          ))}
        </div>
      ))}
      <div className="absolute" style={{ left: 180, top: 34, width: 110, height: 60, background: "#0a0600", border: "2px solid #78350f" }}>
        <div style={{ margin: "8px 8px", height: 36, background: "#120a02" }} />
      </div>
      <div className="absolute" style={{ left: 180, top: 112, width: 46, height: 28, background: "#0f0800", border: "2px solid #92400e" }}>
        <div style={{ margin: "5px auto", width: 30, height: 10, background: "#e2e8f0", opacity: 0.8 }} />
      </div>
    </div>
  );
}

function CodeCaveFurniture() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.6 }}>
      {[[14,20],[100,20],[190,20],[280,20],[14,120],[100,120],[190,120]].map(([x,y],i) => (
        <div key={i} className="absolute" style={{ left: x, top: y, width: 72, height: 56, background: "#020d10", border: "1px solid #0e7490" }}>
          <div style={{ margin: "4px auto", width: 52, height: 34, background: "#010609", border: "2px solid #0e7490", boxShadow: "0 0 8px rgba(14,116,144,0.6)" }}>
            <div style={{ margin: "2px 4px", height: 3, background: "#0e7490", opacity: 0.8 }} />
            <div style={{ margin: "2px 4px", height: 3, background: "#0891b2", opacity: 0.5 }} />
            <div style={{ margin: "2px 8px", height: 3, background: "#0e7490", opacity: 0.3 }} />
          </div>
        </div>
      ))}
      <div className="absolute" style={{ right: 14, top: 20, width: 32, height: 120, background: "#010609", border: "2px solid #0e7490" }}>
        {[0,1,2,3,4,5,6,7,8,9].map(i => (
          <div key={i} style={{ margin: "1px 2px", height: 10, background: "#040e12", borderTop: "1px solid #0e7490" }}>
            <div style={{ position: "absolute", right: 4, width: 6, height: 6, borderRadius: "50%", background: i%3===0?"#0e7490":"#0a2030" }} />
          </div>
        ))}
      </div>
      <div className="absolute" style={{ right: 55, bottom: 14, fontFamily: "monospace", fontSize: 7, color: "#f59e0b", letterSpacing: 1 }}>COMPILING...</div>
    </div>
  );
}

function SchedulerFurniture() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.55 }}>
      <div className="absolute" style={{ left: "50%", top: 20, width: 56, height: 56, borderRadius: "50%", background: "#020e0c", border: "3px solid #0f766e", transform: "translateX(-50%)" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 2, height: 20, background: "#0f766e", transformOrigin: "bottom center", transform: "translateX(-50%) translateY(-100%) rotate(-30deg)" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 2, height: 13, background: "#14b8a6", transformOrigin: "bottom center", transform: "translateX(-50%) translateY(-100%) rotate(60deg)" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 4, height: 4, borderRadius: "50%", background: "#0f766e", transform: "translate(-50%,-50%)" }} />
      </div>
      {[[14,220],[100,220]].map(([x,y],i) => (
        <div key={i} className="absolute" style={{ left: x, bottom: y - 150, width: i===0?34:26, height: i===0?34:26, borderRadius: "50%", border: `${i===0?4:3}px solid #0f766e`, background: "#020e0c" }}>
          <div style={{ position: "absolute", left: "50%", top: "50%", width: i===0?10:8, height: i===0?10:8, borderRadius: "50%", background: "#0f766e", transform: "translate(-50%,-50%)" }} />
        </div>
      ))}
      <div className="absolute" style={{ left: 8, bottom: 24, right: 8, height: 20, background: "#010a08", border: "2px solid #0f766e", display: "flex", alignItems: "center", padding: "0 4px" }}>
        <span style={{ fontFamily: "monospace", fontSize: 7, color: "#14b8a6", letterSpacing: 1 }}>TICK 00:04:12</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOM COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface RoomProps {
  label: string; color: string; tint: string;
  x: number; y: number; w: number; h: number;
  children?: React.ReactNode; furniture?: React.ReactNode; glowColor?: string;
}
function Room({ label, color, tint, x, y, w, h, children, furniture, glowColor }: RoomProps) {
  return (
    <div className="absolute" style={{
      left: x, top: y, width: w, height: h, background: tint,
      border: `3px solid ${color}`,
      boxShadow: glowColor ? `0 0 24px ${glowColor}` : `inset 0 0 30px rgba(0,0,0,0.5)`,
      backgroundImage: `linear-gradient(rgba(255,255,255,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.01) 1px,transparent 1px)`,
      backgroundSize: "20px 20px", overflow: "visible",
    }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: color, opacity: 0.04 }} />
      <div className="absolute" style={{ top: 6, left: 8, fontFamily: "monospace", fontSize: 8, fontWeight: 700, color, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>
        {label}
      </div>
      {furniture}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CORRIDOR
// ─────────────────────────────────────────────────────────────────────────────

function Corridor({ x, y, w, h, vertical }: { x:number; y:number; w:number; h:number; vertical?:boolean }) {
  return (
    <div className="absolute" style={{
      left: x, top: y, width: w, height: h, background: "#050708",
      backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 19px,#0c1020 19px,#0c1020 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,#0c1020 19px,#0c1020 20px)`,
    }}>
      {vertical
        ? [h*0.25, h*0.5, h*0.75].map((fy,i) => (
          <div key={i} className="absolute" style={{ left:"50%", top:fy-6, transform:"translateX(-50%)", width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:"8px solid #0f1525", opacity:0.4 }} />
        ))
        : [w*0.2, w*0.4, w*0.6, w*0.8].map((fx,i) => (
          <div key={i} className="absolute" style={{ left:fx-4, top:"50%", transform:"translateY(-50%)", width:0, height:0, borderTop:"5px solid transparent", borderBottom:"5px solid transparent", borderLeft:"8px solid #0f1525", opacity:0.4 }} />
        ))
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT MOVEMENT STATE
// ─────────────────────────────────────────────────────────────────────────────

interface AgentPos { x: number; y: number; wandering: boolean; facingLeft: boolean; showBubble: boolean; phrase: string; }

function buildInitialPositions(): Record<string, AgentPos> {
  const pos: Record<string, AgentPos> = {};
  AGENTS.forEach((agent, i) => {
    const home = HOME_POSITIONS[agent.id] || { x: 100 + (i % 10) * 50, y: 400 };
    pos[agent.id] = { x: home.x, y: home.y, wandering: false, facingLeft: false, showBubble: false, phrase: "" };
  });
  return pos;
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT SPRITE (position-driven, smooth CSS transition)
// ─────────────────────────────────────────────────────────────────────────────

interface AgentSpriteProps {
  agent: Agent;
  pos: AgentPos;
  onClickAgent: (agent: Agent, evt: React.MouseEvent) => void;
}

function AgentSprite({ agent, pos, onClickAgent }: AgentSpriteProps) {
  const variant = (agent.id.charCodeAt(0) % 5) as 0|1|2|3|4;

  return (
    <div
      className="absolute cursor-pointer agent-sprite-container group"
      style={{
        left: pos.x, top: pos.y, zIndex: 10,
        transition: pos.wandering ? "left 2.8s ease-in-out, top 2.8s ease-in-out" : "left 3.2s ease-in-out, top 3.2s ease-in-out",
      }}
      onClick={(e) => { e.stopPropagation(); onClickAgent(agent, e); }}
    >
      {/* Speech bubble */}
      {pos.showBubble && (
        <div className="absolute" style={{
          bottom: 44, left: "50%", transform: "translateX(-50%)",
          background: "#e2e8f0", border: "2px solid #080a12",
          padding: "2px 7px", whiteSpace: "nowrap",
          fontFamily: "monospace", fontSize: 8, color: "#080a12",
          animation: "fadeInOut 3.5s ease-in-out forwards", zIndex: 25,
        }}>
          {pos.phrase}
          <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:"6px solid #080a12" }} />
        </div>
      )}

      {/* Bob wrapper */}
      <div className={pos.wandering ? "agent-walk" : "agent-bob"} style={{ animationDelay: `${(agent.id.charCodeAt(1)||0) * 137 % 2500}ms` }}>
        <div className="pixel-art">
          <PixelSprite color={agent.color} variant={variant} scale={2} facingLeft={pos.facingLeft} />
        </div>
      </div>

      {/* Name */}
      <div style={{ textAlign: "center", marginTop: 2 }}>
        <span style={{ fontFamily: "monospace", fontSize: 7, fontWeight: 700, color: agent.color, opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {agent.name.slice(0,7)}
        </span>
      </div>

      {/* Hover tooltip */}
      <div className="agent-tooltip absolute" style={{ bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 4, zIndex: 35, pointerEvents: "none" }}>
        <div style={{ background: "#141828", border: `1px solid ${agent.color}`, padding: "4px 8px", whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 10, color: agent.color }}>{agent.name}</div>
          <div style={{ fontFamily: "monospace", fontSize: 8, color: "#64748b" }}>{agent.role}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT CLICK POPUP
// ─────────────────────────────────────────────────────────────────────────────

interface PopupData { agent: Agent; screenX: number; screenY: number; }

function AgentPopup({ data, onClose }: { data: PopupData; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const { agent, screenX, screenY } = data;
  const statuses = ["WORKING","WORKING","IDLE","IN TRANSIT"];
  const status = statuses[agent.id.charCodeAt(0) % statuses.length];

  return (
    <div className="fixed inset-0 z-50" onClick={onClose} style={{ pointerEvents: "all" }}>
      <div className="absolute" style={{
        left: Math.min(screenX, window.innerWidth - 260),
        top: Math.max(screenY - 190, 10),
        width: 244, background: "#0f1220", border: `2px solid ${agent.color}`,
        boxShadow: `0 0 28px ${agent.color}55`, zIndex: 51,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${agent.color}30`, background: `${agent.color}18`, display: "flex", alignItems: "center", gap: 10 }}>
          <div className="pixel-art">
            <PixelSprite color={agent.color} variant={(agent.id.charCodeAt(0)%5) as 0|1|2|3|4} scale={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: agent.color }}>{agent.name}</div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "#64748b" }}>{agent.role}</div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", flexShrink: 0 }} />
        </div>
        <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ background: agent.color, width: 8, height: 8, marginTop: 2, flexShrink: 0, borderRadius: "50%", boxShadow: `0 0 5px ${agent.color}` }} />
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 8, color: "#374151", textTransform: "uppercase", letterSpacing: "0.12em" }}>Team</div>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: agent.color, fontWeight: 700 }}>{TEAM_LABELS[agent.team as TeamName]}</div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: "#374151", textTransform: "uppercase", letterSpacing: "0.12em" }}>Model</div>
            <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: agent.model === "sonnet" ? "#8b5cf6" : "#64748b" }}>
              claude-{agent.model}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: "#374151", textTransform: "uppercase", letterSpacing: "0.12em" }}>Status</div>
            <div style={{
              display: "inline-block", fontFamily: "monospace", fontSize: 9, fontWeight: 700, padding: "1px 6px", border: "1px solid",
              color: status==="WORKING"?"#22c55e":status==="IDLE"?"#64748b":"#f59e0b",
              borderColor: status==="WORKING"?"#22c55e":status==="IDLE"?"#374151":"#f59e0b",
            }}>{status}</div>
          </div>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: "#374151", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>About</div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "#64748b", lineHeight: 1.5 }}>{agent.description}</div>
          </div>
        </div>
        <div style={{ padding: "4px 14px 8px", fontFamily: "monospace", fontSize: 8, color: "#1e2535", textAlign: "right" }}>ESC or click outside</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TICKER + STATUS BAR
// ─────────────────────────────────────────────────────────────────────────────

function Ticker() {
  const items = ["LIVE","Miso: ACTIVE","Navier: RUNNING (research brief 67%)","Cache: ACTIVE (dedup 44%)","Sprocket: BATCH (rename 81%)","Dawn: OK (brief 07:00)","Hertz: OK (check 12:00)","Ratchet: RECURRING (30min)","Security: ALL CLEAR","Vault: 847 notes / 844 clean","Tokens today: ~47.5k","Queue: 5 tasks pending"];
  const text = items.join("  ✦  ");
  return (
    <div style={{ borderTop:"1px solid #1e2535", background:"#080a12", overflow:"hidden", height:28, display:"flex", alignItems:"center", flexShrink:0 }}>
      <div style={{ background:"#0c0e1a", borderRight:"1px solid #1e2535", padding:"0 12px", height:"100%", display:"flex", alignItems:"center", flexShrink:0 }}>
        <span style={{ fontFamily:"monospace", fontSize:10, color:"#c87941" }}>◉ LIVE</span>
      </div>
      <div style={{ flex:1, overflow:"hidden" }}>
        <div className="ticker-scroll" style={{ fontFamily:"monospace", fontSize:10, color:"#64748b", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>
          {text} ✦ {text}
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  const leads = AGENTS.filter(a => a.role.includes("Lead") || a.role==="Orchestrator" || a.role==="Architect").slice(0,10);
  return (
    <div style={{ borderTop:"1px solid #1e2535", background:"#0c0e1a", padding:"6px 16px", display:"flex", alignItems:"center", gap:16, overflowX:"auto", flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#f97316", boxShadow:"0 0 6px #f97316" }} />
        <span style={{ fontFamily:"monospace", fontSize:10, fontWeight:700, color:"#e2e8f0" }}>Miso</span>
        <span style={{ fontFamily:"monospace", fontSize:9, color:"#22c55e", border:"1px solid rgba(34,197,94,0.4)", padding:"0 4px" }}>ACTIVE</span>
      </div>
      <div style={{ width:1, height:16, background:"#1e2535", flexShrink:0 }} />
      {leads.map(agent => (
        <div key={agent.id} style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:agent.color, boxShadow:`0 0 4px ${agent.color}` }} />
          <span style={{ fontFamily:"monospace", fontSize:10, fontWeight:700, color:agent.color }}>{agent.name}</span>
          <span style={{ fontFamily:"monospace", fontSize:9, color:"#22c55e", border:"1px solid rgba(34,197,94,0.3)", padding:"0 3px" }}>OK</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ZOOM CONTROLS
// ─────────────────────────────────────────────────────────────────────────────

function ZoomControls({ scale, onZoomIn, onZoomOut, onReset }: { scale:number; onZoomIn:()=>void; onZoomOut:()=>void; onReset:()=>void }) {
  const btn: React.CSSProperties = { width:28, height:28, background:"#0f1220", border:"1px solid #2a3a5c", color:"#e2e8f0", fontFamily:"monospace", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", userSelect:"none" };
  return (
    <div style={{ position:"absolute", top:12, right:12, zIndex:40, display:"flex", flexDirection:"column", gap:2 }}>
      <button style={btn} onClick={onZoomIn}>+</button>
      <button style={{ ...btn, fontSize:10 }} onClick={onReset}>[ ]</button>
      <button style={btn} onClick={onZoomOut}>−</button>
      <div style={{ background:"#080a12", border:"1px solid #1e2535", padding:"3px 6px", textAlign:"center", fontFamily:"monospace", fontSize:9, color:"#64748b" }}>{scale.toFixed(1)}x</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MISO ROOM CONTENT
// ─────────────────────────────────────────────────────────────────────────────

function MisoRoomContent({ onClickMiso }: { onClickMiso: (e: React.MouseEvent) => void }) {
  return (
    <div className="absolute" style={{ left:14, top:28, right:14, bottom:14 }}>
      <div style={{ background:"#050608", border:"1px solid #1e2535", padding:8, fontFamily:"monospace", fontSize:8, marginBottom:8 }}>
        <div style={{ color:"#374151", marginBottom:4, letterSpacing:"0.1em" }}>SYSTEM STATUS</div>
        {["TASKS ACTIVE......... 03","TASKS QUEUED......... 05","AGENTS ONLINE........ 46","TOKENS TODAY........ 47k","QUEUE DEPTH.......... LOW","SECURITY STATUS... GREEN"].map((line,i) => (
          <div key={i} style={{ color:"#c87941", lineHeight:1.7 }}>{line}</div>
        ))}
        <div style={{ color:"#f97316", marginTop:4 }} className="animate-pulse">_</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={onClickMiso}>
        <MisoAvatar size={48} animate={true} />
        <div>
          <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:11, color:"#f97316" }}>MISO</div>
          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
            <div className="dot-pulse" style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e" }} />
            <span style={{ fontFamily:"monospace", fontSize:8, color:"#22c55e" }}>ONLINE</span>
          </div>
          <div style={{ fontFamily:"monospace", fontSize:7, color:"#64748b", marginTop:2 }}>Orchestrator</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function VisualPage() {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [scale, setScale] = useState(0.65);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [agentPositions, setAgentPositions] = useState<Record<string, AgentPos>>(buildInitialPositions);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const clampScale = (s: number) => Math.max(0.35, Math.min(2.2, s));

  // Zoom via wheel
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setScale(prev => clampScale(prev - e.deltaY * 0.001));
  }, []);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setOffset(prev => ({ x: prev.x + e.clientX - lastMouse.current.x, y: prev.y + e.clientY - lastMouse.current.y }));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => { isPanning.current = false; };

  // ── Agent movement engine ──
  useEffect(() => {
    const agentIds = AGENTS.map(a => a.id);

    const tick = () => {
      // Pick 2-4 random agents to move this tick
      const count = 2 + Math.floor(Math.random() * 3);
      const shuffled = [...agentIds].sort(() => Math.random() - 0.5).slice(0, count);

      setAgentPositions(prev => {
        const next = { ...prev };
        shuffled.forEach(id => {
          const current = next[id];
          if (!current) return;

          if (current.wandering) {
            // Return home
            const home = HOME_POSITIONS[id];
            if (!home) return;
            next[id] = { ...current, x: home.x, y: home.y, wandering: false, facingLeft: current.x > home.x, showBubble: false };
          } else {
            // Wander to a random spot
            const spot = WANDER_SPOTS[Math.floor(Math.random() * WANDER_SPOTS.length)];
            const showBubble = Math.random() < 0.45;
            const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
            next[id] = { ...current, x: spot.x, y: spot.y, wandering: true, facingLeft: spot.x < current.x, showBubble, phrase };
          }
        });
        return next;
      });
    };

    // Stagger first ticks so they don't all fire at once
    const timers: ReturnType<typeof setTimeout>[] = [];
    [4000, 7000, 10000, 14000, 17000, 21000].forEach((delay, i) => {
      timers.push(setTimeout(() => {
        tick();
        // After the staggered start, repeat on intervals
        const iv = setInterval(tick, 8000 + i * 1200);
        timers.push(iv as unknown as ReturnType<typeof setTimeout>);
      }, delay));
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const handleAgentClick = (agent: Agent, evt: React.MouseEvent) => {
    setPopup({ agent, screenX: evt.clientX, screenY: evt.clientY });
  };
  const handleMisoClick = (e: React.MouseEvent) => {
    const m = AGENTS.find(a => a.id === "miso");
    if (m) setPopup({ agent: m, screenX: e.clientX, screenY: e.clientY });
  };

  const R = ROOMS;

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"#080a12" }}>
      {/* Header */}
      <div style={{ padding:"10px 20px", borderBottom:"1px solid #1e2535", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <h1 style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, letterSpacing:"0.2em", color:"#e2e8f0", textTransform:"uppercase" }}>
          Agent Office — Floor Plan
        </h1>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div className="dot-pulse" style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e" }} />
          <span style={{ fontFamily:"monospace", fontSize:9, color:"#22c55e" }}>46/46 ONLINE</span>
        </div>
        <div style={{ flex:1, height:1, background:"#1e2535" }} />
        <span style={{ fontFamily:"monospace", fontSize:9, color:"#374151" }}>Scroll to zoom · Drag to pan · Click agent to inspect</span>
      </div>

      {/* Viewport */}
      <div
        ref={containerRef}
        style={{ flex:1, overflow:"hidden", position:"relative", cursor:"grab", background:"#030406" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <ZoomControls scale={scale} onZoomIn={() => setScale(p => clampScale(p+0.1))} onZoomOut={() => setScale(p => clampScale(p-0.1))} onReset={() => { setScale(0.65); setOffset({x:0,y:0}); }} />

        {/* Transformed canvas */}
        <div style={{
          width: CANVAS_W, height: CANVAS_H, position:"absolute",
          top:"50%", left:"50%",
          transform:`translate(-50%,-50%) translate(${offset.x}px,${offset.y}px) scale(${scale})`,
          transformOrigin:"center center", background:"#030406",
        }}>
          {/* Corridors */}
          <Corridor x={H1.x} y={H1.y} w={H1.w} h={H1.h} />
          <Corridor x={H2.x} y={H2.y} w={H2.w} h={H2.h} />
          <Corridor x={V1.x} y={V1.y} w={V1.w} h={V1.h} vertical />
          <Corridor x={V2.x} y={V2.y} w={V2.w} h={V2.h} vertical />
          <Corridor x={V3.x} y={V3.y} w={V3.w} h={V3.h} vertical />

          {/* Rooms */}
          <Room label="✦ Command Center" color="#f97316" tint="#060200" glowColor="rgba(249,115,22,0.22)" x={R.command.x} y={R.command.y} w={R.command.w} h={R.command.h} furniture={<CommandFurniture />}>
            <MisoRoomContent onClickMiso={handleMisoClick} />
          </Room>
          <Room label="Automation Floor" color={TEAM_COLORS.automation} tint="#080a0e" x={R.automation.x} y={R.automation.y} w={R.automation.w} h={R.automation.h} furniture={<AutomationFurniture />} />
          <Room label="Research Lab" color={TEAM_COLORS.research} tint="#060410" x={R.research.x} y={R.research.y} w={R.research.w} h={R.research.h} furniture={<ResearchFurniture />} />
          <Room label="Notifications Hub" color={TEAM_COLORS.notifications} tint="#080700" x={R.notifications.x} y={R.notifications.y} w={R.notifications.w} h={R.notifications.h} furniture={<NotificationsFurniture />} />
          <Room label="Security Post" color={TEAM_COLORS.security} tint="#0a0303" x={R.security.x} y={R.security.y} w={R.security.w} h={R.security.h} furniture={<SecurityFurniture />} />
          <Room label="Break Room / Kitchen" color="#92400e" tint="#0a0601" x={R.breakroom.x} y={R.breakroom.y} w={R.breakroom.w} h={R.breakroom.h} furniture={<BreakroomFurniture />} />
          <Room label="File Room" color={TEAM_COLORS.files} tint="#080500" x={R.files.x} y={R.files.y} w={R.files.w} h={R.files.h} furniture={<FileFurniture />} />
          <Room label="Code Cave" color={TEAM_COLORS.code} tint="#020709" x={R.code.x} y={R.code.y} w={R.code.w} h={R.code.h} furniture={<CodeCaveFurniture />} />
          <Room label="Scheduler Tower" color={TEAM_COLORS.scheduler} tint="#01070600" x={R.schedulerTower.x} y={R.schedulerTower.y} w={R.schedulerTower.w} h={R.schedulerTower.h} furniture={<SchedulerFurniture />} />
          <Room label="Obsidian Library" color={TEAM_COLORS.obsidian} tint="#010800" x={R.obsidian.x} y={R.obsidian.y} w={R.obsidian.w} h={R.obsidian.h} furniture={<ObsidianFurniture />} />
          {/* Bottom row overflow rooms */}
          <Room label="File Archive" color={TEAM_COLORS.files} tint="#080500" x={R.fileroom2.x} y={R.fileroom2.y} w={R.fileroom2.w} h={R.fileroom2.h} furniture={<FileFurniture />} />
          <Room label="Code Cave — Deep" color={TEAM_COLORS.code} tint="#020709" x={R.codecave2.x} y={R.codecave2.y} w={R.codecave2.w} h={R.codecave2.h} furniture={<CodeCaveFurniture />} />

          {/* Canvas label */}
          <div style={{ position:"absolute", left:1380, top:10, fontFamily:"monospace", fontSize:9, color:"#1e2535", letterSpacing:"0.15em", textTransform:"uppercase" }}>
            OPENCLAW · v1.0
          </div>

          {/* ── ALL AGENT SPRITES (absolute on canvas, state-driven positions) ── */}
          {AGENTS.map(agent => {
            const pos = agentPositions[agent.id];
            if (!pos) return null;
            return (
              <AgentSprite key={agent.id} agent={agent} pos={pos} onClickAgent={handleAgentClick} />
            );
          })}
        </div>
      </div>

      <Ticker />
      <StatusBar />

      {popup && <AgentPopup data={popup} onClose={() => setPopup(null)} />}

      <style>{`
        @keyframes fadeInOut {
          0%   { opacity:0; transform:translateX(-50%) translateY(4px); }
          12%  { opacity:1; transform:translateX(-50%) translateY(0); }
          82%  { opacity:1; transform:translateX(-50%) translateY(0); }
          100% { opacity:0; transform:translateX(-50%) translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
