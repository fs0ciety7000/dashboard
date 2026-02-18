"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { services } from "@/config/services";
import type { ServiceStatus } from "@/config/services";
import { settings } from "@/config/settings";
import { CheckCircle2, XCircle, AlertTriangle, Server } from "lucide-react";
import Link from "next/link";

export function ServiceStatusWidget() {
  const [statuses, setStatuses] = useState<Record<string, ServiceStatus>>({});

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const res = await fetch("/api/services/status");
        if (res.ok) {
          const data = await res.json();
          setStatuses(data);
        }
      } catch {
        // Silently fail
      }
    }
    fetchStatuses();
    const interval = setInterval(
      fetchStatuses,
      settings.refreshIntervals.serviceStatus
    );
    return () => clearInterval(interval);
  }, []);

  const online = Object.values(statuses).filter((s) => s === "online").length;
  const offline = Object.values(statuses).filter((s) => s === "offline").length;
  const errors = Object.values(statuses).filter((s) => s === "error").length;
  const total = services.length;

  // Show services that are down or have errors
  const problemServices = services.filter(
    (s) => statuses[s.id] === "offline" || statuses[s.id] === "error"
  );

  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Services</h3>
        </div>
        <Link
          href="/services"
          className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-400/5 border border-emerald-400/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-lg font-bold font-mono text-emerald-400">
              {online}
            </p>
            <p className="text-[10px] text-slate-500">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-400/5 border border-red-400/10">
          <XCircle className="w-4 h-4 text-red-400" />
          <div>
            <p className="text-lg font-bold font-mono text-red-400">
              {offline}
            </p>
            <p className="text-[10px] text-slate-500">Offline</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-400/5 border border-amber-400/10">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <div>
            <p className="text-lg font-bold font-mono text-amber-400">
              {errors}
            </p>
            <p className="text-[10px] text-slate-500">Errors</p>
          </div>
        </div>
      </div>

      {/* Uptime bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>Uptime</span>
          <span>
            {total > 0 ? Math.round((online / total) * 100) : 0}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-1000"
            style={{
              width: `${total > 0 ? (online / total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Problem services */}
      {problemServices.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-white/[0.04]">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider">
            Issues
          </p>
          {problemServices.slice(0, 3).map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between py-1"
            >
              <span className="text-xs text-slate-400">{service.name}</span>
              <StatusBadge
                status={statuses[service.id] || "unknown"}
                showLabel
                size="sm"
              />
            </div>
          ))}
        </div>
      )}

      {problemServices.length === 0 && Object.keys(statuses).length > 0 && (
        <div className="pt-3 border-t border-white/[0.04] text-center">
          <p className="text-xs text-emerald-400/60">All systems operational</p>
        </div>
      )}
    </GlassCard>
  );
}
