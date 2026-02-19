import { NextResponse } from "next/server";

async function testService(
  name: string,
  url: string | undefined,
  testPath: string,
  headers: Record<string, string>
): Promise<{ env: string; status: number | string; url: string }> {
  if (!url) return { env: "MISSING", status: "n/a", url: "" };

  const base = url.replace(/\/+$/, "");
  try {
    const res = await fetch(`${base}${testPath}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    return { env: "OK", status: res.status, url: base };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { env: "OK", status: `ERR: ${msg.slice(0, 80)}`, url: base };
  }
}

export async function GET() {
  const results = await Promise.allSettled([
    testService("jellyfin", process.env.JELLYFIN_URL, "/Users", {
      "X-Emby-Token": process.env.JELLYFIN_API_KEY ?? "",
    }),
    testService("sonarr", process.env.SONARR_URL, "/api/v3/system/status", {
      "X-Api-Key": process.env.SONARR_API_KEY ?? "",
    }),
    testService("radarr", process.env.RADARR_URL, "/api/v3/system/status", {
      "X-Api-Key": process.env.RADARR_API_KEY ?? "",
    }),
    testService("sabnzbd", process.env.SABNZBD_URL, `/api?mode=version&output=json&apikey=${process.env.SABNZBD_API_KEY ?? ""}`, {}),
    testService("qbittorrent", process.env.QBITTORRENT_URL, "/api/v2/app/version", {}),
    testService("jellyseerr", process.env.JELLYSEERR_URL, "/api/v1/status", {
      "X-Api-Key": process.env.JELLYSEERR_API_KEY ?? "",
    }),
    testService("immich", process.env.IMMICH_URL, "/api/server/info", {
      "x-api-key": process.env.IMMICH_API_KEY ?? "",
    }),
    testService("jellystat", process.env.JELLYSTAT_URL, "/api/getLibraryCardStats", {
      "x-api-token": process.env.JELLYSTAT_API_KEY ?? "",
      "Content-Type": "application/json",
    }),
    testService("forgejo", process.env.FORGEJO_URL, "/api/v1/user", {
      Authorization: `token ${process.env.FORGEJO_TOKEN ?? ""}`,
    }),
  ]);

  const names = ["jellyfin", "sonarr", "radarr", "sabnzbd", "qbittorrent", "jellyseerr", "immich", "jellystat", "forgejo"];
  const services: Record<string, unknown> = {};
  results.forEach((r, i) => {
    services[names[i]] = r.status === "fulfilled" ? r.value : { env: "OK", status: `ERR: ${(r as PromiseRejectedResult).reason}` };
  });

  return NextResponse.json({
    tls_reject: process.env.NODE_TLS_REJECT_UNAUTHORIZED ?? "not set",
    services,
  });
}
