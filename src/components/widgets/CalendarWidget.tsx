"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

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

  const days: { day: number; current: boolean; isToday: boolean }[] = [];

  // Previous month days
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      current: false,
      isToday: false,
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
    });
  }

  // Next month days to fill the grid
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, current: false, isToday: false });
  }

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
              "text-xs py-1.5 rounded-md transition-colors",
              d.current ? "text-slate-300" : "text-slate-600",
              d.isToday &&
                "bg-cyan-400/20 text-cyan-400 font-bold ring-1 ring-cyan-400/30"
            )}
          >
            {d.day}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
