"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, Film, MonitorPlay, Music } from "lucide-react";
import { motion } from "framer-motion";

// Demo data - in production, would come from Jellyfin API
const recentItems = [
  {
    id: 1,
    title: "Oppenheimer",
    type: "movie",
    addedDate: "Today",
    quality: "4K HDR",
    size: "78.4 GB",
  },
  {
    id: 2,
    title: "The Last of Us S02E05",
    type: "tv",
    addedDate: "Today",
    quality: "1080p",
    size: "3.2 GB",
  },
  {
    id: 3,
    title: "Radiohead - OK Computer",
    type: "music",
    addedDate: "Yesterday",
    quality: "FLAC",
    size: "892 MB",
  },
  {
    id: 4,
    title: "Civil War",
    type: "movie",
    addedDate: "Yesterday",
    quality: "4K DV",
    size: "65.1 GB",
  },
  {
    id: 5,
    title: "Shogun S01E10",
    type: "tv",
    addedDate: "2 days ago",
    quality: "4K HDR",
    size: "12.8 GB",
  },
  {
    id: 6,
    title: "Challengers",
    type: "movie",
    addedDate: "3 days ago",
    quality: "1080p",
    size: "8.9 GB",
  },
];

const typeIcons = {
  movie: Film,
  tv: MonitorPlay,
  music: Music,
};

const typeColors = {
  movie: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  tv: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  music: "text-pink-400 bg-pink-400/10 border-pink-400/20",
};

export function RecentlyAddedWidget() {
  return (
    <GlassCard className="h-full" noPadding>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Recently Added</h3>
        </div>
      </div>

      <div className="space-y-0.5 px-3 pb-3">
        {recentItems.map((item, i) => {
          const Icon = typeIcons[item.type as keyof typeof typeIcons] || Film;
          const colors =
            typeColors[item.type as keyof typeof typeColors] || typeColors.movie;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${colors}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-600">
                    {item.addedDate}
                  </span>
                  <span className="text-[10px] text-slate-700">·</span>
                  <span className="text-[10px] text-slate-600 font-mono">
                    {item.quality}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">
                {item.size}
              </span>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
