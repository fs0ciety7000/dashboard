"use client";

import { cn } from "@/lib/utils";
import type { ServiceStatus } from "@/config/services";

interface StatusBadgeProps {
  status: ServiceStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function StatusBadge({
  status,
  showLabel = false,
  size = "md",
}: StatusBadgeProps) {
  const dotSize = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";

  const statusConfig = {
    online: {
      dot: "bg-emerald-400 status-dot-online",
      label: "Online",
      text: "text-emerald-400",
    },
    offline: {
      dot: "bg-red-400 status-dot-offline",
      label: "Offline",
      text: "text-red-400",
    },
    error: {
      dot: "bg-amber-400 status-dot-error",
      label: "Error",
      text: "text-amber-400",
    },
    unknown: {
      dot: "bg-slate-500",
      label: "Unknown",
      text: "text-slate-500",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={cn("rounded-full", dotSize, config.dot)} />
      {showLabel && (
        <span className={cn("text-xs font-medium", config.text)}>
          {config.label}
        </span>
      )}
    </div>
  );
}
