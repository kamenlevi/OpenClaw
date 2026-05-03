"use client";

import { useState } from "react";
import { DAILY_LOGS, LONG_TERM_MEMORIES, MemoryEntry } from "@/lib/mock-data";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MemoryEntryCard({
  entry,
  isSelected,
  onClick,
}: {
  entry: MemoryEntry;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border-b border-[#1e2535] transition-all duration-150 ${
        isSelected
          ? "bg-[#1e1535] border-l-2 border-l-[#7c3aed]"
          : "hover:bg-[#141828] border-l-2 border-l-transparent"
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span
          className={`text-xs font-mono font-bold ${
            isSelected ? "text-[#a78bfa]" : "text-[#e2e8f0]"
          }`}
        >
          {entry.date}
        </span>
        <span className="text-[0.6rem] font-mono text-[#374151]">
          {entry.wordCount}w
        </span>
      </div>
      {entry.type === "longterm" && entry.category && (
        <div className="mb-1">
          <span
            className="text-[0.55rem] font-mono font-bold tracking-wider uppercase px-1 py-0.5 border border-[#2a3a5c] text-[#64748b]"
          >
            {entry.category}
          </span>
        </div>
      )}
      <p className="text-[0.65rem] font-mono text-[#64748b] leading-relaxed line-clamp-2">
        {entry.preview}
      </p>
    </button>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  // Simple markdown-ish renderer
  const lines = content.split("\n");

  return (
    <div className="space-y-2 font-mono text-sm">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return (
            <h1 key={i} className="text-lg font-bold text-[#e2e8f0] mt-4 mb-2 border-b border-[#1e2535] pb-2">
              {line.slice(2)}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-sm font-bold text-[#a78bfa] mt-4 mb-1 tracking-wider uppercase text-[0.75rem]">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-xs font-bold text-[#e2e8f0] mt-3 mb-1">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 text-[0.75rem] text-[#64748b]">
              <span className="text-[#374151] flex-shrink-0 mt-0.5">▸</span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
            </div>
          );
        }
        if (line.startsWith("• ")) {
          return (
            <div key={i} className="flex gap-2 text-[0.75rem] text-[#64748b]">
              <span className="text-[#6d28d9] flex-shrink-0 mt-0.5">•</span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
            </div>
          );
        }
        if (line.startsWith("```")) {
          return null; // handled below
        }
        if (line.startsWith("|")) {
          return (
            <div key={i} className="text-[0.65rem] font-mono text-[#64748b] bg-[#0c0e1a] px-2 py-0.5 border-l-2 border-[#1e2535]">
              {line}
            </div>
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <p key={i} className="text-xs font-bold text-[#e2e8f0]">
              {line.slice(2, -2)}
            </p>
          );
        }
        if (line === "") {
          return <div key={i} className="h-1" />;
        }
        return (
          <p key={i} className="text-[0.75rem] text-[#64748b] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatInline(line) }}
          />
        );
      })}
    </div>
  );
}

function formatInline(text: string): string {
  // Bold: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#e2e8f0]">$1</strong>');
  // Code: `code`
  text = text.replace(/`(.+?)`/g, '<code class="bg-[#141828] text-[#c87941] px-1 text-[0.7rem] border border-[#1e2535]">$1</code>');
  // Links: [[wikilinks]]
  text = text.replace(/\[\[(.+?)\]\]/g, '<span class="text-[#8b5cf6] underline decoration-dotted">$1</span>');
  return text;
}

export default function MemoryPage() {
  const [activeTab, setActiveTab] = useState<"daily" | "longterm">("daily");
  const [selectedEntry, setSelectedEntry] = useState<MemoryEntry>(DAILY_LOGS[0]);

  const entries = activeTab === "daily" ? DAILY_LOGS : LONG_TERM_MEMORIES;

  return (
    <div className="h-full flex bg-[#080a12]">
      {/* ── Left Panel ── */}
      <div
        className="w-80 flex-shrink-0 flex flex-col border-r border-[#1e2535]"
        style={{ background: "#0c0e1a" }}
      >
        {/* Panel header */}
        <div className="px-4 pt-4 pb-0 border-b border-[#1e2535]">
          <h2 className="text-[0.65rem] font-mono font-bold tracking-[0.2em] text-[#64748b] uppercase mb-3">
            Memory Bank
          </h2>

          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => {
                setActiveTab("daily");
                setSelectedEntry(DAILY_LOGS[0]);
              }}
              className={`flex-1 py-2 text-[0.65rem] font-mono font-bold tracking-wider uppercase transition-colors border-b-2 ${
                activeTab === "daily"
                  ? "text-[#a78bfa] border-[#7c3aed]"
                  : "text-[#374151] border-transparent hover:text-[#64748b]"
              }`}
            >
              Daily Log
            </button>
            <button
              onClick={() => {
                setActiveTab("longterm");
                setSelectedEntry(LONG_TERM_MEMORIES[0]);
              }}
              className={`flex-1 py-2 text-[0.65rem] font-mono font-bold tracking-wider uppercase transition-colors border-b-2 ${
                activeTab === "longterm"
                  ? "text-[#a78bfa] border-[#7c3aed]"
                  : "text-[#374151] border-transparent hover:text-[#64748b]"
              }`}
            >
              Long-term
            </button>
          </div>
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto">
          {entries.map((entry) => (
            <MemoryEntryCard
              key={entry.id}
              entry={entry}
              isSelected={selectedEntry.id === entry.id}
              onClick={() => setSelectedEntry(entry)}
            />
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content header */}
        <div className="px-6 py-4 border-b border-[#1e2535] bg-[#0c0e1a] flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-sm font-mono font-bold text-[#e2e8f0] mb-1">
                {selectedEntry.date}
                {selectedEntry.category && (
                  <span className="ml-2 text-[0.6rem] tracking-wider text-[#64748b]">
                    — {selectedEntry.category}
                  </span>
                )}
              </h1>
              <p className="text-[0.65rem] font-mono text-[#374151]">
                {new Date(selectedEntry.date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-[0.6rem] font-mono text-[#374151] uppercase tracking-wider">Words</div>
                <div className="text-sm font-mono font-bold text-[#c87941]">{selectedEntry.wordCount}</div>
              </div>
              <div>
                <div className="text-[0.6rem] font-mono text-[#374151] uppercase tracking-wider">Type</div>
                <div className="text-[0.7rem] font-mono font-bold text-[#8b5cf6] uppercase">
                  {selectedEntry.type === "daily" ? "Daily Log" : "Long-term"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            <MarkdownRenderer content={selectedEntry.fullContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
