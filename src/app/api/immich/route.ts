import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.IMMICH_URL?.replace(/\/+$/, "");
  const apiKey = process.env.IMMICH_API_KEY;

  if (!url || !apiKey) {
    return NextResponse.json(null);
  }

  try {
    const headers = { "x-api-key": apiKey };
    const opts: RequestInit = { headers, signal: AbortSignal.timeout(10000) };

    const [statsRes, infoRes] = await Promise.allSettled([
      fetch(`${url}/api/server/statistics`, opts),
      fetch(`${url}/api/server/info`, opts),
    ]);

    let photos = 0;
    let videos = 0;
    let usage = 0;
    let users = 0;

    if (statsRes.status === "fulfilled" && statsRes.value.ok) {
      const stats = await statsRes.value.json();
      if (Array.isArray(stats.usageByUser)) {
        for (const u of stats.usageByUser) {
          photos += u.photos ?? 0;
          videos += u.videos ?? 0;
          usage += u.usage ?? 0;
          users++;
        }
      } else {
        photos = stats.photos ?? 0;
        videos = stats.videos ?? 0;
        usage = stats.usage ?? 0;
      }
    } else if (statsRes.status === "fulfilled") {
      console.error("Immich stats error:", statsRes.value.status, await statsRes.value.text().catch(() => ""));
    } else {
      console.error("Immich stats fetch error:", (statsRes as PromiseRejectedResult).reason);
    }

    let version = "";
    if (infoRes.status === "fulfilled" && infoRes.value.ok) {
      const info = await infoRes.value.json();
      version = info.version ?? "";
    } else if (infoRes.status === "fulfilled") {
      console.error("Immich info error:", infoRes.value.status);
    }

    return NextResponse.json({ photos, videos, usage, users, version });
  } catch (error) {
    console.error("Immich API error:", error);
    return NextResponse.json(null);
  }
}
