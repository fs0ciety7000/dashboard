"use client";

import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ServiceConfig, ServiceStatus } from "@/config/services";
import { ExternalLink, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface ServiceCardProps {
  service: ServiceConfig;
  status: ServiceStatus;
  index: number;
}

const categoryAccents: Record<string, string> = {
  infrastructure: "from-amber-400/10 to-orange-400/5 hover:border-amber-400/20",
  media: "from-violet-400/10 to-purple-400/5 hover:border-violet-400/20",
  tools: "from-cyan-400/10 to-blue-400/5 hover:border-cyan-400/20",
  monitoring: "from-emerald-400/10 to-green-400/5 hover:border-emerald-400/20",
  other: "from-pink-400/10 to-rose-400/5 hover:border-pink-400/20",
};

const categoryIconColors: Record<string, string> = {
  infrastructure: "text-amber-400",
  media: "text-violet-400",
  tools: "text-cyan-400",
  monitoring: "text-emerald-400",
  other: "text-pink-400",
};

export function ServiceCard({ service, status, index }: ServiceCardProps) {
  const accent = categoryAccents[service.category] || categoryAccents.other;
  const iconColor =
    categoryIconColors[service.category] || categoryIconColors.other;

  return (
    <motion.a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.03,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        "glass-card glass-card-interactive p-4 group relative overflow-hidden",
        "bg-gradient-to-br",
        accent
      )}
    >
      {/* Top row: icon + status */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            "bg-white/[0.04] border border-white/[0.06]"
          )}
        >
          <DynamicIcon name={service.icon} className={cn("w-5 h-5", iconColor)} />
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Name & description */}
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-white group-hover:text-white/90 transition-colors flex items-center gap-1.5">
          {service.name}
          {service.internal && (
            <Lock className="w-3 h-3 text-slate-600" />
          )}
        </h4>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {service.description}
        </p>
      </div>

      {/* URL */}
      <div className="flex items-center gap-1 text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors">
        <span className="truncate font-mono">
          {service.url.replace("https://", "")}
        </span>
        <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.a>
  );
}
