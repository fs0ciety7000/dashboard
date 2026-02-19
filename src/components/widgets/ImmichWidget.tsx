"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Camera, Video, HardDrive, Users, Loader2 } from "lucide-react";
import { formatBytes, formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";

interface ImmichStats {
  photos: number;
  videos: number;
  usage: number;
  users: number;
  version: string;
}

export function ImmichWidget() {
  const [stats, setStats] = useState<ImmichStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/immich");
        if (res.ok) {
          const data = await res.json();
          if (data) setStats(data);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  const items = stats
    ? [
        {
          icon: Camera,
          label: "Photos",
          value: formatNumber(stats.photos),
          color: "text-blue-400",
          bg: "bg-blue-400/10",
          border: "border-blue-400/20",
        },
        {
          icon: Video,
          label: "Videos",
          value: formatNumber(stats.videos),
          color: "text-violet-400",
          bg: "bg-violet-400/10",
          border: "border-violet-400/20",
        },
        {
          icon: HardDrive,
          label: "Storage",
          value: formatBytes(stats.usage),
          color: "text-pink-400",
          bg: "bg-pink-400/10",
          border: "border-pink-400/20",
        },
        {
          icon: Users,
          label: "Users",
          value: String(stats.users),
          color: "text-emerald-400",
          bg: "bg-emerald-400/10",
          border: "border-emerald-400/20",
        },
      ]
    : [];

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Immich</h3>
        </div>
        {stats?.version && (
          <span className="text-[10px] text-slate-600 font-mono">
            {stats.version}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : !stats ? (
        <div className="flex items-center justify-center py-6 text-slate-600">
          <p className="text-xs">Not configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${item.bg} border ${item.border}`}
            >
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <p className="text-sm font-bold font-mono text-white">
                {item.value}
              </p>
              <p className="text-[10px] text-slate-500">{item.label}</p>
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
