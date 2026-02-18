"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Download, ArrowDownToLine, Pause, Clock } from "lucide-react";
import { formatBytes, formatSpeed } from "@/lib/utils";

// Demo data - in production, these would come from SABnzbd/qBittorrent APIs
const downloads = [
  {
    id: 1,
    name: "Movie.2024.2160p.WEB-DL.DDP5.1.x265",
    size: 15_800_000_000,
    downloaded: 12_640_000_000,
    speed: 45_000_000,
    eta: "4m 12s",
    status: "downloading" as const,
    source: "sabnzbd",
  },
  {
    id: 2,
    name: "TV.Show.S03E08.1080p.AMZN.WEB-DL",
    size: 3_200_000_000,
    downloaded: 960_000_000,
    speed: 28_000_000,
    eta: "2m 38s",
    status: "downloading" as const,
    source: "qbittorrent",
  },
  {
    id: 3,
    name: "Album.Artist.2024.FLAC",
    size: 850_000_000,
    downloaded: 850_000_000,
    speed: 0,
    eta: "0s",
    status: "completed" as const,
    source: "sabnzbd",
  },
  {
    id: 4,
    name: "Documentary.2024.4K.HDR",
    size: 22_400_000_000,
    downloaded: 0,
    speed: 0,
    eta: "—",
    status: "paused" as const,
    source: "qbittorrent",
  },
];

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

      <div className="space-y-1 px-3 pb-3">
        {downloads.map((dl) => {
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
        })}
      </div>
    </GlassCard>
  );
}
