import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ScanlineOverlay from "@/components/ScanlineOverlay";
import { initializeServer } from "@/lib/startup";

export const metadata: Metadata = {
  title: "OpenClaw — Mission Control",
  description: "AI Agent Mission Control Dashboard powered by Miso",
};

// Initialize server-side services (workspace + cron jobs) on first render
// This runs on the server and is idempotent
initializeServer();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#080a12] text-[#e2e8f0] overflow-hidden h-screen flex">
        <ScanlineOverlay />
        <Sidebar />
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </body>
    </html>
  );
}
