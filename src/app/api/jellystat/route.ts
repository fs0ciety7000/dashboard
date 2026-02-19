import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.JELLYSTAT_URL?.replace(/\/+$/, "");
  const apiKey = process.env.JELLYSTAT_API_KEY;

  if (!url || !apiKey) {
    return NextResponse.json(null);
  }

  try {
    const headers = {
      "x-api-token": apiKey,
      "Content-Type": "application/json",
    };
    const opts: RequestInit = { headers, signal: AbortSignal.timeout(10000) };

    const [statsRes, watchedMoviesRes, watchedShowsRes] =
      await Promise.allSettled([
        fetch(`${url}/api/getLibraryCardStats`, opts),
        fetch(`${url}/api/getMostViewedByType`, {
          ...opts,
          method: "POST",
          body: JSON.stringify({ type: "Movie", days: 30 }),
        }),
        fetch(`${url}/api/getMostViewedByType`, {
          ...opts,
          method: "POST",
          body: JSON.stringify({ type: "Series", days: 30 }),
        }),
      ]);

    const libraries: { name: string; count: number; type: string }[] = [];
    if (statsRes.status === "fulfilled" && statsRes.value.ok) {
      const stats = await statsRes.value.json();
      if (Array.isArray(stats)) {
        for (const lib of stats) {
          libraries.push({
            name: lib.Name ?? lib.name ?? "Unknown",
            count: lib.Library_Count ?? lib.library_count ?? 0,
            type: lib.CollectionType ?? lib.collection_type ?? "unknown",
          });
        }
      }
    }

    const topMovies: { title: string; plays: number }[] = [];
    if (watchedMoviesRes.status === "fulfilled" && watchedMoviesRes.value.ok) {
      const movies = await watchedMoviesRes.value.json();
      if (Array.isArray(movies)) {
        for (const m of movies.slice(0, 5)) {
          topMovies.push({
            title: m.Name ?? m.name ?? "Unknown",
            plays: m.Total_Plays ?? m.total_plays ?? 0,
          });
        }
      }
    }

    const topShows: { title: string; plays: number }[] = [];
    if (watchedShowsRes.status === "fulfilled" && watchedShowsRes.value.ok) {
      const shows = await watchedShowsRes.value.json();
      if (Array.isArray(shows)) {
        for (const s of shows.slice(0, 5)) {
          topShows.push({
            title: s.Name ?? s.name ?? "Unknown",
            plays: s.Total_Plays ?? s.total_plays ?? 0,
          });
        }
      }
    }

    return NextResponse.json({ libraries, topMovies, topShows });
  } catch (error) {
    console.error("Jellystat API error:", error);
    return NextResponse.json(null);
  }
}
