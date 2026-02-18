"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CircularGauge } from "@/components/ui/CircularGauge";
import { Cpu, MemoryStick, HardDrive } from "lucide-react";
import { settings } from "@/config/settings";
import Link from "next/link";

interface SystemStats {
  cpu: number;
  memory: { used: number; total: number; percent: number };
  disk: { used: number; total: number; percent: number };
  uptime: number;
}

export function SystemOverviewWidget() {
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/system");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Silently fail
      }
    }
    fetchStats();
    const interval = setInterval(
      fetchStats,
      settings.refreshIntervals.systemStats
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs text-slate-500 uppercase tracking-wider">
          System
        </h3>
        <Link
          href="/homelab"
          className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors"
        >
          Details →
        </Link>
      </div>

      <div className="flex justify-around items-center">
        <div className="flex flex-col items-center gap-1">
          <CircularGauge
            value={stats?.cpu ?? 0}
            size={80}
            strokeWidth={6}
            color="cyan"
          />
          <div className="flex items-center gap-1 mt-1">
            <Cpu className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-500">CPU</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <CircularGauge
            value={stats?.memory.percent ?? 0}
            size={80}
            strokeWidth={6}
            color="purple"
          />
          <div className="flex items-center gap-1 mt-1">
            <MemoryStick className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-500">RAM</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <CircularGauge
            value={stats?.disk.percent ?? 0}
            size={80}
            strokeWidth={6}
            color="pink"
          />
          <div className="flex items-center gap-1 mt-1">
            <HardDrive className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-500">Disk</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
