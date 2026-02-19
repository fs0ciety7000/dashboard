"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Play, Pause, SkipForward, Tv, User, Loader2 } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface Session {
  id: string;
  user: string;
  title: string;
  episode: string | null;
  type: string;
  progress: number;
  state: "playing" | "paused";
  transcoding: boolean;
  device: string;
  quality: string;
}

export function NowPlayingWidget() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/jellyfin/sessions");
        if (res.ok) {
          setSessions(await res.json());
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="h-full" noPadding>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Now Playing</h3>
        </div>
        <span className="text-[10px] text-slate-600">
          {sessions.length} stream{sessions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-1 px-3 pb-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : sessions.length > 0 ? (
          sessions.map((session) => (
            <div
              key={session.id}
              className="px-3 py-3 rounded-lg bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-16 rounded-md bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0 border border-white/[0.06]">
                  {session.state === "playing" ? (
                    <Play className="w-4 h-4 text-violet-400" />
                  ) : (
                    <Pause className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {session.title}
                  </h4>
                  {session.episode && (
                    <p className="text-[11px] text-slate-400 truncate">
                      {session.episode}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-600" />
                      <span className="text-[10px] text-slate-500">
                        {session.user}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-700">·</span>
                    <span className="text-[10px] text-slate-500">
                      {session.device}
                    </span>
                    <span className="text-[10px] text-slate-700">·</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {session.quality}
                    </span>
                    {session.transcoding && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        TRANSCODE
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      value={session.progress}
                      color="purple"
                      size="sm"
                      showLabel
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-600">
            <SkipForward className="w-6 h-6 mb-2" />
            <p className="text-xs">Nothing playing right now</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
