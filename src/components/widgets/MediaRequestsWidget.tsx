"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Film,
  MonitorPlay,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Demo data - in production, would come from Jellyseerr API
const requests = [
  {
    id: 1,
    title: "Dune: Part Three",
    type: "movie",
    status: "pending",
    requestedBy: "admin",
    date: "2 hours ago",
  },
  {
    id: 2,
    title: "Severance",
    type: "tv",
    status: "approved",
    requestedBy: "user2",
    date: "5 hours ago",
  },
  {
    id: 3,
    title: "The Bear S04",
    type: "tv",
    status: "available",
    requestedBy: "admin",
    date: "1 day ago",
  },
  {
    id: 4,
    title: "Mickey 17",
    type: "movie",
    status: "pending",
    requestedBy: "user3",
    date: "2 days ago",
  },
  {
    id: 5,
    title: "Andor S02",
    type: "tv",
    status: "processing",
    requestedBy: "admin",
    date: "3 days ago",
  },
];

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    label: "Pending",
  },
  approved: {
    icon: CheckCircle2,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    label: "Approved",
  },
  available: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    label: "Available",
  },
  processing: {
    icon: Clock,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    label: "Processing",
  },
  declined: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-400/10",
    label: "Declined",
  },
};

export function MediaRequestsWidget() {
  return (
    <GlassCard className="h-full" noPadding>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Requests</h3>
        </div>
        <span className="text-[10px] text-slate-600">
          {requests.filter((r) => r.status === "pending").length} pending
        </span>
      </div>

      <div className="space-y-0.5 px-3 pb-3">
        {requests.map((req) => {
          const config =
            statusConfig[req.status as keyof typeof statusConfig] ||
            statusConfig.pending;
          const StatusIcon = config.icon;

          return (
            <div
              key={req.id}
              className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                {req.type === "movie" ? (
                  <Film className="w-4 h-4 text-violet-400" />
                ) : (
                  <MonitorPlay className="w-4 h-4 text-cyan-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 truncate">{req.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-600">
                    {req.requestedBy}
                  </span>
                  <span className="text-[10px] text-slate-700">·</span>
                  <span className="text-[10px] text-slate-600">{req.date}</span>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-[10px]",
                  config.bg,
                  config.color
                )}
              >
                <StatusIcon className="w-3 h-3" />
                <span>{config.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
