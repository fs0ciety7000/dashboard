"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Download, ArrowDownToLine, Pause, Clock, Loader2 } from "lucide-react";
import { formatBytes, formatSpeed } from "@/lib/utils";
import { settings } from "@/config/settings";

interface DownloadItem {
  id: string | number;
  name: string;
  size: number;
  downloaded: number;
  speed: number;
  eta: string;
  status: "downloading" | "completed" | "paused" | "queued";
  source: string;
}

const statusIcons = {
  downloading: Download,
  completed: ArrowDownToLine,
  paused: Pause,
  queued: Clock,
};

const statusColors = {
  downloading: "cyan",
  completed: "green",
  paused: "amber",
  queued: "purple",
} as const;

export function DownloadWidget() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDownloads() {
      try {
        const res = await fetch("/api/downloads");
        if (res.ok) {
          setDownloads(await res.json());
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchDownloads();
    const interval = setInterval(fetchDownloads, settings.refreshIntervals.downloads);
    return () => clearInterval(interval);
  }, []);

  const activeDownloads = downloads.filter(
    (d) => d.status === "downloading"
  );
  const totalSpeed = activeDownloads.reduce((acc, d) => acc + d.speed, 0);

  return (
    <GlassCard className="h-full" noPadding>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Downloads</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400">
            {formatSpeed(totalSpeed)}
          </span>
          <span className="text-[10px] text-slate-600">
            {activeDownloads.length} active
          </span>
        </div>
      </div>

      <div className="space-y-1 px-3 pb-3 max-h-[320px] overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : downloads.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-slate-600">
            <p className="text-xs">No active downloads</p>
          </div>
        ) : (
          downloads.map((dl) => {
            const percent =
              dl.size > 0 ? (dl.downloaded / dl.size) * 100 : 0;
            const StatusIcon = statusIcons[dl.status];
            const color = statusColors[dl.status];

            return (
              <div
                key={dl.id}
                className="px-2 py-3 rounded-lg hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <StatusIcon className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-300 truncate">
                        {dl.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-600 font-mono">
                          {formatBytes(dl.downloaded)} / {formatBytes(dl.size)}
                        </span>
                        {dl.status === "downloading" && (
                          <>
                            <span className="text-[10px] text-slate-700">·</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {formatSpeed(dl.speed)}
                            </span>
                            <span className="text-[10px] text-slate-700">·</span>
                            <span className="text-[10px] text-slate-500">
                              ETA {dl.eta}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-600 uppercase font-mono flex-shrink-0 ml-2">
                    {dl.source}
                  </span>
                </div>
                <ProgressBar
                  value={percent}
                  color={color}
                  size="sm"
                  animated={dl.status === "downloading"}
                />
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
