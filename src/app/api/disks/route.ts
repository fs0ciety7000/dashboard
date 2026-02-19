import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "node:fs";
export const dynamic = "force-dynamic";

interface MountInfo {
  device: string;
  mount: string;
  filesystem: string;
  total: number;
  used: number;
  label: string;
}

function parseProcMounts(): MountInfo[] {
  // Read host's /proc/mounts via /host bind mount
  const mountsPath = existsSync("/host/proc/mounts") ? "/host/proc/mounts" : "/proc/mounts";

  try {
    const data = readFileSync(mountsPath, "utf-8");
    const lines = data.split("\n").filter(Boolean);
    const realMounts: MountInfo[] = [];

    // Skip virtual filesystems
    const skipFs = new Set([
      "sysfs", "proc", "tmpfs", "devtmpfs", "devpts", "cgroup", "cgroup2",
      "pstore", "securityfs", "debugfs", "tracefs", "fusectl", "configfs",
      "mqueue", "hugetlbfs", "binfmt_misc", "autofs", "overlay", "nsfs",
      "squashfs", "efivarfs", "bpf",
    ]);

    for (const line of lines) {
      const parts = line.split(" ");
      if (parts.length < 4) continue;
      const device = parts[0];
      const mount = parts[1];
      const filesystem = parts[2];

      if (skipFs.has(filesystem)) continue;
      if (!device.startsWith("/dev/")) continue;
      // Skip Docker/container internal mounts
      if (mount.includes("/docker/") || mount.includes("/containers/")) continue;

      realMounts.push({
        device,
        mount,
        filesystem,
        total: 0,
        used: 0,
        label: mount,
      });
    }

    return realMounts;
  } catch {
    return [];
  }
}

function getStatfs(path: string): { total: number; used: number } | null {
  // Use stat -f to get filesystem stats
  try {
    const { execSync } = require("child_process");
    // Try to stat via /host prefix for host filesystems
    const hostPath = existsSync(`/host${path}`) ? `/host${path}` : path;
    const output = execSync(
      `stat -f -c '%S %b %a' '${hostPath}' 2>/dev/null`,
      { timeout: 3000, encoding: "utf-8" }
    ).trim();
    const [blockSize, totalBlocks, availBlocks] = output.split(" ").map(Number);
    const total = blockSize * totalBlocks;
    const used = total - blockSize * availBlocks;
    return { total, used };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const mounts = parseProcMounts();
    // Deduplicate by device (keep first mount)
    const seen = new Set<string>();
    const uniqueMounts = mounts.filter((m) => {
      if (seen.has(m.device)) return false;
      seen.add(m.device);
      return true;
    });

    // Hide /boot and /host/boot
    const filtered = uniqueMounts.filter(
      (m) => !m.mount.match(/^(\/host)?\/boot/)
    );

    const disks = filtered
      .map((m) => {
        const stats = getStatfs(m.mount);
        if (!stats || stats.total < 100_000_000) return null; // Skip < 100MB

        // Generate label - strip /host prefix for display
        const displayMount = m.mount.replace(/^\/host/, "") || "/";
        let label = displayMount;
        if (displayMount === "/") label = "System";
        else if (displayMount.startsWith("/mnt/"))
          label = displayMount.replace("/mnt/", "").replace(/^\w/, (c) => c.toUpperCase());
        else if (displayMount.startsWith("/media/"))
          label = displayMount.replace("/media/", "").replace(/^\w/, (c) => c.toUpperCase());
        else if (displayMount.startsWith("/srv/"))
          label = displayMount.replace("/srv/", "").replace(/^\w/, (c) => c.toUpperCase());

        return {
          mount: displayMount,
          device: m.device,
          filesystem: m.filesystem,
          used: stats.used,
          total: stats.total,
          label,
        };
      })
      .filter(Boolean) as { mount: string; device: string; filesystem: string; used: number; total: number; label: string }[];

    // Merge storage disks: /, /mnt/disk2, /mnt/disk3 → "Storage"
    const storagePaths = new Set(["/", "/mnt/disk2", "/mnt/disk3"]);
    const storageDiskEntries = disks.filter((d) => storagePaths.has(d.mount));
    const otherDisks = disks.filter((d) => !storagePaths.has(d.mount));

    const result = [];

    if (storageDiskEntries.length > 0) {
      const totalUsed = storageDiskEntries.reduce((acc, d) => acc + d.used, 0);
      const totalSize = storageDiskEntries.reduce((acc, d) => acc + d.total, 0);
      result.push({
        mount: "/storage",
        device: storageDiskEntries.map((d) => d.device).join(", "),
        filesystem: storageDiskEntries[0].filesystem,
        used: totalUsed,
        total: totalSize,
        label: "Storage",
      });
    }

    result.push(...otherDisks);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Disk stats error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
