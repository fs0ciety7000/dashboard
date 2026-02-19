"use client";

import { SystemDetailWidget } from "@/components/widgets/SystemDetailWidget";
import { DiskWidget } from "@/components/widgets/DiskWidget";
import { NetworkWidget } from "@/components/widgets/NetworkWidget";
import { DockerWidget } from "@/components/widgets/DockerWidget";
import { ImmichWidget } from "@/components/widgets/ImmichWidget";
import { ForgejoWidget } from "@/components/widgets/ForgejoWidget";
import { GlassCard } from "@/components/ui/GlassCard";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { motion } from "framer-motion";

const quickLinks = [
  {
    name: "Netdata",
    url: "https://netdata.internal.fs0ciety.org",
    icon: "Activity",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    description: "Real-time monitoring",
  },
  {
    name: "Uptime Kuma",
    url: "https://status.fs0ciety.org",
    icon: "HeartPulse",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    description: "Uptime monitoring",
  },
  {
    name: "Grafana",
    url: "https://grafana.internal.fs0ciety.org",
    icon: "LayoutDashboard",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    description: "Dashboards",
  },
  {
    name: "Prometheus",
    url: "https://prometheus.internal.fs0ciety.org",
    icon: "Database",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    description: "Metrics",
  },
  {
    name: "Dozzle",
    url: "https://logs.internal.fs0ciety.org",
    icon: "ScrollText",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    description: "Container logs",
  },
  {
    name: "Kopia",
    url: "https://backup.internal.fs0ciety.org",
    icon: "HardDrive",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    description: "Backups",
  },
  {
    name: "Traefik",
    url: "https://traefik.internal.fs0ciety.org",
    icon: "Shield",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    description: "Reverse proxy",
  },
  {
    name: "Jellystat",
    url: "https://stats.internal.fs0ciety.org",
    icon: "BarChart3",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
    description: "Jellyfin stats",
  },
];

export default function HomelabPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Homelab</h1>
        <p className="text-sm text-slate-500 mt-1">
          Server statistics, storage, network & containers
        </p>
      </div>

      {/* System gauges */}
      <SystemDetailWidget />

      {/* Quick links to monitoring tools */}
      <GlassCard>
        <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">
          Monitoring & Tools
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${link.bg} border ${link.border} hover:opacity-80 transition-opacity group`}
            >
              <DynamicIcon
                name={link.icon}
                className={`w-5 h-5 ${link.color}`}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {link.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {link.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </GlassCard>

      {/* Storage + Network + Docker */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-4">
          <DiskWidget />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <NetworkWidget />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <DockerWidget />
        </div>
      </div>

      {/* Immich + Forgejo */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-4">
          <ImmichWidget />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <ForgejoWidget />
        </div>
      </div>
    </motion.div>
  );
}
