"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { getWeatherIcon } from "@/lib/utils";
import { settings } from "@/config/settings";
import {
  Droplets,
  Wind,
  Eye,
  Thermometer,
} from "lucide-react";

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  daily: {
    maxTemp: number;
    minTemp: number;
    weatherCodes: number[];
    dates: string[];
  };
}

const weatherDescriptions: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight showers",
  81: "Moderate showers",
  82: "Violent showers",
  95: "Thunderstorm",
  96: "Thunderstorm w/ hail",
  99: "Severe thunderstorm",
};

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("/api/weather");
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
        }
      } catch {
        // Silently fail - will show skeleton
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, settings.refreshIntervals.weather);
    return () => clearInterval(interval);
  }, []);

  if (loading || !weather) {
    return (
      <GlassCard className="h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-20 bg-white/5 rounded" />
          <div className="h-12 w-32 bg-white/5 rounded" />
          <div className="h-3 w-24 bg-white/5 rounded" />
        </div>
      </GlassCard>
    );
  }

  const iconName = getWeatherIcon(weather.weatherCode);
  const description =
    weatherDescriptions[weather.weatherCode] || "Unknown";

  return (
    <GlassCard className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            Weather
          </p>
          <p className="text-sm text-slate-400">{settings.weather.city}</p>
        </div>
        <DynamicIcon name={iconName} className="w-8 h-8 text-amber-400" />
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white font-mono">
            {Math.round(weather.temperature)}
          </span>
          <span className="text-lg text-slate-500">°C</span>
        </div>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
        <p className="text-xs text-slate-500">
          Feels like {Math.round(weather.apparentTemperature)}°C
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          <span>{Math.round(weather.windSpeed)} km/h</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Thermometer className="w-3.5 h-3.5 text-red-400" />
          <span>
            {Math.round(weather.daily.maxTemp)}° / {Math.round(weather.daily.minTemp)}°
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>{Math.round(weather.visibility / 1000)} km</span>
        </div>
      </div>

      {/* 5-day forecast */}
      {weather.daily.dates.length > 1 && (
        <div className="mt-4 pt-4 border-t border-white/[0.04]">
          <div className="flex justify-between">
            {weather.daily.dates.slice(1, 6).map((date, i) => {
              const dayName = new Date(date).toLocaleDateString("en", {
                weekday: "short",
              });
              const code = weather.daily.weatherCodes[i + 1];
              return (
                <div key={date} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500">{dayName}</span>
                  <DynamicIcon
                    name={getWeatherIcon(code)}
                    className="w-4 h-4 text-slate-400"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
