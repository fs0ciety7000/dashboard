import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {};

  // ── Beszel Debug ──
  try {
    const url = process.env.BESZEL_URL?.replace(/\/+$/, "");
    const email = process.env.BESZEL_EMAIL;
    const password = process.env.BESZEL_PASSWORD;
    results.beszel_env = {
      url: url ?? "MISSING",
      email: email ? `${email.slice(0, 4)}...` : "MISSING",
      password: password ? "SET" : "MISSING",
    };

    if (url && email && password) {
      // Try health first
      try {
        const healthRes = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(5000) });
        results.beszel_health = { status: healthRes.status, body: await healthRes.text().catch(() => "") };
      } catch (e) { results.beszel_health = { error: String(e) }; }

      // Try users auth
      try {
        const authRes = await fetch(`${url}/api/collections/users/auth-with-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identity: email, password }),
          signal: AbortSignal.timeout(5000),
        });
        const authBody = await authRes.text();
        results.beszel_users_auth = { status: authRes.status, body: authBody.slice(0, 300) };
      } catch (e) { results.beszel_users_auth = { error: String(e) }; }

      // Try superusers auth
      try {
        const authRes = await fetch(`${url}/api/collections/_superusers/auth-with-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identity: email, password }),
          signal: AbortSignal.timeout(5000),
        });
        const authBody = await authRes.text();
        results.beszel_superusers_auth = { status: authRes.status, body: authBody.slice(0, 300) };
      } catch (e) { results.beszel_superusers_auth = { error: String(e) }; }
    }
  } catch (e) { results.beszel = { error: String(e) }; }

  // ── Arr Diskspace Debug ──
  try {
    const sonarrUrl = process.env.SONARR_URL?.replace(/\/+$/, "");
    const sonarrKey = process.env.SONARR_API_KEY;
    if (sonarrUrl && sonarrKey) {
      const diskRes = await fetch(`${sonarrUrl}/api/v3/diskspace`, {
        headers: { "X-Api-Key": sonarrKey },
        signal: AbortSignal.timeout(8000),
      });
      const text = await diskRes.text();
      results.sonarr_diskspace = {
        status: diskRes.status,
        bodyPreview: text.slice(0, 500),
      };
    }
  } catch (e) { results.sonarr_diskspace = { error: String(e) }; }

  // ── Jellyfin Recent Debug ──
  try {
    const url = process.env.JELLYFIN_URL?.replace(/\/+$/, "");
    const apiKey = process.env.JELLYFIN_API_KEY;
    if (url && apiKey) {
      const headers = { "X-Emby-Token": apiKey };
      const usersRes = await fetch(`${url}/Users`, { headers, signal: AbortSignal.timeout(5000) });
      const users = await usersRes.json();
      const userId = users?.[0]?.Id;

      if (userId) {
        const res = await fetch(
          `${url}/Users/${userId}/Items?SortBy=DateCreated&SortOrder=Descending&Limit=3&Recursive=true&IncludeItemTypes=Movie,Episode,Audio&Fields=MediaSources,MediaStreams,DateCreated`,
          { headers, signal: AbortSignal.timeout(8000) }
        );
        const body = await res.json();
        const items = body.Items ?? body ?? [];
        results.jellyfin_recent = (items as Record<string, unknown>[]).slice(0, 3).map(
          (item: Record<string, unknown>) => ({
            Type: item.Type,
            Name: item.Name,
            SeriesName: item.SeriesName,
            Id: item.Id,
            hasMediaSources: !!item.MediaSources && (item.MediaSources as unknown[]).length > 0,
            hasImageTags: !!item.ImageTags,
            ImageTags: item.ImageTags,
          })
        );
      }
    }
  } catch (e) { results.jellyfin_recent = { error: String(e) }; }

  // ── Calendar Debug ──
  try {
    const calUrls = process.env.GOOGLE_CALENDAR_URL;
    results.calendar_env = calUrls ? `SET (${calUrls.length} chars)` : "MISSING";
    if (calUrls) {
      const urls = calUrls.split(";").map((u) => u.trim()).filter(Boolean);
      for (const calUrl of urls) {
        const res = await fetch(calUrl, {
          signal: AbortSignal.timeout(10000),
          redirect: "follow",
          headers: { "User-Agent": "Mozilla/5.0 (compatible; fs0ciety-dashboard/1.0)", Accept: "text/calendar, text/plain, */*" },
        });
        const text = await res.text();
        const hasVCalendar = text.includes("BEGIN:VCALENDAR");
        const eventCount = (text.match(/BEGIN:VEVENT/g) || []).length;
        // Check for Busy titles
        const summaries = [...text.matchAll(/SUMMARY:(.*)/g)].slice(0, 5).map(m => m[1]);
        results[`calendar_${urls.indexOf(calUrl)}`] = {
          status: res.status,
          isIcal: hasVCalendar,
          eventCount,
          bodyLength: text.length,
          sampleSummaries: summaries,
          bodyPreview: text.slice(0, 300),
        };
      }
    }
  } catch (e) { results.calendar = { error: String(e) }; }

  return NextResponse.json(results, { status: 200 });
}
