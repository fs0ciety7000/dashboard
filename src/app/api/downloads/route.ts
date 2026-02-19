import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

interface DownloadItem {
  id: string | number;
  name: string;
  size: number;
  downloaded: number;
  speed: number;
  eta: string;
  status: "downloading" | "completed" | "paused" | "queued";
  source: string;
}

async function fetchSabnzbd(): Promise<DownloadItem[]> {
  const url = process.env.SABNZBD_URL?.replace(/\/+$/, "");
  const apiKey = process.env.SABNZBD_API_KEY;
  if (!url || !apiKey) return [];

  try {
    const res = await fetch(
      `${url}/api?mode=queue&output=json&apikey=${apiKey}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const queue = data.queue ?? {};

    const items: DownloadItem[] = (queue.slots ?? []).map(
      (slot: Record<string, unknown>) => {
        const mb = parseFloat((slot.mb as string) ?? "0");
        const mbLeft = parseFloat((slot.mbleft as string) ?? "0");
        const size = mb * 1_000_000;
        const downloaded = (mb - mbLeft) * 1_000_000;

        let status: DownloadItem["status"] = "downloading";
        if (slot.status === "Paused") status = "paused";
        else if (slot.status === "Queued") status = "queued";

        return {
          id: slot.nzo_id ?? String(Math.random()),
          name: (slot.filename as string) ?? "Unknown",
          size,
          downloaded,
          speed: parseFloat((queue.kbpersec as string) ?? "0") * 1000,
          eta: (slot.timeleft as string) ?? "—",
          status,
          source: "sabnzbd",
        };
      }
    );

    // Also fetch history for recent completions
    const histRes = await fetch(
      `${url}/api?mode=history&output=json&limit=3&apikey=${apiKey}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (histRes.ok) {
      const histData = await histRes.json();
      const slots = histData.history?.slots ?? [];
      for (const slot of slots) {
        if (slot.status === "Completed") {
          items.push({
            id: slot.nzo_id ?? String(Math.random()),
            name: (slot.name as string) ?? "Unknown",
            size: (slot.bytes as number) ?? 0,
            downloaded: (slot.bytes as number) ?? 0,
            speed: 0,
            eta: "0s",
            status: "completed",
            source: "sabnzbd",
          });
        }
      }
    }

    return items;
  } catch (error) {
    console.error("SABnzbd error:", error);
    return [];
  }
}

async function fetchQbittorrent(): Promise<DownloadItem[]> {
  const url = process.env.QBITTORRENT_URL?.replace(/\/+$/, "");
  const username = process.env.QBITTORRENT_USERNAME;
  const password = process.env.QBITTORRENT_PASSWORD;
  if (!url) return [];

  try {
    // Authenticate
    let cookie = "";
    if (username && password) {
      const loginRes = await fetch(`${url}/api/v2/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
        signal: AbortSignal.timeout(10000),
      });
      cookie = loginRes.headers.get("set-cookie") ?? "";
    }

    const headers: Record<string, string> = {};
    if (cookie) headers["Cookie"] = cookie;

    const res = await fetch(
      `${url}/api/v2/torrents/info?filter=all&limit=5&sort=added_on&reverse=true`,
      { headers, signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const torrents = await res.json();

    return (torrents as Record<string, unknown>[]).map((t) => {
      let status: DownloadItem["status"] = "downloading";
      const state = t.state as string;
      if (["pausedDL", "pausedUP", "stoppedDL", "stoppedUP"].includes(state)) status = "paused";
      else if (["uploading", "stalledUP", "forcedUP", "completedUP"].includes(state) || (t.progress as number) >= 1) status = "completed";
      else if (["queuedDL", "queuedUP", "checkingDL", "checkingUP", "allocating", "metaDL"].includes(state)) status = "queued";

      const eta = (t.eta as number) ?? 0;
      let etaStr = "—";
      if (eta > 0 && eta < 8640000) {
        const h = Math.floor(eta / 3600);
        const m = Math.floor((eta % 3600) / 60);
        const s = eta % 60;
        etaStr = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
      }

      return {
        id: (t.hash as string) ?? String(Math.random()),
        name: (t.name as string) ?? "Unknown",
        size: (t.total_size as number) ?? 0,
        downloaded: (t.downloaded as number) ?? 0,
        speed: (t.dlspeed as number) ?? 0,
        eta: etaStr,
        status,
        source: "qbittorrent",
      };
    });
  } catch (error) {
    console.error("qBittorrent error:", error);
    return [];
  }
}

export async function GET() {
  const [sab, qbt] = await Promise.allSettled([
    fetchSabnzbd(),
    fetchQbittorrent(),
  ]);

  const items = [
    ...(sab.status === "fulfilled" ? sab.value : []),
    ...(qbt.status === "fulfilled" ? qbt.value : []),
  ];

  // Sort: downloading first, then queued, paused, completed
  const order = { downloading: 0, queued: 1, paused: 2, completed: 3 };
  items.sort((a, b) => (order[a.status] ?? 4) - (order[b.status] ?? 4));

  return NextResponse.json(items);
}
