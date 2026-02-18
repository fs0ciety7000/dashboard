"use client";

import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { CalendarWidget } from "@/components/widgets/CalendarWidget";
import { RSSFeedWidget } from "@/components/widgets/RSSFeedWidget";
import { BookmarksWidget } from "@/components/widgets/BookmarksWidget";
import { ServiceStatusWidget } from "@/components/widgets/ServiceStatusWidget";
import { SystemOverviewWidget } from "@/components/widgets/SystemOverviewWidget";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <ClockWidget />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Weather */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <WeatherWidget />
        </div>

        {/* Service Status */}
        <div className="col-span-12 md:col-span-4 lg:col-span-5">
          <ServiceStatusWidget />
        </div>

        {/* System Overview */}
        <div className="col-span-12 md:col-span-4 lg:col-span-4">
          <SystemOverviewWidget />
        </div>

        {/* Bookmarks */}
        <div className="col-span-12 lg:col-span-5">
          <BookmarksWidget />
        </div>

        {/* Calendar */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <CalendarWidget />
        </div>

        {/* RSS Feed */}
        <div className="col-span-12 md:col-span-8 lg:col-span-4">
          <RSSFeedWidget />
        </div>
      </div>
    </motion.div>
  );
}
