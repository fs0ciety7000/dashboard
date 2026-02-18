"use client";

import { useState, useEffect } from "react";
import { ServiceCard } from "@/components/widgets/ServiceCard";
import {
  services,
  categoryLabels,
  type ServiceCategory,
  type ServiceStatus,
} from "@/config/services";
import { settings } from "@/config/settings";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories: (ServiceCategory | "all")[] = [
  "all",
  "infrastructure",
  "media",
  "tools",
  "monitoring",
  "other",
];

export default function ServicesPage() {
  const [statuses, setStatuses] = useState<Record<string, ServiceStatus>>({});
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ServiceCategory | "all"
  >("all");

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

  const filteredServices = services.filter((s) => {
    const matchSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "all" || s.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const online = Object.values(statuses).filter(
    (s) => s === "online"
  ).length;
  const offline = Object.values(statuses).filter(
    (s) => s === "offline"
  ).length;
  const errors = Object.values(statuses).filter(
    (s) => s === "error"
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Services</h1>
        <p className="text-sm text-slate-500 mt-1">
          {services.length} services configured · {online} online
        </p>
      </div>

      {/* Status summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{online} Online</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-red-400">
          <XCircle className="w-4 h-4" />
          <span>{offline} Offline</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <span>{errors} Errors</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/20 transition-colors"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-600 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "text-[11px] px-3 py-1.5 rounded-lg transition-colors",
                activeCategory === cat
                  ? "bg-white/[0.08] text-white border border-white/[0.1]"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
              )}
            >
              {cat === "all" ? "All" : categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredServices.map((service, i) => (
          <ServiceCard
            key={service.id}
            service={service}
            status={statuses[service.id] || "unknown"}
            index={i}
          />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-slate-500">No services found</p>
        </div>
      )}
    </motion.div>
  );
}
