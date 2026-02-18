"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Film, MonitorPlay, Music, BookOpen, Headphones, Camera } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";

// Demo data - in production, would come from Jellyfin/Sonarr/Radarr APIs
const libraryStats = [
  {
    label: "Movies",
    count: 1247,
    icon: Film,
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
    borderColor: "border-violet-400/20",
  },
  {
    label: "TV Shows",
    count: 312,
    icon: MonitorPlay,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/20",
  },
  {
    label: "Music",
    count: 8432,
    icon: Music,
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    borderColor: "border-pink-400/20",
  },
  {
    label: "Books",
    count: 523,
    icon: BookOpen,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
  },
  {
    label: "Audiobooks",
    count: 89,
    icon: Headphones,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
  },
  {
    label: "Photos",
    count: 34521,
    icon: Camera,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
  },
];

export function MediaStatsWidget() {
  return (
    <GlassCard>
      <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">
        Library
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {libraryStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl ${stat.bgColor} border ${stat.borderColor}`}
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div className="text-center">
              <p className="text-lg font-bold font-mono text-white">
                {formatNumber(stat.count)}
              </p>
              <p className="text-[10px] text-slate-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
