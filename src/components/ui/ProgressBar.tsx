"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "cyan" | "purple" | "pink" | "green" | "amber" | "red";
  size?: "sm" | "md";
  showLabel?: boolean;
  animated?: boolean;
}

const colorMap = {
  cyan: "bg-cyan-400",
  purple: "bg-violet-400",
  pink: "bg-pink-400",
  green: "bg-emerald-400",
  amber: "bg-amber-400",
  red: "bg-red-400",
};

const glowMap = {
  cyan: "shadow-[0_0_8px_rgba(34,211,238,0.4)]",
  purple: "shadow-[0_0_8px_rgba(167,139,250,0.4)]",
  pink: "shadow-[0_0_8px_rgba(244,114,182,0.4)]",
  green: "shadow-[0_0_8px_rgba(52,211,153,0.4)]",
  amber: "shadow-[0_0_8px_rgba(251,191,36,0.4)]",
  red: "shadow-[0_0_8px_rgba(248,113,113,0.4)]",
};

export function ProgressBar({
  value,
  max = 100,
  color = "cyan",
  size = "md",
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const heightClass = size === "sm" ? "h-1" : "h-1.5";

  return (
    <div className="flex items-center gap-3 w-full">
      <div
        className={cn(
          "flex-1 rounded-full overflow-hidden relative",
          heightClass,
          "bg-white/5"
        )}
      >
        <motion.div
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "h-full rounded-full relative",
            colorMap[color],
            glowMap[color],
            animated && "progress-shimmer"
          )}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-slate-400 w-10 text-right">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
