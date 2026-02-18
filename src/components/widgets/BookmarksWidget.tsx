"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { settings } from "@/config/settings";
import { ExternalLink } from "lucide-react";

export function BookmarksWidget() {
  return (
    <GlassCard className="h-full">
      <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4">
        Quick Links
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {settings.bookmarks.map((bookmark) => (
          <a
            key={bookmark.name}
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${bookmark.color}20` }}
            >
              <DynamicIcon
                name={bookmark.icon}
                className="w-4 h-4"
                style={{ color: bookmark.color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors truncate">
                {bookmark.name}
              </p>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
          </a>
        ))}
      </div>
    </GlassCard>
  );
}
