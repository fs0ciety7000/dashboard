import { NextResponse } from "next/server";
import { execSync } from "child_process";

function safeExec(cmd: string, fallback: string = ""): string {
  try {
    return execSync(cmd, { timeout: 3000, encoding: "utf-8" }).trim();
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    // CPU usage
    const cpuIdle = safeExec(
      "top -bn1 | grep 'Cpu(s)' | awk '{print $8}'",
      "75"
    );
    const cpuUsage = 100 - parseFloat(cpuIdle || "75");

    // CPU temperature
    const cpuTemp = parseFloat(
      safeExec(
        "cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk '{print $1/1000}'",
        "0"
      )
    );

    // CPU info
    const cpuCores = parseInt(safeExec("nproc", "4"), 10);
    const cpuModel = safeExec(
      "cat /proc/cpuinfo | grep 'model name' | head -1 | cut -d: -f2",
      "Unknown CPU"
    ).trim();

    // Memory
    const memInfo = safeExec("free -b | grep Mem");
    const memParts = memInfo.split(/\s+/).filter(Boolean);
    const memTotal = parseInt(memParts[1] || "0", 10);
    const memUsed = parseInt(memParts[2] || "0", 10);
    const memPercent = memTotal > 0 ? (memUsed / memTotal) * 100 : 0;

    // Swap
    const swapInfo = safeExec("free -b | grep Swap");
    const swapParts = swapInfo.split(/\s+/).filter(Boolean);
    const swapTotal = parseInt(swapParts[1] || "0", 10);
    const swapUsed = parseInt(swapParts[2] || "0", 10);
    const swapPercent = swapTotal > 0 ? (swapUsed / swapTotal) * 100 : 0;

    // Disk
    const diskInfo = safeExec("df -B1 / | tail -1");
    const diskParts = diskInfo.split(/\s+/).filter(Boolean);
    const diskTotal = parseInt(diskParts[1] || "0", 10);
    const diskUsed = parseInt(diskParts[2] || "0", 10);
    const diskPercent = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;

    // Uptime
    const uptimeSeconds = parseFloat(
      safeExec("cat /proc/uptime | awk '{print $1}'", "0")
    );

    // Load average
    const loadAvgStr = safeExec("cat /proc/loadavg", "0 0 0");
    const loadAvg = loadAvgStr.split(" ").slice(0, 3).map(Number);

    // Process count
    const processes = parseInt(
      safeExec("ps aux | wc -l", "0"),
      10
    );

    return NextResponse.json({
      cpu: Math.round(cpuUsage * 10) / 10,
      cpuTemp: Math.round(cpuTemp),
      cpuCores,
      cpuModel: cpuModel || "Unknown CPU",
      memory: {
        used: memUsed,
        total: memTotal,
        percent: Math.round(memPercent * 10) / 10,
      },
      swap: {
        used: swapUsed,
        total: swapTotal,
        percent: Math.round(swapPercent * 10) / 10,
      },
      disk: {
        used: diskUsed,
        total: diskTotal,
        percent: Math.round(diskPercent * 10) / 10,
      },
      uptime: Math.round(uptimeSeconds),
      loadAvg,
      processes,
    });
  } catch (error) {
    console.error("System stats error:", error);
    return NextResponse.json(
      { error: "Failed to get system stats" },
      { status: 500 }
    );
  }
}
