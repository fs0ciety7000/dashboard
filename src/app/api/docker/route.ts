import { NextResponse } from "next/server";
import http from "node:http";
export const dynamic = "force-dynamic";

interface DockerContainer {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
}

interface DockerStats {
  cpu_stats: {
    cpu_usage: { total_usage: number };
    system_cpu_usage: number;
    online_cpus: number;
  };
  precpu_stats: {
    cpu_usage: { total_usage: number };
    system_cpu_usage: number;
  };
  memory_stats: {
    usage: number;
    stats?: { cache?: number };
  };
}

function dockerRequest<T>(path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const socketPath = process.env.DOCKER_HOST?.replace("unix://", "") || "/var/run/docker.sock";
    const req = http.request(
      { socketPath, path, method: "GET", headers: { "Content-Type": "application/json" } },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error("Invalid JSON from Docker API"));
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error("Docker API timeout")); });
    req.end();
  });
}

function parseUptime(status: string): string {
  const match = status.match(/Up\s+(.+?)(?:\s+\(|$)/);
  return match ? match[1].trim() : "—";
}

function calcCpuPercent(stats: DockerStats): number {
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const sysDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
  const cpus = stats.cpu_stats.online_cpus || 1;
  if (sysDelta > 0 && cpuDelta >= 0) {
    return Math.round((cpuDelta / sysDelta) * cpus * 1000) / 10;
  }
  return 0;
}

export async function GET() {
  try {
    const containers = await dockerRequest<DockerContainer[]>("/containers/json?all=true");

    const results = await Promise.allSettled(
      containers.map(async (c) => {
        let cpu = 0;
        let memory = 0;
        if (c.State === "running") {
          try {
            const stats = await dockerRequest<DockerStats>(
              `/containers/${c.Id}/stats?stream=false`
            );
            cpu = calcCpuPercent(stats);
            const cache = stats.memory_stats.stats?.cache ?? 0;
            memory = (stats.memory_stats.usage ?? 0) - cache;
          } catch {
            // Stats unavailable for this container
          }
        }
        return {
          name: c.Names[0]?.replace(/^\//, "") ?? c.Id.slice(0, 12),
          image: c.Image,
          state: c.State,
          uptime: parseUptime(c.Status),
          cpu: `${cpu}%`,
          memory: Math.max(0, memory),
        };
      })
    );

    const data = results
      .filter((r): r is PromiseFulfilledResult<{ name: string; image: string; state: string; uptime: string; cpu: string; memory: number }> => r.status === "fulfilled")
      .map((r) => r.value)
      .sort((a, b) => {
        if (a.state === "running" && b.state !== "running") return -1;
        if (a.state !== "running" && b.state === "running") return 1;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Docker API error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
