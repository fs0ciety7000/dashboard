import { NextResponse } from "next/server";

interface JellyseerrRequest {
  id: number;
  type: string;
  status: number;
  createdAt: string;
  media: {
    tmdbId?: number;
    tvdbId?: number;
    mediaType?: string;
    status?: number;
  };
  requestedBy: {
    displayName?: string;
    username?: string;
    plexUsername?: string;
    email?: string;
  };
}

async function fetchTitle(
  baseUrl: string,
  headers: Record<string, string>,
  type: string,
  tmdbId: number
): Promise<string> {
  try {
    const endpoint = type === "movie" ? "movie" : "tv";
    const res = await fetch(`${baseUrl}/api/v1/${endpoint}/${tmdbId}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      return (data.title as string) || (data.name as string) || "Unknown";
    }
  } catch {
    // Fallback
  }
  return "Unknown";
}

export async function GET() {
  const url = process.env.JELLYSEERR_URL?.replace(/\/+$/, "");
  const apiKey = process.env.JELLYSEERR_API_KEY;

  if (!url || !apiKey) {
    return NextResponse.json([]);
  }

  try {
    const headers = { "X-Api-Key": apiKey };
    const res = await fetch(
      `${url}/api/v1/request?take=10&sort=added&sortDirection=desc`,
      { headers, signal: AbortSignal.timeout(10000) }
    );

    if (!res.ok) {
      console.error("Jellyseerr HTTP error:", res.status);
      return NextResponse.json([]);
    }

    const data = await res.json();
    const requests = (data.results ?? []) as JellyseerrRequest[];

    // Fetch titles in parallel for all requests that have tmdbId
    const results = await Promise.all(
      requests.map(async (req) => {
        const tmdbId = req.media?.tmdbId;
        const type = req.type === "movie" ? "movie" : "tv";

        let title = "Unknown";
        if (tmdbId) {
          title = await fetchTitle(url, headers, type, tmdbId);
        }

        // Map status
        let status = "pending";
        const mediaStatus = req.media?.status;
        if (mediaStatus === 5) status = "available";
        else if (mediaStatus === 4) status = "processing";
        else if (mediaStatus === 3) status = "declined";
        else if (req.status === 2) status = "approved";

        // Format date
        let date = "";
        if (req.createdAt) {
          const d = new Date(req.createdAt);
          const now = new Date();
          const diffMs = now.getTime() - d.getTime();
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          if (diffHours < 1) date = "Just now";
          else if (diffHours < 24) date = `${diffHours}h ago`;
          else if (diffDays === 1) date = "1 day ago";
          else date = `${diffDays} days ago`;
        }

        // User
        const user = req.requestedBy;
        const requestedBy =
          user?.displayName ||
          user?.username ||
          user?.plexUsername ||
          user?.email ||
          "Unknown";

        return {
          id: req.id,
          title,
          type,
          status,
          requestedBy,
          date,
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Jellyseerr error:", error);
    return NextResponse.json([]);
  }
}
