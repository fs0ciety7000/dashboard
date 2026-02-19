import { NextResponse } from "next/server";
import { settings } from "@/config/settings";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

async function parseFeed(
  feedUrl: string,
  sourceName: string
): Promise<FeedItem[]> {
  try {
    const res = await fetch(feedUrl, {
      next: { revalidate: 300 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; fs0ciety-dashboard/1.0)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });
    if (!res.ok) return [];

    const text = await res.text();
    const items: FeedItem[] = [];

    // Simple XML parsing for RSS/Atom feeds
    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;

    const matches = [
      ...text.matchAll(itemRegex),
      ...text.matchAll(entryRegex),
    ];

    for (const match of matches.slice(0, 10)) {
      const content = match[1];

      const titleMatch = content.match(
        /<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s
      );
      const linkMatch =
        content.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/s) ||
        content.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/s);
      const dateMatch =
        content.match(/<pubDate>(.*?)<\/pubDate>/s) ||
        content.match(/<published>(.*?)<\/published>/s) ||
        content.match(/<updated>(.*?)<\/updated>/s) ||
        content.match(/<dc:date>(.*?)<\/dc:date>/s);

      if (titleMatch) {
        items.push({
          title: titleMatch[1]
            .replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim(),
          link: linkMatch ? linkMatch[1].trim() : "",
          pubDate: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
          source: sourceName,
        });
      }
    }

    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  const allItems: FeedItem[] = [];

  const results = await Promise.allSettled(
    settings.rssFeeds.map((feed) => parseFeed(feed.url, feed.name))
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // Sort by date, newest first
  allItems.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return NextResponse.json({ items: allItems.slice(0, 30) });
}
