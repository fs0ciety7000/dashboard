"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart3, Film, MonitorPlay, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface JellystatData {
  libraries: { name: string; count: number; type: string }[];
  topMovies: { title: string; plays: number }[];
  topShows: { title: string; plays: number }[];
}

export function JellystatWidget() {
  const [data, setData] = useState<JellystatData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/jellystat");
        if (res.ok) {
          const result = await res.json();
          if (result) setData(result);
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

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-semibold text-white">Jellystat</h3>
        </div>
        <span className="text-[10px] text-slate-600">Last 30 days</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center py-8 text-slate-600">
          <p className="text-xs">Not configured</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Movies */}
          {data.topMovies.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Film className="w-3 h-3 text-violet-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Top Movies
                </span>
              </div>
              <div className="space-y-1.5">
                {data.topMovies.map((movie, i) => {
                  const maxPlays = data.topMovies[0]?.plays || 1;
                  const percent = (movie.plays / maxPlays) * 100;

                  return (
                    <motion.div
                      key={movie.title}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative"
                    >
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-md relative z-10">
                        <span className="text-xs text-slate-300 truncate flex-1 mr-2">
                          {movie.title}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <TrendingUp className="w-3 h-3 text-slate-600" />
                          <span className="text-[10px] text-slate-500 font-mono">
                            {movie.plays}
                          </span>
                        </div>
                      </div>
                      <div
                        className="absolute inset-0 bg-violet-400/5 rounded-md"
                        style={{ width: `${percent}%` }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Shows */}
          {data.topShows.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MonitorPlay className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Top Shows
                </span>
              </div>
              <div className="space-y-1.5">
                {data.topShows.map((show, i) => {
                  const maxPlays = data.topShows[0]?.plays || 1;
                  const percent = (show.plays / maxPlays) * 100;

                  return (
                    <motion.div
                      key={show.title}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative"
                    >
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-md relative z-10">
                        <span className="text-xs text-slate-300 truncate flex-1 mr-2">
                          {show.title}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <TrendingUp className="w-3 h-3 text-slate-600" />
                          <span className="text-[10px] text-slate-500 font-mono">
                            {show.plays}
                          </span>
                        </div>
                      </div>
                      <div
                        className="absolute inset-0 bg-cyan-400/5 rounded-md"
                        style={{ width: `${percent}%` }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {data.topMovies.length === 0 && data.topShows.length === 0 && (
            <div className="flex items-center justify-center py-4 text-slate-600">
              <p className="text-xs">No watch data yet</p>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
