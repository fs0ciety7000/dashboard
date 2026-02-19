import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.JELLYFIN_URL?.replace(/\/+$/, "");
  const apiKey = process.env.JELLYFIN_API_KEY;

  if (!url || !apiKey) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const headers = { "X-Emby-Token": apiKey };
    const opts: RequestInit = { headers, signal: AbortSignal.timeout(10000) };

    // Get a userId first
    const usersRes = await fetch(`${url}/Users`, opts);
    if (!usersRes.ok) {
      console.error("Jellyfin Users error:", usersRes.status);
      return NextResponse.json([], { status: 200 });
    }
    const users = await usersRes.json();
    const userId = users?.[0]?.Id;

    // Get virtual folders (libraries)
    const libRes = await fetch(`${url}/Library/VirtualFolders`, opts);
    const libraries = libRes.ok ? await libRes.json() : [];

    const stats: { label: string; count: number; type: string }[] = [];

    // Get item counts - try with userId first
    const countUrl = userId ? `${url}/Items/Counts?userId=${userId}` : `${url}/Items/Counts`;
    const countRes = await fetch(countUrl, opts);
    if (countRes.ok) {
      const counts = await countRes.json();
      if (counts.MovieCount) stats.push({ label: "Movies", count: counts.MovieCount, type: "movie" });
      if (counts.SeriesCount) stats.push({ label: "TV Shows", count: counts.SeriesCount, type: "tv" });
      if (counts.SongCount) stats.push({ label: "Music", count: counts.SongCount, type: "music" });
      if (counts.BookCount) stats.push({ label: "Books", count: counts.BookCount, type: "book" });
      if (counts.EpisodeCount) stats.push({ label: "Episodes", count: counts.EpisodeCount, type: "episode" });
    }

    // Check for photos library
    for (const lib of libraries) {
      if (lib.CollectionType === "homevideos" || lib.CollectionType === "photos") {
        try {
          const photoRes = await fetch(
            `${url}/Items?ParentId=${lib.ItemId}&Recursive=true&IncludeItemTypes=Photo&Limit=0`,
            opts
          );
          if (photoRes.ok) {
            const photoData = await photoRes.json();
            if (photoData.TotalRecordCount > 0) {
              stats.push({ label: "Photos", count: photoData.TotalRecordCount, type: "photo" });
            }
          }
        } catch {
          // Skip this library
        }
      }
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Jellyfin library error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
