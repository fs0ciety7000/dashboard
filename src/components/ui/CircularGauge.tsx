"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CircularGaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: "cyan" | "purple" | "pink" | "green" | "amber" | "red";
  label?: string;
  sublabel?: string;
}

const gradientColors = {
  cyan: { start: "#22d3ee", end: "#06b6d4" },
  purple: { start: "#a78bfa", end: "#8b5cf6" },
  pink: { start: "#f472b6", end: "#ec4899" },
  green: { start: "#34d399", end: "#10b981" },
  amber: { start: "#fbbf24", end: "#f59e0b" },
  red: { start: "#f87171", end: "#ef4444" },
};

export function CircularGauge({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = "cyan",
  label,
  sublabel,
}: CircularGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;
  const colors = gradientColors[color];
  const gradientId = `gauge-gradient-${color}-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Value arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-mono font-bold text-white",
              size >= 120 ? "text-2xl" : "text-lg"
            )}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-xs font-medium text-slate-300">{label}</p>
          {sublabel && (
            <p className="text-[10px] text-slate-500">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
