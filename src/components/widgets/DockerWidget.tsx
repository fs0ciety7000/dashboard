"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
  Box,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatBytes } from "@/lib/utils";

// Demo data - in production, would come from Docker API
const containers = [
  {
    name: "traefik",
    image: "traefik:v3.2",
    state: "running",
    uptime: "14d 3h",
    cpu: "0.3%",
    memory: 85_000_000,
  },
  {
    name: "jellyfin",
    image: "jellyfin/jellyfin:latest",
    state: "running",
    uptime: "14d 3h",
    cpu: "12.4%",
    memory: 2_200_000_000,
  },
  {
    name: "sonarr",
    image: "linuxserver/sonarr:latest",
    state: "running",
    uptime: "14d 3h",
    cpu: "1.2%",
    memory: 320_000_000,
  },
  {
    name: "radarr",
    image: "linuxserver/radarr:latest",
    state: "running",
    uptime: "14d 3h",
    cpu: "0.8%",
    memory: 280_000_000,
  },
  {
    name: "sabnzbd",
    image: "linuxserver/sabnzbd:latest",
    state: "running",
    uptime: "14d 3h",
    cpu: "5.6%",
    memory: 450_000_000,
  },
  {
    name: "authentik",
    image: "ghcr.io/goauthentik/server:latest",
    state: "running",
    uptime: "14d 3h",
    cpu: "2.1%",
    memory: 680_000_000,
  },
  {
    name: "adguard",
    image: "adguard/adguardhome:latest",
    state: "running",
    uptime: "14d 3h",
    cpu: "0.1%",
    memory: 52_000_000,
  },
  {
    name: "immich",
    image: "ghcr.io/immich-app/immich:latest",
    state: "running",
    uptime: "14d 3h",
    cpu: "3.4%",
    memory: 1_200_000_000,
  },
  {
    name: "qbittorrent",
    image: "linuxserver/qbittorrent:latest",
    state: "running",
    uptime: "14d 3h",
    cpu: "1.8%",
    memory: 180_000_000,
  },
  {
    name: "prometheus",
    image: "prom/prometheus:latest",
    state: "running",
    uptime: "14d 3h",
    cpu: "0.9%",
    memory: 420_000_000,
  },
  {
    name: "grafana",
    image: "grafana/grafana:latest",
    state: "running",
    uptime: "14d 3h",
    cpu: "0.5%",
    memory: 180_000_000,
  },
  {
    name: "vaultwarden",
    image: "vaultwarden/server:latest",
    state: "running",
    uptime: "14d 3h",
    cpu: "0.1%",
    memory: 45_000_000,
  },
];

const stateConfig = {
  running: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    dot: "bg-emerald-400",
  },
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
      </div>
    </GlassCard>
  );
}
