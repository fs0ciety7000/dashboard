"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { HardDrive } from "lucide-react";
import { formatBytes } from "@/lib/utils";

// Demo data - in production, would come from system API
const disks = [
  {
    mount: "/",
    device: "nvme0n1p2",
    filesystem: "ext4",
    used: 82_000_000_000,
    total: 512_000_000_000,
    label: "System (NVMe)",
  },
  {
    mount: "/mnt/data",
    device: "sda1",
    filesystem: "ext4",
    used: 14_200_000_000_000,
    total: 18_000_000_000_000,
    label: "Data Pool",
  },
  {
    mount: "/mnt/media",
    device: "sdb1",
    filesystem: "ext4",
    used: 6_800_000_000_000,
    total: 8_000_000_000_000,
    label: "Media",
  },
  {
    mount: "/mnt/backup",
    device: "sdc1",
    filesystem: "ext4",
    used: 3_200_000_000_000,
    total: 8_000_000_000_000,
    label: "Backup",
  },
];

function getColorForUsage(
  percent: number
): "green" | "cyan" | "amber" | "red" {
  if (percent < 50) return "green";
  if (percent < 75) return "cyan";
  if (percent < 90) return "amber";
  return "red";
}

export function DiskWidget() {
  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <HardDrive className="w-4 h-4 text-pink-400" />
        <h3 className="text-sm font-semibold text-white">Storage</h3>
      </div>

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
    </GlassCard>
  );
}
