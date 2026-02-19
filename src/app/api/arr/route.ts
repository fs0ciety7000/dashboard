import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

interface ArrServiceConfig {
  name: string;
  url: string | undefined;
  apiKey: string | undefined;
  apiVersion: string;
}

async function fetchArr(service: ArrServiceConfig) {
  if (!service.url || !service.apiKey) {
    console.log(`${service.name}: skipped (url=${!!service.url}, apiKey=${!!service.apiKey})`);
    return null;
  }

  const base = service.url.replace(/\/+$/, "");
  const headers = { "X-Api-Key": service.apiKey };
  const opts: RequestInit = { headers, signal: AbortSignal.timeout(10000) };

  try {
    const [statsRes, queueRes, diskRes] = await Promise.allSettled([
      // Sonarr: /api/v3/series, Radarr: /api/v3/movie, Lidarr: /api/v1/artist
      service.name === "Sonarr"
        ? fetch(`${base}/api/${service.apiVersion}/series`, opts)
        : service.name === "Radarr"
          ? fetch(`${base}/api/${service.apiVersion}/movie`, opts)
          : fetch(`${base}/api/${service.apiVersion}/artist`, opts),
      fetch(`${base}/api/${service.apiVersion}/queue?pageSize=1`, opts),
      fetch(`${base}/api/${service.apiVersion}/diskspace`, opts),
    ]);

    let monitored = 0;
    let episodes: number | null = null;
    let missing = 0;

    if (statsRes.status === "rejected") {
      console.error(`${service.name} stats fetch failed:`, statsRes.reason);
    } else if (!statsRes.value.ok) {
      console.error(`${service.name} stats HTTP ${statsRes.value.status}:`, await statsRes.value.text().catch(() => ""));
    }
    if (statsRes.status === "fulfilled" && statsRes.value.ok) {
      const items = await statsRes.value.json();
      if (Array.isArray(items)) {
        monitored = items.filter((i: Record<string, unknown>) => i.monitored).length;

        if (service.name === "Sonarr") {
          episodes = items.reduce(
            (acc: number, s: Record<string, unknown>) =>
              acc + ((s.statistics as Record<string, number>)?.episodeFileCount ?? 0),
            0
          );
          missing = items.reduce(
            (acc: number, s: Record<string, unknown>) => {
              const stats = s.statistics as Record<string, number> | undefined;
              return acc + ((stats?.episodeCount ?? 0) - (stats?.episodeFileCount ?? 0));
            },
            0
          );
        } else if (service.name === "Radarr") {
          missing = items.filter(
            (m: Record<string, unknown>) => m.monitored && !m.hasFile
          ).length;
        } else {
          // Lidarr
          missing = items.reduce(
            (acc: number, a: Record<string, unknown>) => {
              const stats = a.statistics as Record<string, number> | undefined;
              return acc + ((stats?.albumCount ?? 0) - (stats?.percentOfAlbums ? Math.round((stats?.albumCount ?? 0) * (stats.percentOfAlbums / 100)) : 0));
            },
            0
          );
        }
      }
    }

    let queue = 0;
    if (queueRes.status === "fulfilled" && queueRes.value.ok) {
      const qData = await queueRes.value.json();
      queue = qData.totalRecords ?? 0;
    }

    let diskUsage = 0;
    if (diskRes.status === "fulfilled" && diskRes.value.ok) {
      const folders = await diskRes.value.json();
      if (Array.isArray(folders)) {
        diskUsage = folders.reduce(
          (acc: number, f: Record<string, unknown>) =>
            acc + (Number(f.totalSpace ?? 0) - Number(f.freeSpace ?? 0)),
          0
        );
        if (!isFinite(diskUsage)) diskUsage = 0;
      }
    }

    return {
      name: service.name,
      monitored,
      episodes,
      missing: Math.max(0, missing),
      queue,
      diskUsage,
    };
  } catch (error) {
    console.error(`${service.name} API error:`, error);
    return null;
  }
}

export async function GET() {
  const services: ArrServiceConfig[] = [
    {
      name: "Sonarr",
      url: process.env.SONARR_URL,
      apiKey: process.env.SONARR_API_KEY,
      apiVersion: "v3",
    },
    {
      name: "Radarr",
      url: process.env.RADARR_URL,
      apiKey: process.env.RADARR_API_KEY,
      apiVersion: "v3",
    },
    {
      name: "Lidarr",
      url: process.env.LIDARR_URL,
      apiKey: process.env.LIDARR_API_KEY,
      apiVersion: "v1",
    },
  ];

  const results = await Promise.allSettled(services.map(fetchArr));
  const data = results
    .filter(
      (r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof fetchArr>>>> =>
        r.status === "fulfilled" && r.value !== null
    )
    .map((r) => r.value);

  return NextResponse.json(data);
}
