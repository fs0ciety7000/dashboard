import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.JELLYFIN_URL?.replace(/\/+$/, "");
  const apiKey = process.env.JELLYFIN_API_KEY;

  if (!url || !apiKey) {
    return NextResponse.json([]);
  }

  try {
    const headers = { "X-Emby-Token": apiKey };
    const res = await fetch(`${url}/Sessions`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const sessions = await res.json();

    // Filter to only sessions with active playback
    const playing = sessions
      .filter((s: Record<string, unknown>) => s.NowPlayingItem)
      .map((s: Record<string, unknown>) => {
        const item = s.NowPlayingItem as Record<string, unknown>;
        const playState = s.PlayState as Record<string, unknown> | undefined;
        const ticks = (playState?.PositionTicks as number) ?? 0;
        const totalTicks = (item.RunTimeTicks as number) ?? 1;
        const progress = totalTicks > 0 ? Math.round((ticks / totalTicks) * 100) : 0;

        const transcodingInfo = s.TranscodingInfo as Record<string, unknown> | undefined;
        const isTranscoding = !!transcodingInfo;

        // Build quality string
        const mediaStreams = (item.MediaStreams as Record<string, unknown>[]) ?? [];
        const videoStream = mediaStreams.find((ms) => ms.Type === "Video");
        let quality = "Unknown";
        if (videoStream) {
          const height = videoStream.Height as number;
          if (height >= 2160) quality = "4K";
          else if (height >= 1080) quality = "1080p";
          else if (height >= 720) quality = "720p";
          else quality = `${height}p`;

          const videoRange = (videoStream.VideoRange as string) ?? "";
          if (videoRange && videoRange !== "SDR") {
            quality += ` ${videoRange}`;
          }
        }

        let title = (item.SeriesName as string) || (item.Name as string) || "Unknown";
        let episode: string | null = null;
        if (item.SeriesName) {
          const s_num = item.ParentIndexNumber ?? "";
          const e_num = item.IndexNumber ?? "";
          episode = `S${String(s_num).padStart(2, "0")}E${String(e_num).padStart(2, "0")}`;
          if (item.Name) episode += ` - ${item.Name}`;
        }

        return {
          id: s.Id,
          user: (s.UserName as string) || "Unknown",
          title,
          episode,
          type: item.SeriesName ? "Series" : "Movie",
          progress,
          state: (playState?.IsPaused as boolean) ? "paused" : "playing",
          transcoding: isTranscoding,
          device: (s.DeviceName as string) || "Unknown",
          quality,
        };
      });

    return NextResponse.json(playing);
  } catch (error) {
    console.error("Jellyfin sessions error:", error);
    return NextResponse.json([]);
  }
}
