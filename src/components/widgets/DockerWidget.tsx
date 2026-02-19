"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Box,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatBytes } from "@/lib/utils";

interface Container {
  name: string;
  image: string;
  state: string;
  uptime: string;
  cpu: string;
  memory: number;
}

const stateConfig = {
  running: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  exited: { icon: XCircle, color: "text-red-400", dot: "bg-red-400" },
  stopped: { icon: XCircle, color: "text-red-400", dot: "bg-red-400" },
  restarting: {
    icon: RotateCcw,
    color: "text-amber-400",
    dot: "bg-amber-400",
  },
  error: {
    icon: AlertTriangle,
    color: "text-red-400",
    dot: "bg-red-400",
  },
};

export function DockerWidget() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContainers() {
      try {
        const res = await fetch("/api/docker");
        if (res.ok) {
          setContainers(await res.json());
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchContainers();
    const interval = setInterval(fetchContainers, 15000);
    return () => clearInterval(interval);
  }, []);

  const running = containers.filter((c) => c.state === "running").length;
  const total = containers.length;

  return (
    <GlassCard noPadding>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Docker</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400">
            {running}
          </span>
          <span className="text-[10px] text-slate-600">/ {total} running</span>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : containers.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-slate-600">
            <p className="text-xs">No containers found</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {containers.map((container, i) => {
              const config =
                stateConfig[container.state as keyof typeof stateConfig] ||
                stateConfig.error;

              return (
                <motion.div
                  key={container.name}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      config.dot
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate">
                      {container.name}
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono truncate">
                      {container.image}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono w-12 text-right">
                      {container.cpu}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono w-16 text-right">
                      {formatBytes(container.memory)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
