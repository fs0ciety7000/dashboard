"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Film,
  MonitorPlay,
  Music,
  BookOpen,
  Headphones,
  Camera,
  Tv,
  Loader2,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";

interface LibraryStat {
  label: string;
  count: number;
  type: string;
}

const typeConfig: Record<
  string,
  { icon: typeof Film; color: string; bgColor: string; borderColor: string }
> = {
  movie: {
    icon: Film,
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
    borderColor: "border-violet-400/20",
  },
  tv: {
    icon: MonitorPlay,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/20",
  },
  music: {
    icon: Music,
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    borderColor: "border-pink-400/20",
  },
  book: {
    icon: BookOpen,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
  },
  audiobook: {
    icon: Headphones,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
  },
  photo: {
    icon: Camera,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
  },
  episode: {
    icon: Tv,
    color: "text-teal-400",
    bgColor: "bg-teal-400/10",
    borderColor: "border-teal-400/20",
  },
};

const defaultConfig = {
  icon: Film,
  color: "text-slate-400",
  bgColor: "bg-slate-400/10",
  borderColor: "border-slate-400/20",
};

export function MediaStatsWidget() {
  const [stats, setStats] = useState<LibraryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/jellyfin/library");
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
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard>
      <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">
        Library
      </h3>
      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : stats.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-slate-600">
          <p className="text-xs">No Jellyfin configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => {
            const config = typeConfig[stat.type] || defaultConfig;
            const Icon = config.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl ${config.bgColor} border ${config.borderColor}`}
              >
                <Icon className={`w-5 h-5 ${config.color}`} />
                <div className="text-center">
                  <p className="text-lg font-bold font-mono text-white">
                    {formatNumber(stat.count)}
                  </p>
                  <p className="text-[10px] text-slate-500">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
