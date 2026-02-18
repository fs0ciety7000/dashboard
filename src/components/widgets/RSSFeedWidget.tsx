"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Rss, ExternalLink } from "lucide-react";
import { settings } from "@/config/settings";
import { cn } from "@/lib/utils";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export function RSSFeedWidget() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function fetchFeeds() {
      try {
        const res = await fetch("/api/rss");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchFeeds();
    const interval = setInterval(fetchFeeds, settings.refreshIntervals.rss);
    return () => clearInterval(interval);
  }, []);

  const filteredItems =
    activeTab === "all"
      ? items
      : items.filter((item) => item.source === activeTab);

  const displayItems = filteredItems.slice(0, 8);

  function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    return `${Math.floor(diffHr / 24)}d`;
  }

  return (
    <GlassCard className="h-full flex flex-col" noPadding>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Rss className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-semibold text-white">Feed</h3>
        </div>
        <span className="text-[10px] text-slate-600">{items.length} items</span>
      </div>

      {/* Feed source tabs */}
      <div className="flex gap-1 px-5 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "text-[10px] px-2 py-1 rounded-md transition-colors whitespace-nowrap",
            activeTab === "all"
              ? "bg-white/10 text-white"
              : "text-slate-500 hover:text-slate-300"
          )}
        >
          All
        </button>
        {settings.rssFeeds.map((feed) => (
          <button
            key={feed.name}
            onClick={() => setActiveTab(feed.name)}
            className={cn(
              "text-[10px] px-2 py-1 rounded-md transition-colors whitespace-nowrap",
              activeTab === feed.name
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            {feed.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="space-y-3 px-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-3 bg-white/5 rounded w-3/4" />
                <div className="h-2 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : displayItems.length > 0 ? (
          <div className="space-y-0.5">
            {displayItems.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group"
              >
                <DynamicIcon
                  name={
                    settings.rssFeeds.find((f) => f.name === item.source)
                      ?.icon || "Rss"
                  }
                  className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 group-hover:text-white transition-colors line-clamp-2 leading-relaxed">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-600">
                      {item.source}
                    </span>
                    <span className="text-[10px] text-slate-700">·</span>
                    <span className="text-[10px] text-slate-600">
                      {timeAgo(item.pubDate)}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-600">
            <Rss className="w-6 h-6 mb-2" />
            <p className="text-xs">No feed items available</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
