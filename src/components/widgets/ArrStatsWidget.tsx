"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  MonitorPlay,
  Film,
  Music,
  Radar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  HardDrive,
  Loader2,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface ArrStat {
  name: string;
  monitored: number;
  episodes: number | null;
  missing: number;
  queue: number;
  diskUsage: number;
}

const iconMap: Record<string, typeof MonitorPlay> = {
  Sonarr: MonitorPlay,
  Radarr: Film,
  Lidarr: Music,
};

const colorMap: Record<string, { accent: string; bg: string; border: string; bar: "cyan" | "purple" | "pink" }> = {
  Sonarr: { accent: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", bar: "cyan" },
  Radarr: { accent: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", bar: "purple" },
  Lidarr: { accent: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20", bar: "pink" },
};

export function ArrStatsWidget() {
  const [stats, setStats] = useState<ArrStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/arr");
        if (res.ok) {
          setStats(await res.json());
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Arr Stack</h3>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : stats.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-slate-600">
          <p className="text-xs">No Arr services configured</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {stats.map((arr) => {
              const Icon = iconMap[arr.name] || Radar;
              const colors = colorMap[arr.name] || colorMap.Sonarr;
              const totalTracked = arr.monitored + (arr.missing || 0);
              const completionPercent =
                totalTracked > 0
                  ? ((totalTracked - arr.missing) / totalTracked) * 100
                  : 100;

              return (
                <div key={arr.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${colors.accent}`} />
                      <span className="text-xs font-medium text-white">
                        {arr.name}
                      </span>
                    </div>
                    {arr.diskUsage > 0 && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatBytes(arr.diskUsage)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-slate-600" />
                      <span className="text-[10px] text-slate-400">
                        {arr.monitored} monitored
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-400/60" />
                      <span className="text-[10px] text-slate-400">
                        {arr.missing} missing
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-[10px] text-slate-400">
                        {arr.queue} queued
                      </span>
                    </div>
                  </div>

                  <ProgressBar
                    value={completionPercent}
                    color={colors.bar}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>

          {stats.some((a) => a.diskUsage > 0) && (
            <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] text-slate-500">Total library size</span>
              </div>
              <span className="text-xs font-mono text-white">
                {formatBytes(stats.reduce((acc, a) => acc + a.diskUsage, 0))}
              </span>
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
}
