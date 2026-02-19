import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "child_process";

interface InterfaceStats {
  rxBytes: number;
  txBytes: number;
}

function readNetDev(): Record<string, InterfaceStats> {
  // Prefer host's /proc/net/dev via /host mount
  const netDevPath = existsSync("/host/proc/net/dev")
    ? "/host/proc/net/dev"
    : "/proc/net/dev";

  try {
    const data = readFileSync(netDevPath, "utf-8");
    const lines = data.split("\n").slice(2); // Skip headers
    const result: Record<string, InterfaceStats> = {};

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 10) continue;
      const iface = parts[0].replace(":", "");
      if (iface === "lo") continue;
      // Skip Docker/veth interfaces
      if (iface.startsWith("veth") || iface.startsWith("br-") || iface === "docker0") continue;
      result[iface] = {
        rxBytes: parseInt(parts[1], 10),
        txBytes: parseInt(parts[9], 10),
      };
    }
    return result;
  } catch {
    return {};
  }
}

function safeExec(cmd: string, fallback: string = ""): string {
  try {
    return execSync(cmd, { timeout: 3000, encoding: "utf-8" }).trim();
  } catch {
    return fallback;
  }
}

function getDefaultInterface(): { name: string; ip: string; gateway: string } {
  const route = safeExec("ip route | grep default | head -1");
  const ifaceMatch = route.match(/dev\s+(\S+)/);
  const gwMatch = route.match(/via\s+(\S+)/);
  const iface = ifaceMatch?.[1] || "eth0";
  const gateway = gwMatch?.[1] || "—";

  const addrOutput = safeExec(
    `ip -4 addr show ${iface} 2>/dev/null | grep inet | head -1`
  );
  const ipMatch = addrOutput.match(/inet\s+(\S+)/);
  const ip = ipMatch?.[1]?.split("/")[0] || "—";

  return { name: iface, ip, gateway };
}

// Store previous reading for rate calculation
let prevStats: { time: number; data: Record<string, InterfaceStats> } | null =
  null;

export async function GET() {
  try {
    const currentStats = readNetDev();
    const now = Date.now();
    const ifaceInfo = getDefaultInterface();

    let download = 0;
    let upload = 0;

    if (prevStats) {
      const elapsed = (now - prevStats.time) / 1000;
      if (elapsed > 0) {
        for (const [iface, curr] of Object.entries(currentStats)) {
          const prev = prevStats.data[iface];
          if (prev) {
            download += Math.max(0, curr.rxBytes - prev.rxBytes) / elapsed;
            upload += Math.max(0, curr.txBytes - prev.txBytes) / elapsed;
          }
        }
      }
    }

    prevStats = { time: now, data: currentStats };

    return NextResponse.json({
      interface: `${ifaceInfo.name}: ${ifaceInfo.ip}`,
      gateway: ifaceInfo.gateway,
      download: Math.round(download),
      upload: Math.round(upload),
    });
  } catch (error) {
    console.error("Network stats error:", error);
    return NextResponse.json(
      { interface: "—", gateway: "—", download: 0, upload: 0 },
      { status: 500 }
    );
  }
}
