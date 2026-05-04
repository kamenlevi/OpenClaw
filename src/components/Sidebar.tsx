"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MisoAvatar from "./MisoAvatar";
import StatusDot from "./StatusDot";

const NAV_ITEMS = [
  { href: "/tasks", label: "Tasks", icon: "✦" },
  { href: "/projects", label: "Projects", icon: "📁" },
  { href: "/calendar", label: "Calendar", icon: "🗓" },
  { href: "/memory", label: "Memory", icon: "🧠" },
  { href: "/docs", label: "Docs", icon: "📄" },
  { href: "/visual", label: "Visual", icon: "🎮" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col h-screen border-r border-[#1e2535]"
      style={{ background: "#0c0e1a" }}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-[#1e2535]">
        <div className="flex items-center gap-3 mb-3">
          <MisoAvatar size={48} animate={true} />
          <div className="flex flex-col">
            <span className="text-[0.6rem] font-mono font-bold tracking-[0.2em] text-[#64748b] uppercase">
              MISSION
            </span>
            <span className="text-sm font-mono font-bold tracking-[0.15em] text-[#e2e8f0] uppercase leading-tight">
              CONTROL
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status="active" pulse={true} size="sm" />
          <span className="text-[0.65rem] font-mono font-bold tracking-wider text-[#22c55e] uppercase">
            MISO ONLINE
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-2 mb-2">
          <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] text-[#374151] uppercase px-2">
            Navigation
          </span>
        </div>
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 font-mono text-sm tracking-wide transition-all duration-150
                    ${isActive
                      ? "bg-[#1e1535] text-[#a78bfa] border-l-2 border-[#7c3aed]"
                      : "text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#141828] border-l-2 border-transparent"
                    }
                  `}
                >
                  <span className="text-base leading-none w-5 text-center flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-bold uppercase tracking-wider text-[0.75rem]">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto w-1 h-1 rounded-full bg-[#7c3aed]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* System stats */}
      <div className="px-4 py-3 border-t border-[#1e2535] border-b border-[#1e2535]">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[0.6rem] font-mono tracking-wider text-[#374151] uppercase">Agents Online</span>
            <span className="text-[0.65rem] font-mono font-bold text-[#22c55e]">46/46</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[0.6rem] font-mono tracking-wider text-[#374151] uppercase">Active Tasks</span>
            <span className="text-[0.65rem] font-mono font-bold text-[#f59e0b]">3</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[0.6rem] font-mono tracking-wider text-[#374151] uppercase">Today Tokens</span>
            <span className="text-[0.65rem] font-mono font-bold text-[#64748b]">47.5k</span>
          </div>
        </div>
      </div>

      {/* Footer user area */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div
          className="w-8 h-8 flex items-center justify-center border border-[#2a3a5c] text-[0.7rem] font-mono font-bold text-[#64748b]"
          style={{ background: "#141828" }}
        >
          N
        </div>
        <div className="flex flex-col">
          <span className="text-[0.65rem] font-mono font-bold text-[#e2e8f0]">User</span>
          <span className="text-[0.55rem] font-mono text-[#374151]">OpenClaw v0.1</span>
        </div>
        <div className="ml-auto">
          <StatusDot status="active" size="sm" />
        </div>
      </div>
    </aside>
  );
}
