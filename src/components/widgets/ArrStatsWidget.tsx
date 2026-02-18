"use client";

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
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

// Demo data - in production, would come from Sonarr/Radarr/Lidarr APIs
const arrStats = [
  {
    name: "Sonarr",
    icon: MonitorPlay,
    color: "cyan",
    monitored: 312,
    episodes: 14832,
    missing: 47,
    queue: 3,
    diskUsage: 4_200_000_000_000,
  },
  {
    name: "Radarr",
    icon: Film,
    color: "violet",
    monitored: 1247,
    episodes: null,
    missing: 23,
    queue: 1,
    diskUsage: 18_500_000_000_000,
  },
  {
    name: "Lidarr",
    icon: Music,
    color: "pink",
    monitored: 428,
    episodes: null,
    missing: 156,
    queue: 0,
    diskUsage: 890_000_000_000,
  },
] as const;

const colorMap = {
  cyan: {
    accent: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  violet: {
    accent: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
  },
  pink: {
    accent: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
  },
};

export function ArrStatsWidget() {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Arr Stack</h3>
        </div>
      </div>

      <div className="space-y-4">
        {arrStats.map((arr) => {
          const colors = colorMap[arr.color];
          const totalTracked = arr.monitored + (arr.missing || 0);
          const completionPercent =
            totalTracked > 0
              ? ((totalTracked - arr.missing) / totalTracked) * 100
              : 100;

          return (
            <div key={arr.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <arr.icon className={`w-4 h-4 ${colors.accent}`} />
                  <span className="text-xs font-medium text-white">
                    {arr.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatBytes(arr.diskUsage)}
                </span>
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
                color={arr.color as "cyan" | "purple" | "pink"}
                size="sm"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] text-slate-500">Total library size</span>
        </div>
        <span className="text-xs font-mono text-white">
          {formatBytes(
            arrStats.reduce((acc, a) => acc + a.diskUsage, 0)
          )}
        </span>
      </div>
    </GlassCard>
  );
}
