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
    const opts: RequestInit = { headers, signal: AbortSignal.timeout(10000) };

    // First get a userId
    const usersRes = await fetch(`${url}/Users`, opts);
    if (!usersRes.ok) {
      console.error("Jellyfin Users error:", usersRes.status);
      return NextResponse.json([]);
    }
    const users = await usersRes.json();
    const userId = users?.[0]?.Id;
    if (!userId) {
      console.error("Jellyfin: no users found");
      return NextResponse.json([]);
    }

    // Use /Items with SortBy=DateCreated for reliable metadata on actual files
    const res = await fetch(
      `${url}/Users/${userId}/Items?SortBy=DateCreated&SortOrder=Descending&Limit=12&Recursive=true&IncludeItemTypes=Movie,Episode,Audio&Fields=MediaSources,MediaStreams,DateCreated`,
      opts
    );

    if (!res.ok) {
      console.error("Jellyfin recent error:", res.status);
      return NextResponse.json([]);
    }

    const body = await res.json();
    const items = body.Items ?? body ?? [];

    const recent = (Array.isArray(items) ? items : []).map(
      (item: Record<string, unknown>) => {
        const type =
          item.Type === "Movie"
            ? "movie"
            : item.Type === "Episode"
              ? "tv"
              : item.Type === "Audio"
                ? "music"
                : "movie";

        // Build title
        let title = (item.Name as string) || "Unknown";
        if (item.Type === "Episode" && item.SeriesName) {
          const s_num = item.ParentIndexNumber ?? "";
          const e_num = item.IndexNumber ?? "";
          title = `${item.SeriesName} S${String(s_num).padStart(2, "0")}E${String(e_num).padStart(2, "0")}`;
        }

        // Get quality from media streams
        const mediaSources = (item.MediaSources as Record<string, unknown>[]) ?? [];
        let quality = "";
        let size = 0;

        if (mediaSources.length > 0) {
          const source = mediaSources[0];
          size = (source.Size as number) ?? 0;

          const streams = (source.MediaStreams as Record<string, unknown>[]) ?? [];
          const video = streams.find((s) => s.Type === "Video");
          if (video) {
            const height = video.Height as number;
            if (height >= 2160) quality = "4K";
            else if (height >= 1080) quality = "1080p";
            else if (height >= 720) quality = "720p";
            else if (height > 0) quality = `${height}p`;

            const range = (video.VideoRange as string) ?? "";
            if (range && range !== "SDR") quality += ` ${range}`;
          } else if (type === "music") {
            const audio = streams.find((s) => s.Type === "Audio");
            if (audio) {
              const codec = ((audio.Codec as string) ?? "").toUpperCase();
              quality = codec === "FLAC" ? "FLAC" : codec;
            }
          }
        }

        // Format date
        const dateCreated = item.DateCreated as string;
        let addedDate = "";
        if (dateCreated) {
          const d = new Date(dateCreated);
          const now = new Date();
          const diffMs = now.getTime() - d.getTime();
          const diffDays = Math.floor(diffMs / 86400000);
          if (diffDays === 0) addedDate = "Today";
          else if (diffDays === 1) addedDate = "Yesterday";
          else addedDate = `${diffDays} days ago`;
        }

        // Build poster URL - use series image for episodes
        const imageItemId = item.SeriesId || item.Id;
        const imageTags = item.ImageTags as Record<string, string> | undefined;
        const imageTag = (item.SeriesPrimaryImageTag as string) || imageTags?.Primary || null;
        const poster = imageTag
          ? `/api/jellyfin/image?id=${imageItemId}&tag=${imageTag}`
          : null;

        return {
          id: item.Id,
          title,
          type,
          addedDate,
          quality,
          size,
          poster,
        };
      }
    );

    return NextResponse.json(recent);
  } catch (error) {
    console.error("Jellyfin recent error:", error);
    return NextResponse.json([]);
  }
}
