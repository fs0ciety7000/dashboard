"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getGreeting } from "@/lib/utils";

export function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-1">
      <p className="text-sm text-slate-500">{getGreeting()}</p>
      <div className="flex items-baseline gap-3">
        <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight font-mono">
          {format(time, "HH:mm")}
        </h2>
        <span className="text-lg font-mono text-slate-500">
          {format(time, "ss")}
        </span>
      </div>
      <p className="text-sm text-slate-400">
        {format(time, "EEEE, MMMM d, yyyy")}
      </p>
    </div>
  );
}
