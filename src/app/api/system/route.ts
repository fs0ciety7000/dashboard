import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

// Cache Beszel auth token
let beszelToken: string | null = null;
let beszelTokenExpiry = 0;

async function getBeszelToken(): Promise<string | null> {
  const url = process.env.BESZEL_URL?.replace(/\/+$/, "");
  const email = process.env.BESZEL_EMAIL;
  const password = process.env.BESZEL_PASSWORD;

  if (!url || !email || !password) return null;

  // Re-use cached token if still valid (refresh 10 min before expiry)
  if (beszelToken && Date.now() < beszelTokenExpiry - 600000) {
    return beszelToken;
  }

  try {
    const res = await fetch(`${url}/api/collections/users/auth-with-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: email, password }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error("Beszel auth failed:", res.status);
      return null;
    }

    const data = await res.json();
    beszelToken = data.token;
    // PocketBase tokens are valid for ~2 weeks, refresh every hour
    beszelTokenExpiry = Date.now() + 3600000;
    return beszelToken;
  } catch (error) {
    console.error("Beszel auth error:", error);
    return null;
  }
}

async function fetchBeszelStats() {
  const url = process.env.BESZEL_URL?.replace(/\/+$/, "");
  const token = await getBeszelToken();
  if (!url || !token) return null;

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const opts: RequestInit = { headers, signal: AbortSignal.timeout(8000) };

    // Fetch systems (live data)
    const systemsRes = await fetch(
      `${url}/api/collections/systems/records?filter=status%3D%22up%22&perPage=1&sort=-updated`,
      opts
    );
    if (!systemsRes.ok) {
      console.error("Beszel systems error:", systemsRes.status);
      return null;
    }

    const systemsData = await systemsRes.json();
    const system = systemsData.items?.[0];
    if (!system) return null;

    const info = system.info || {};

    // Fetch latest detailed stats for this system
    const statsRes = await fetch(
      `${url}/api/collections/system_stats/records?filter=system%3D%22${system.id}%22%26%26type%3D%221m%22&sort=-created&perPage=1`,
      opts
    );

    let detailedStats: Record<string, number> = {};
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      detailedStats = statsData.items?.[0]?.stats || {};
    }

    // Memory: detailed stats have m (total GB), mu (used GB), mp (%)
    const memTotalGB = detailedStats.m || 0;
    const memUsedGB = detailedStats.mu || 0;
    const memPercent = info.mp ?? detailedStats.mp ?? 0;

    // Disk: dp (%), d (total GB), du (used GB)
    const diskTotalGB = detailedStats.d || 0;
    const diskUsedGB = detailedStats.du || 0;
    const diskPercent = info.dp ?? detailedStats.dp ?? 0;

    // Swap
    const swapGB = detailedStats.s || 0;

    return {
      cpu: Math.round((info.cpu ?? detailedStats.cpu ?? 0) * 10) / 10,
      cpuTemp: Math.round(info.dt ?? detailedStats.dt ?? 0),
      cpuCores: system.info?.c || 0,
      cpuModel: system.host || system.name || "Unknown CPU",
      memory: {
        used: Math.round(memUsedGB * 1073741824), // GB to bytes
        total: Math.round(memTotalGB * 1073741824),
        percent: Math.round(memPercent * 10) / 10,
      },
      swap: {
        used: Math.round(swapGB * 1073741824),
        total: Math.round(swapGB * 1073741824),
        percent: swapGB > 0 ? 100 : 0,
      },
      disk: {
        used: Math.round(diskUsedGB * 1073741824),
        total: Math.round(diskTotalGB * 1073741824),
        percent: Math.round(diskPercent * 10) / 10,
      },
      uptime: system.info?.u || 0,
      loadAvg: [0, 0, 0],
      processes: 0,
    };
  } catch (error) {
    console.error("Beszel fetch error:", error);
    return null;
  }
}

export async function GET() {
  try {
    // Try Beszel first
    const beszelStats = await fetchBeszelStats();
    if (beszelStats) {
      return NextResponse.json(beszelStats);
    }

    // Fallback: return zeros if Beszel not configured
    return NextResponse.json({
      cpu: 0,
      cpuTemp: 0,
      cpuCores: 0,
      cpuModel: "Beszel not configured",
      memory: { used: 0, total: 1, percent: 0 },
      swap: { used: 0, total: 1, percent: 0 },
      disk: { used: 0, total: 1, percent: 0 },
      uptime: 0,
      loadAvg: [0, 0, 0],
      processes: 0,
    });
  } catch (error) {
    console.error("System stats error:", error);
    return NextResponse.json(
      { error: "Failed to get system stats" },
      { status: 500 }
    );
  }
}
