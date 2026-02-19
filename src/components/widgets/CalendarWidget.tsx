"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  allDay: boolean;
}

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const today = new Date();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/calendar");
        if (res.ok) {
          setEvents(await res.json());
        }
      } catch {
        // Silently fail
      }
    }
    fetchEvents();
    const interval = setInterval(fetchEvents, 600000); // 10 min
    return () => clearInterval(interval);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

  // Build set of days that have events this month
  const eventDays = new Set<number>();
  events.forEach((e) => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    // Mark all days the event spans
    const d = new Date(start);
    while (d <= end) {
      if (d.getMonth() === month && d.getFullYear() === year) {
        eventDays.add(d.getDate());
      }
      d.setDate(d.getDate() + 1);
    }
  });

  const days: { day: number; current: boolean; isToday: boolean; hasEvent: boolean }[] = [];

  // Previous month days
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      current: false,
      isToday: false,
      hasEvent: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      current: true,
      isToday:
        i === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear(),
      hasEvent: eventDays.has(i),
    });
  }

  // Next month days to fill the grid
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, current: false, isToday: false, hasEvent: false });
  }

  // Upcoming events (next 7 days)
  const upcoming = events.filter((e) => {
    const start = new Date(e.start);
    const diff = start.getTime() - today.getTime();
    return diff >= -86400000 && diff < 7 * 86400000;
  }).slice(0, 3);

  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{monthName}</h3>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-1 rounded-md hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded-md hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div key={d} className="text-[10px] font-medium text-slate-600 py-1">
            {d}
          </div>
        ))}
        {days.map((d, i) => (
          <div
            key={i}
            className={cn(
              "text-xs py-1.5 rounded-md transition-colors relative",
              d.current ? "text-slate-300" : "text-slate-600",
              d.isToday &&
                "bg-cyan-400/20 text-cyan-400 font-bold ring-1 ring-cyan-400/30"
            )}
          >
            {d.day}
            {d.hasEvent && !d.isToday && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" />
            )}
            {d.hasEvent && d.isToday && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
            )}
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarDays className="w-3 h-3 text-violet-400" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Upcoming</span>
          </div>
          {upcoming.map((e, i) => {
            const start = new Date(e.start);
            const dayStr = start.toLocaleDateString("en", { weekday: "short", day: "numeric" });
            const timeStr = e.allDay ? "All day" : start.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
            return (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 truncate">{e.title}</span>
                <span className="text-[10px] text-slate-600 flex-shrink-0 ml-2">
                  {dayStr} {timeStr}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
