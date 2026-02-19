import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.JELLYSTAT_URL?.replace(/\/+$/, "");
  const apiKey = process.env.JELLYSTAT_API_KEY;

  if (!url || !apiKey) {
    return NextResponse.json(null);
  }

  try {
    const headers: Record<string, string> = {
      "x-api-token": apiKey,
      "Content-Type": "application/json",
    };
    const opts: RequestInit = { headers, signal: AbortSignal.timeout(10000) };

    // Try library stats
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let statsData: any[] = [];
    const statsRes = await fetch(`${url}/api/getLibraryCardStats`, opts);
    if (statsRes.ok) {
      const body = await statsRes.json();
      statsData = Array.isArray(body) ? body : [];
    } else {
      console.error("Jellystat library stats error:", statsRes.status, await statsRes.text().catch(() => ""));
    }

    // Fetch most viewed movies
    let moviesData: any[] = [];
    const moviesRes = await fetch(`${url}/api/getMostViewedByType`, {
      ...opts,
      method: "POST",
      body: JSON.stringify({ type: "Movie", days: 30 }),
    });
    if (moviesRes.ok) {
      const body = await moviesRes.json();
      moviesData = Array.isArray(body) ? body : [];
    } else {
      console.error("Jellystat movies error:", moviesRes.status, await moviesRes.text().catch(() => ""));
    }

    // Fetch most viewed shows
    let showsData: any[] = [];
    const showsRes = await fetch(`${url}/api/getMostViewedByType`, {
      ...opts,
      method: "POST",
      body: JSON.stringify({ type: "Series", days: 30 }),
    });
    if (showsRes.ok) {
      const body = await showsRes.json();
      showsData = Array.isArray(body) ? body : [];
    } else {
      console.error("Jellystat shows error:", showsRes.status, await showsRes.text().catch(() => ""));
    }

    const libraries = statsData.map((lib) => ({
      name: (lib.Name ?? lib.name ?? lib.LibraryName ?? "Unknown") as string,
      count: (lib.Library_Count ?? lib.library_count ?? lib.Count ?? 0) as number,
      type: (lib.CollectionType ?? lib.collection_type ?? lib.Type ?? "unknown") as string,
    }));

    const topMovies = moviesData.slice(0, 5).map((m) => ({
      title: (m.Name ?? m.name ?? m.Title ?? "Unknown") as string,
      plays: (m.Total_Plays ?? m.total_plays ?? m.TotalPlays ?? m.Plays ?? 0) as number,
    }));

    const topShows = showsData.slice(0, 5).map((s) => ({
      title: (s.Name ?? s.name ?? s.Title ?? "Unknown") as string,
      plays: (s.Total_Plays ?? s.total_plays ?? s.TotalPlays ?? s.Plays ?? 0) as number,
    }));

    return NextResponse.json({ libraries, topMovies, topShows });
  } catch (error) {
    console.error("Jellystat API error:", error);
    return NextResponse.json(null);
  }
}
