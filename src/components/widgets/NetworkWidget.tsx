"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ArrowUpFromLine,
  ArrowDownToLine,
  Network,
  Globe,
  Wifi,
} from "lucide-react";
import { formatBytes, formatSpeed } from "@/lib/utils";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

// Generate demo chart data
function generateNetworkData() {
  const data = [];
  const now = Date.now();
  for (let i = 30; i >= 0; i--) {
    data.push({
      time: new Date(now - i * 2000).toLocaleTimeString("en", {
        hour12: false,
        minute: "2-digit",
        second: "2-digit",
      }),
      download: Math.random() * 100_000_000 + 20_000_000,
      upload: Math.random() * 20_000_000 + 5_000_000,
    });
  }
  return data;
}

export function NetworkWidget() {
  const [data, setData] = useState(generateNetworkData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newPoint = {
          time: new Date().toLocaleTimeString("en", {
            hour12: false,
            minute: "2-digit",
            second: "2-digit",
          }),
          download: Math.random() * 100_000_000 + 20_000_000,
          upload: Math.random() * 20_000_000 + 5_000_000,
        };
        return [...prev.slice(1), newPoint];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const latest = data[data.length - 1];

  return (
    <GlassCard noPadding>
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Network</h3>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400">Connected</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Download</p>
              <p className="text-sm font-mono font-bold text-emerald-400">
                {formatSpeed(latest?.download ?? 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
              <ArrowUpFromLine className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Upload</p>
              <p className="text-sm font-mono font-bold text-blue-400">
                {formatSpeed(latest?.upload ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Network info */}
        <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-slate-600" />
            <span className="text-slate-500">
              eth0: 10.0.1.100
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-slate-600" />
            <span className="text-slate-500">
              Gateway: 10.0.1.1
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dl-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ul-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <Tooltip
              contentStyle={{
                background: "rgba(6,6,10,0.9)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                fontSize: "10px",
                color: "#e2e8f0",
              }}
              formatter={(value) => [formatSpeed(Number(value))]}
              labelStyle={{ color: "#64748b" }}
            />
            <Area
              type="monotone"
              dataKey="download"
              stroke="#34d399"
              strokeWidth={1.5}
              fill="url(#dl-gradient)"
              name="Download"
            />
            <Area
              type="monotone"
              dataKey="upload"
              stroke="#60a5fa"
              strokeWidth={1.5}
              fill="url(#ul-gradient)"
              name="Upload"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
