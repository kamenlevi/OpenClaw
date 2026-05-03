import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ScanlineOverlay from "@/components/ScanlineOverlay";

export const metadata: Metadata = {
  title: "OpenClaw — Mission Control",
  description: "AI Agent Mission Control Dashboard powered by Miso",
};

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
