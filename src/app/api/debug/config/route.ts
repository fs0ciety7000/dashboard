import { NextResponse } from "next/server";

export async function GET() {
  const check = (name: string) => {
    const val = process.env[name];
    if (!val) return "MISSING";
    if (val.length < 5) return "EMPTY";
    return "OK";
  };

  return NextResponse.json({
    tls_reject: process.env.NODE_TLS_REJECT_UNAUTHORIZED ?? "not set",
    services: {
      jellyfin: { url: check("JELLYFIN_URL"), apiKey: check("JELLYFIN_API_KEY") },
      sonarr: { url: check("SONARR_URL"), apiKey: check("SONARR_API_KEY") },
      radarr: { url: check("RADARR_URL"), apiKey: check("RADARR_API_KEY") },
      lidarr: { url: check("LIDARR_URL"), apiKey: check("LIDARR_API_KEY") },
      sabnzbd: { url: check("SABNZBD_URL"), apiKey: check("SABNZBD_API_KEY") },
      qbittorrent: { url: check("QBITTORRENT_URL"), username: check("QBITTORRENT_USERNAME"), password: check("QBITTORRENT_PASSWORD") },
      jellyseerr: { url: check("JELLYSEERR_URL"), apiKey: check("JELLYSEERR_API_KEY") },
      immich: { url: check("IMMICH_URL"), apiKey: check("IMMICH_API_KEY") },
      jellystat: { url: check("JELLYSTAT_URL"), apiKey: check("JELLYSTAT_API_KEY") },
      forgejo: { url: check("FORGEJO_URL"), token: check("FORGEJO_TOKEN") },
    },
  });
}
