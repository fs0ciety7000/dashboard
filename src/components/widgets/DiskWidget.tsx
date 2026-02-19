"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { HardDrive, Loader2 } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface Disk {
  mount: string;
  device: string;
  filesystem: string;
  used: number;
  total: number;
  label: string;
}

function getColorForUsage(
  percent: number
): "green" | "cyan" | "amber" | "red" {
  if (percent < 50) return "green";
  if (percent < 75) return "cyan";
  if (percent < 90) return "amber";
  return "red";
}

export function DiskWidget() {
  const [disks, setDisks] = useState<Disk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDisks() {
      try {
        const res = await fetch("/api/disks");
        if (res.ok) {
          setDisks(await res.json());
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchDisks();
    const interval = setInterval(fetchDisks, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <HardDrive className="w-4 h-4 text-pink-400" />
        <h3 className="text-sm font-semibold text-white">Storage</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : disks.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-slate-600">
          <p className="text-xs">No disks found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {disks.map((disk) => {
              const percent = (disk.used / disk.total) * 100;
              const color = getColorForUsage(percent);
              const free = disk.total - disk.used;

              return (
                <div key={disk.mount} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-300">
                        {disk.label}
                      </p>
                      <p className="text-[10px] text-slate-600 font-mono">
                        {disk.mount} ({disk.filesystem})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-white">
                        {formatBytes(disk.used)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {formatBytes(free)} free
                      </p>
                    </div>
                  </div>
                  <ProgressBar
                    value={percent}
                    color={color}
                    size="sm"
                    showLabel
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Total storage</span>
            <span className="text-xs font-mono text-white">
              {formatBytes(disks.reduce((acc, d) => acc + d.total, 0))}
            </span>
          </div>
        </>
      )}
    </GlassCard>
  );
}
