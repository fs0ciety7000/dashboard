import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = process.env.JELLYFIN_URL?.replace(/\/+$/, "");
  const apiKey = process.env.JELLYFIN_API_KEY;
  const itemId = req.nextUrl.searchParams.get("id");
  const tag = req.nextUrl.searchParams.get("tag") || "";

  if (!url || !apiKey || !itemId) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const imageUrl = `${url}/Items/${itemId}/Images/Primary?maxHeight=120&tag=${tag}&quality=80`;
    const res = await fetch(imageUrl, {
      headers: { "X-Emby-Token": apiKey },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
