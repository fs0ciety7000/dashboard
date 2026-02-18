import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getWeatherIcon(code: number): string {
  if (code === 0) return "Sun";
  if (code <= 3) return "CloudSun";
  if (code <= 49) return "Cloud";
  if (code <= 59) return "CloudDrizzle";
  if (code <= 69) return "CloudRain";
  if (code <= 79) return "CloudSnow";
  if (code <= 82) return "CloudRain";
  if (code <= 86) return "CloudSnow";
  if (code <= 99) return "CloudLightning";
  return "Cloud";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "online":
      return "text-emerald-400";
    case "offline":
      return "text-red-400";
    case "error":
      return "text-amber-400";
    default:
      return "text-slate-500";
  }
}

export function getStatusDotColor(status: string): string {
  switch (status) {
    case "online":
      return "bg-emerald-400";
    case "offline":
      return "bg-red-400";
    case "error":
      return "bg-amber-400";
    default:
      return "bg-slate-500";
  }
}
