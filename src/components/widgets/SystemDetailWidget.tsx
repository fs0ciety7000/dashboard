"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CircularGauge } from "@/components/ui/CircularGauge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Cpu,
  MemoryStick,
  Thermometer,
  Clock,
  Server,
  Zap,
} from "lucide-react";
import { formatBytes, formatUptime } from "@/lib/utils";
import { settings } from "@/config/settings";

interface SystemStats {
  cpu: number;
  cpuTemp: number;
  cpuCores: number;
  cpuModel: string;
  memory: { used: number; total: number; percent: number };
  swap: { used: number; total: number; percent: number };
  uptime: number;
  loadAvg: number[];
  processes: number;
}

export function SystemDetailWidget() {
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

  const data: SystemStats = stats ?? {
    cpu: 0,
    cpuTemp: 0,
    cpuCores: 0,
    cpuModel: "Loading...",
    memory: { used: 0, total: 1, percent: 0 },
    swap: { used: 0, total: 1, percent: 0 },
    uptime: 0,
    loadAvg: [0, 0, 0],
    processes: 0,
  };

  return (
    <div className="space-y-6">
      {/* Gauges row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col items-center">
          <CircularGauge
            value={data.cpu}
            size={140}
            strokeWidth={10}
            color="cyan"
            label="CPU Usage"
            sublabel={data.cpuModel}
          />
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 w-full">
            <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] text-slate-500">
                {data.cpuCores} cores
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] text-slate-500">
                {data.cpuTemp}°C
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] text-slate-500">
                Load: {data.loadAvg[0].toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] text-slate-500">
                {data.processes} procs
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col items-center">
          <CircularGauge
            value={data.memory.percent}
            size={140}
            strokeWidth={10}
            color="purple"
            label="Memory"
            sublabel={`${formatBytes(data.memory.used)} / ${formatBytes(data.memory.total)}`}
          />
          <div className="mt-3 w-full space-y-2">
            <div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>Swap</span>
                <span>
                  {formatBytes(data.swap.used)} / {formatBytes(data.swap.total)}
                </span>
              </div>
              <ProgressBar
                value={data.swap.percent}
                color="purple"
                size="sm"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Uptime</h3>
          </div>
          <p className="text-3xl font-bold font-mono text-white mb-1">
            {formatUptime(data.uptime)}
          </p>
          <p className="text-[10px] text-slate-500">
            Since{" "}
            {new Date(Date.now() - data.uptime * 1000).toLocaleDateString()}
          </p>
          <div className="mt-4 w-full space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Load (1m)</span>
              <span className="text-slate-400 font-mono">
                {data.loadAvg[0].toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Load (5m)</span>
              <span className="text-slate-400 font-mono">
                {data.loadAvg[1].toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Load (15m)</span>
              <span className="text-slate-400 font-mono">
                {data.loadAvg[2].toFixed(2)}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
