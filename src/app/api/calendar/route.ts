import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  allDay: boolean;
}

function parseICalDate(value: string): { date: Date; allDay: boolean } {
  // DATE only: YYYYMMDD
  if (value.length === 8) {
    const y = parseInt(value.slice(0, 4));
    const m = parseInt(value.slice(4, 6)) - 1;
    const d = parseInt(value.slice(6, 8));
    return { date: new Date(y, m, d), allDay: true };
  }
  // DATE-TIME: YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
  const y = parseInt(value.slice(0, 4));
  const m = parseInt(value.slice(4, 6)) - 1;
  const d = parseInt(value.slice(6, 8));
  const h = parseInt(value.slice(9, 11)) || 0;
  const min = parseInt(value.slice(11, 13)) || 0;
  const s = parseInt(value.slice(13, 15)) || 0;
  if (value.endsWith("Z")) {
    return { date: new Date(Date.UTC(y, m, d, h, min, s)), allDay: false };
  }
  return { date: new Date(y, m, d, h, min, s), allDay: false };
}

function parseICal(ical: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines: string[] = [];

  // Unfold lines (RFC 5545: lines starting with space/tab are continuation)
  for (const raw of ical.split(/\r?\n/)) {
    if (raw.startsWith(" ") || raw.startsWith("\t")) {
      if (lines.length > 0) {
        lines[lines.length - 1] += raw.slice(1);
      }
    } else {
      lines.push(raw);
    }
  }

  let inEvent = false;
  let title = "";
  let dtstart = "";
  let dtend = "";

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      title = "";
      dtstart = "";
      dtend = "";
    } else if (line === "END:VEVENT" && inEvent) {
      inEvent = false;
      if (dtstart) {
        const start = parseICalDate(dtstart);
        const end = dtend ? parseICalDate(dtend) : start;
        events.push({
          title: title || "No title",
          start: start.date.toISOString(),
          end: end.date.toISOString(),
          allDay: start.allDay,
        });
      }
    } else if (inEvent) {
      // Handle properties like DTSTART;VALUE=DATE:20260219 or DTSTART:20260219T100000Z
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).split(";")[0];
      const value = line.slice(colonIdx + 1);

      if (key === "SUMMARY") title = value;
      else if (key === "DTSTART") dtstart = value;
      else if (key === "DTEND") dtend = value;
    }
  }

  // Filter to events in the next 30 days and sort
  const now = new Date();
  const cutoff = new Date(now.getTime() + 30 * 86400000);
  const past = new Date(now.getTime() - 86400000); // include today

  return events
    .filter((e) => {
      const end = new Date(e.end);
      const start = new Date(e.start);
      return end >= past && start <= cutoff;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export async function GET() {
  const calUrls = process.env.GOOGLE_CALENDAR_URL;
  if (!calUrls) {
    return NextResponse.json([]);
  }

  // Support multiple calendar URLs separated by semicolons
  const urls = calUrls.split(";").map((u) => u.trim()).filter(Boolean);
  const allEvents: CalendarEvent[] = [];

  for (const calUrl of urls) {
    try {
      const res = await fetch(calUrl, {
        signal: AbortSignal.timeout(10000),
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; fs0ciety-dashboard/1.0)",
          Accept: "text/calendar, text/plain, */*",
        },
      });

      if (!res.ok) {
        console.error(`Calendar fetch error for ${calUrl}: ${res.status} ${res.statusText}`);
        continue;
      }

      const ical = await res.text();
      if (!ical.includes("BEGIN:VCALENDAR")) {
        console.error(`Calendar URL did not return iCal data: ${calUrl} (got ${ical.slice(0, 100)})`);
        continue;
      }

      allEvents.push(...parseICal(ical));
    } catch (error) {
      console.error(`Calendar API error for ${calUrl}:`, error);
    }
  }

  // Sort combined events
  allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return NextResponse.json(allEvents.slice(0, 20));
}
