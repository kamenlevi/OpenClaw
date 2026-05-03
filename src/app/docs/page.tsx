"use client";

import { useState, useMemo } from "react";
import { DOCS, Doc } from "@/lib/mock-data";

type Category = "all" | "briefs" | "notes" | "outputs" | "system";

const CATEGORY_CONFIG: Record<Exclude<Category, "all">, { label: string; color: string }> = {
  briefs: { label: "Briefs", color: "#6d28d9" },
  notes: { label: "Notes", color: "#0e7490" },
  outputs: { label: "Outputs", color: "#0f766e" },
  system: { label: "System", color: "#374155" },
};

function formatInline(text: string): string {
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>');
  text = text.replace(/`(.+?)`/g, '<code style="background:#141828;color:#c87941;padding:0 4px;border:1px solid #1e2535;font-size:0.7rem">$1</code>');
  text = text.replace(/\[\[(.+?)\]\]/g, '<span style="color:#8b5cf6;text-decoration:underline;text-decoration-style:dotted">$1</span>');
  return text;
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let i = 0;
  let inCodeBlock = false;
  let codeLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="bg-[#080a12] border border-[#1e2535] p-3 text-[0.65rem] font-mono text-[#c87941] overflow-x-auto my-2 leading-relaxed">
            {codeLines.join("\n")}
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-base font-mono font-bold text-[#e2e8f0] mt-4 mb-3 pb-2 border-b border-[#1e2535]">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-[0.7rem] font-mono font-bold text-[#a78bfa] mt-4 mb-2 uppercase tracking-wider">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-xs font-mono font-bold text-[#e2e8f0] mt-3 mb-1">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <div key={i} className="flex gap-2 text-[0.7rem] font-mono text-[#64748b] my-0.5">
          <span className="text-[#374151] flex-shrink-0">▸</span>
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
        </div>
      );
    } else if (line.startsWith("|")) {
      elements.push(
        <div key={i} className="text-[0.62rem] font-mono text-[#64748b] bg-[#0c0e1a] px-2 py-0.5 border-l-2 border-[#1e2535] overflow-x-auto">
          {line}
        </div>
      );
    } else if (line === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-[0.7rem] font-mono text-[#64748b] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    }
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}

function DocListItem({
  doc,
  isSelected,
  onClick,
}: {
  doc: Doc;
  isSelected: boolean;
  onClick: () => void;
}) {
  const catCfg = CATEGORY_CONFIG[doc.category];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border-b border-[#1e2535] transition-all duration-150 ${
        isSelected
          ? "bg-[#1e1535] border-l-2 border-l-[#7c3aed]"
          : "hover:bg-[#141828] border-l-2 border-l-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span
          className={`text-[0.7rem] font-mono font-bold leading-tight flex-1 ${
            isSelected ? "text-[#e2e8f0]" : "text-[#c4c9d4]"
          }`}
        >
          {doc.title}
        </span>
        <span
          className="text-[0.5rem] font-mono font-bold px-1 py-0.5 border tracking-wider uppercase flex-shrink-0"
          style={{ color: catCfg.color, borderColor: catCfg.color, background: `${catCfg.color}15` }}
        >
          {catCfg.label}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[0.6rem] font-mono text-[#374151]">
        <span>{doc.agent}</span>
        <span>·</span>
        <span>{doc.date}</span>
        <span>·</span>
        <span>{doc.wordCount}w</span>
      </div>
    </button>
  );
}

export default function DocsPage() {
  const [selectedDoc, setSelectedDoc] = useState<Doc>(DOCS[0]);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = useMemo(() => {
    return DOCS.filter((doc) => {
      const matchesCategory = activeCategory === "all" || doc.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="h-full flex bg-[#080a12]">
      {/* ── Left Panel ── */}
      <div
        className="w-72 flex-shrink-0 flex flex-col border-r border-[#1e2535]"
        style={{ background: "#0c0e1a" }}
      >
        {/* Search */}
        <div className="p-3 border-b border-[#1e2535]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080a12] border border-[#2a3a5c] text-[0.75rem] font-mono text-[#e2e8f0] px-3 py-2 focus:border-[#6d28d9] focus:outline-none placeholder-[#374151]"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#374151] text-xs">⌕</span>
          </div>
        </div>

        {/* Category filters */}
        <div className="p-3 border-b border-[#1e2535] flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-[0.6rem] font-mono font-bold px-2 py-1 border tracking-wider uppercase transition-colors ${
              activeCategory === "all"
                ? "border-[#6d28d9] text-[#a78bfa] bg-[#1e1535]"
                : "border-[#2a3a5c] text-[#374151] hover:text-[#64748b]"
            }`}
          >
            All ({DOCS.length})
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
            const count = DOCS.filter((d) => d.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as Category)}
                className={`text-[0.6rem] font-mono font-bold px-2 py-1 border tracking-wider uppercase transition-colors`}
                style={
                  activeCategory === cat
                    ? { color: cfg.color, borderColor: cfg.color, background: `${cfg.color}18` }
                    : { color: "#374151", borderColor: "#2a3a5c" }
                }
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Doc list */}
        <div className="flex-1 overflow-y-auto">
          {filteredDocs.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-[0.65rem] font-mono text-[#374151]">No documents found</p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <DocListItem
                key={doc.id}
                doc={doc}
                isSelected={selectedDoc.id === doc.id}
                onClick={() => setSelectedDoc(doc)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Doc header */}
        <div className="px-6 py-4 border-b border-[#1e2535] bg-[#0c0e1a] flex-shrink-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-sm font-mono font-bold text-[#e2e8f0] flex-1 leading-snug">
              {selectedDoc.title}
            </h1>
            <span
              className="text-[0.6rem] font-mono font-bold px-2 py-1 border tracking-wider uppercase flex-shrink-0"
              style={{
                color: CATEGORY_CONFIG[selectedDoc.category].color,
                borderColor: CATEGORY_CONFIG[selectedDoc.category].color,
                background: `${CATEGORY_CONFIG[selectedDoc.category].color}15`,
              }}
            >
              {CATEGORY_CONFIG[selectedDoc.category].label}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 mb-3">
            <span className="text-[0.65rem] font-mono text-[#64748b]">
              <span className="text-[#374151] uppercase tracking-wider text-[0.55rem]">Author: </span>
              {selectedDoc.agent}
            </span>
            <span className="text-[#374151]">·</span>
            <span className="text-[0.65rem] font-mono text-[#64748b]">
              {selectedDoc.date}
            </span>
            <span className="text-[#374151]">·</span>
            <span className="text-[0.65rem] font-mono text-[#c87941]">
              {selectedDoc.wordCount} words
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {selectedDoc.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Doc content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            <MarkdownContent content={selectedDoc.fullContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
