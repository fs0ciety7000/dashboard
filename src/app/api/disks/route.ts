import { NextResponse } from "next/server";
import { execSync } from "child_process";

function safeExec(cmd: string, fallback: string = ""): string {
  try {
    return execSync(cmd, { timeout: 5000, encoding: "utf-8" }).trim();
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    // Get all real mount points, excluding virtual/pseudo filesystems
    const raw = safeExec(
      "df -B1 -T -x tmpfs -x devtmpfs -x squashfs -x overlay -x efivarfs 2>/dev/null | tail -n +2"
    );

    if (!raw) {
      return NextResponse.json([]);
    }

    const disks = raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\s+/).filter(Boolean);
        // df -T output: Filesystem Type 1B-blocks Used Available Use% Mounted on
        if (parts.length < 7) return null;
        const device = parts[0];
        const filesystem = parts[1];
        const total = parseInt(parts[2], 10);
        const used = parseInt(parts[3], 10);
        const mount = parts[6];

        // Skip tiny filesystems (< 100MB) likely boot/efi
        if (total < 100_000_000) return null;

        // Generate a label from mount point
        let label = mount;
        if (mount === "/") label = "System";
        else if (mount.startsWith("/mnt/")) label = mount.replace("/mnt/", "").replace(/^\w/, (c) => c.toUpperCase());
        else if (mount.startsWith("/media/")) label = mount.replace("/media/", "").replace(/^\w/, (c) => c.toUpperCase());

        return { mount, device, filesystem, used, total, label };
      })
      .filter(Boolean);

    return NextResponse.json(disks);
  } catch (error) {
    console.error("Disk stats error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
