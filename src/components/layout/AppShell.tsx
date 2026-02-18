"use client";

import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background effects */}
      <div className="ambient-bg">
        <div className="ambient-orb-pink" />
      </div>

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="ml-[220px] h-screen overflow-y-auto relative z-10">
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
