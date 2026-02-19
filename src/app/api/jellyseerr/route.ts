import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.JELLYSEERR_URL?.replace(/\/+$/, "");
  const apiKey = process.env.JELLYSEERR_API_KEY;

  if (!url || !apiKey) {
    return NextResponse.json([]);
  }

  try {
    const headers = { "X-Api-Key": apiKey };
    const res = await fetch(`${url}/api/v1/request?take=10&sort=added&sortDirection=desc`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    const results = (data.results ?? []).map(
      (req: Record<string, unknown>) => {
        const media = req.media as Record<string, unknown> | undefined;
        const user = req.requestedBy as Record<string, unknown> | undefined;

        // Map Jellyseerr status to our status
        let status = "pending";
        const mediaStatus = media?.status as number;
        if (mediaStatus === 5) status = "available";
        else if (mediaStatus === 4) status = "processing";
        else if (mediaStatus === 3) status = "declined";
        else if (req.status === 2) status = "approved";

        // Format date
        const createdAt = req.createdAt as string;
        let date = "";
        if (createdAt) {
          const d = new Date(createdAt);
          const now = new Date();
          const diffMs = now.getTime() - d.getTime();
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          if (diffHours < 1) date = "Just now";
          else if (diffHours < 24) date = `${diffHours} hours ago`;
          else if (diffDays === 1) date = "1 day ago";
          else date = `${diffDays} days ago`;
        }

        return {
          id: req.id,
          title: (media?.title as string) || (media?.name as string) || "Unknown",
          type: req.type === "movie" ? "movie" : "tv",
          status,
          requestedBy: (user?.displayName as string) || (user?.email as string) || "Unknown",
          date,
        };
      }
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Jellyseerr error:", error);
    return NextResponse.json([]);
  }
}
