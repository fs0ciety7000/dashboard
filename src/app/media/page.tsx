"use client";

import { NowPlayingWidget } from "@/components/widgets/NowPlayingWidget";
import { DownloadWidget } from "@/components/widgets/DownloadWidget";
import { MediaStatsWidget } from "@/components/widgets/MediaStatsWidget";
import { MediaRequestsWidget } from "@/components/widgets/MediaRequestsWidget";
import { RecentlyAddedWidget } from "@/components/widgets/RecentlyAddedWidget";
import { ArrStatsWidget } from "@/components/widgets/ArrStatsWidget";
import { JellystatWidget } from "@/components/widgets/JellystatWidget";
import { motion } from "framer-motion";

export default function MediaPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Media</h1>
        <p className="text-sm text-slate-500 mt-1">
          Streaming, downloads, requests & library stats
        </p>
      </div>

      {/* Top row: Now Playing + Downloads */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <NowPlayingWidget />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <DownloadWidget />
        </div>
      </div>

      {/* Middle row: Library stats + Arr stats */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <MediaStatsWidget />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <ArrStatsWidget />
        </div>
      </div>

      {/* Bottom row: Requests + Recently Added */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <MediaRequestsWidget />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <RecentlyAddedWidget />
        </div>
      </div>

      {/* Jellystat */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12">
          <JellystatWidget />
        </div>
      </div>
    </motion.div>
  );
}
