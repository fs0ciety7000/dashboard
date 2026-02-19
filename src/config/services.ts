export type ServiceCategory =
  | "infrastructure"
  | "media"
  | "tools"
  | "monitoring"
  | "other";

export type ServiceStatus = "online" | "offline" | "error" | "unknown";

export interface ServiceConfig {
  id: string;
  name: string;
  url: string;
  icon: string;
  port: number;
  category: ServiceCategory;
  description: string;
  internal?: boolean;
  healthEndpoint?: string;
}

export const services: ServiceConfig[] = [
  // Infrastructure & Security
  {
    id: "traefik",
    name: "Traefik",
    url: "https://traefik.internal.fs0ciety.org",
    icon: "Shield",
    port: 443,
    category: "infrastructure",
    description: "Reverse Proxy & Load Balancer",
    internal: true,
    healthEndpoint: "/api/overview",
  },
  {
    id: "authentik",
    name: "Authentik",
    url: "https://auth.internal.fs0ciety.org",
    icon: "KeyRound",
    port: 9000,
    category: "infrastructure",
    description: "Identity Provider & SSO",
    internal: true,
  },
  {
    id: "adguard",
    name: "AdGuard Home",
    url: "https://dns.internal.fs0ciety.org",
    icon: "ShieldCheck",
    port: 80,
    category: "infrastructure",
    description: "DNS & Ad Blocker",
    internal: true,
  },
  {
    id: "vaultwarden",
    name: "Vaultwarden",
    url: "https://vault.internal.fs0ciety.org",
    icon: "Lock",
    port: 80,
    category: "infrastructure",
    description: "Password Manager",
    internal: true,
  },

  // Media & Downloads
  {
    id: "jellyfin",
    name: "Jellyfin",
    url: "https://jellyfin.fs0ciety.org",
    icon: "Tv",
    port: 8096,
    category: "media",
    description: "Media Server",
    healthEndpoint: "/health",
  },
  {
    id: "jellyseerr",
    name: "Jellyseerr",
    url: "https://requests.fs0ciety.org",
    icon: "Search",
    port: 5055,
    category: "media",
    description: "Media Requests",
  },
  {
    id: "sabnzbd",
    name: "SABnzbd",
    url: "https://nzb.internal.fs0ciety.org",
    icon: "Download",
    port: 8080,
    category: "media",
    description: "Usenet Downloader",
    internal: true,
  },
  {
    id: "sonarr",
    name: "Sonarr",
    url: "https://sonarr.internal.fs0ciety.org",
    icon: "MonitorPlay",
    port: 8989,
    category: "media",
    description: "TV Shows Manager",
    internal: true,
    healthEndpoint: "/api/v3/health",
  },
  {
    id: "radarr",
    name: "Radarr",
    url: "https://radarr.internal.fs0ciety.org",
    icon: "Film",
    port: 7878,
    category: "media",
    description: "Movies Manager",
    internal: true,
    healthEndpoint: "/api/v3/health",
  },
  {
    id: "lidarr",
    name: "Lidarr",
    url: "https://lidarr.internal.fs0ciety.org",
    icon: "Music",
    port: 8686,
    category: "media",
    description: "Music Manager",
    internal: true,
  },
  {
    id: "prowlarr",
    name: "Prowlarr",
    url: "https://prowlarr.internal.fs0ciety.org",
    icon: "Radar",
    port: 9696,
    category: "media",
    description: "Indexer Manager",
    internal: true,
  },
  {
    id: "qbittorrent",
    name: "qBittorrent",
    url: "https://qbittorrent.internal.fs0ciety.org",
    icon: "ArrowDownToLine",
    port: 8080,
    category: "media",
    description: "Torrent Client",
    internal: true,
  },
  {
    id: "navidrome",
    name: "Navidrome",
    url: "https://music.fs0ciety.org",
    icon: "Headphones",
    port: 4533,
    category: "media",
    description: "Music Streaming",
  },
  {
    id: "audiobookshelf",
    name: "Audiobookshelf",
    url: "https://audiobooks.fs0ciety.org",
    icon: "BookHeadphones",
    port: 80,
    category: "media",
    description: "Audiobooks & Podcasts",
  },

  // Tools & Productivity
  {
    id: "paperless",
    name: "Paperless-ngx",
    url: "https://docs.internal.fs0ciety.org",
    icon: "FileText",
    port: 8000,
    category: "tools",
    description: "Document Management",
    internal: true,
  },
  {
    id: "forgejo",
    name: "Forgejo",
    url: "https://git.internal.fs0ciety.org",
    icon: "GitBranch",
    port: 3000,
    category: "tools",
    description: "Git Forge",
    internal: true,
  },
  {
    id: "linkwarden",
    name: "Linkwarden",
    url: "https://links.internal.fs0ciety.org",
    icon: "Bookmark",
    port: 3000,
    category: "tools",
    description: "Bookmark Manager",
    internal: true,
  },
  {
    id: "memos",
    name: "Memos",
    url: "https://notes.internal.fs0ciety.org",
    icon: "StickyNote",
    port: 5230,
    category: "tools",
    description: "Quick Notes",
    internal: true,
  },
  {
    id: "stirling-pdf",
    name: "Stirling-PDF",
    url: "https://pdf.fs0ciety.org",
    icon: "FileType",
    port: 8080,
    category: "tools",
    description: "PDF Tools",
  },
  {
    id: "it-tools",
    name: "IT-Tools",
    url: "https://tools.fs0ciety.org",
    icon: "Wrench",
    port: 80,
    category: "tools",
    description: "Developer Utilities",
  },
  {
    id: "excalidraw",
    name: "Excalidraw",
    url: "https://draw.fs0ciety.org",
    icon: "PenTool",
    port: 80,
    category: "tools",
    description: "Whiteboard & Drawing",
  },
  {
    id: "convertx",
    name: "ConvertX",
    url: "https://convert.fs0ciety.org",
    icon: "RefreshCw",
    port: 3000,
    category: "tools",
    description: "File Converter",
  },
  {
    id: "kavita",
    name: "Kavita",
    url: "https://books.fs0ciety.org",
    icon: "BookOpen",
    port: 5000,
    category: "tools",
    description: "eBook Reader",
  },
  {
    id: "syncthing",
    name: "Syncthing",
    url: "https://sync.internal.fs0ciety.org",
    icon: "FolderSync",
    port: 8384,
    category: "tools",
    description: "File Synchronization",
    internal: true,
  },

  // Monitoring & Stats
  {
    id: "netdata",
    name: "Netdata",
    url: "https://netdata.internal.fs0ciety.org",
    icon: "Activity",
    port: 19999,
    category: "monitoring",
    description: "Real-time Monitoring",
    internal: true,
  },
  {
    id: "uptime-kuma",
    name: "Uptime Kuma",
    url: "https://status.fs0ciety.org",
    icon: "HeartPulse",
    port: 3001,
    category: "monitoring",
    description: "Uptime Monitoring",
  },
  {
    id: "jellystat",
    name: "Jellystat",
    url: "https://stats.internal.fs0ciety.org",
    icon: "BarChart3",
    port: 3000,
    category: "monitoring",
    description: "Jellyfin Statistics",
    internal: true,
  },
  {
    id: "grafana",
    name: "Grafana",
    url: "https://grafana.internal.fs0ciety.org",
    icon: "LayoutDashboard",
    port: 3000,
    category: "monitoring",
    description: "Dashboards & Visualization",
    internal: true,
  },
  {
    id: "prometheus",
    name: "Prometheus",
    url: "https://prometheus.internal.fs0ciety.org",
    icon: "Database",
    port: 9090,
    category: "monitoring",
    description: "Metrics Collection",
    internal: true,
  },
  {
    id: "dozzle",
    name: "Dozzle",
    url: "https://logs.internal.fs0ciety.org",
    icon: "ScrollText",
    port: 8080,
    category: "monitoring",
    description: "Container Logs",
    internal: true,
  },

  // Other
  {
    id: "immich",
    name: "Immich",
    url: "https://photos.internal.fs0ciety.org",
    icon: "Camera",
    port: 2283,
    category: "other",
    description: "Photo Management",
    internal: true,
  },
  {
    id: "pairdrop",
    name: "Pairdrop",
    url: "https://drop.fs0ciety.org",
    icon: "Share2",
    port: 3000,
    category: "other",
    description: "Local File Sharing",
  },
  {
    id: "kopia",
    name: "Kopia",
    url: "https://backup.internal.fs0ciety.org",
    icon: "HardDrive",
    port: 51515,
    category: "other",
    description: "Backup Solution",
    internal: true,
  },
  {
    id: "huntarr",
    name: "Huntarr",
    url: "https://hunt.internal.fs0ciety.org",
    icon: "Crosshair",
    port: 9705,
    category: "other",
    description: "Media Hunt Automation",
    internal: true,
  },
  {
    id: "posterizarr",
    name: "Posterizarr",
    url: "https://posters.internal.fs0ciety.org",
    icon: "Image",
    port: 8000,
    category: "other",
    description: "Poster Management",
    internal: true,
  },
  {
    id: "beszel",
    name: "Beszel",
    url: "https://beszel.internal.fs0ciety.org",
    icon: "Gauge",
    port: 8090,
    category: "monitoring",
    description: "Server Monitoring",
    internal: true,
  },
  {
    id: "fs0ciety-website",
    name: "fs0ciety.org",
    url: "https://fs0ciety.org",
    icon: "Globe",
    port: 443,
    category: "other",
    description: "Personal Website",
  },
];

export const categoryLabels: Record<ServiceCategory, string> = {
  infrastructure: "Infrastructure & Security",
  media: "Media & Downloads",
  tools: "Tools & Productivity",
  monitoring: "Monitoring & Stats",
  other: "Other Services",
};

export const categoryIcons: Record<ServiceCategory, string> = {
  infrastructure: "Shield",
  media: "Play",
  tools: "Wrench",
  monitoring: "Activity",
  other: "LayoutGrid",
};

export function getServicesByCategory(
  category: ServiceCategory
): ServiceConfig[] {
  return services.filter((s) => s.category === category);
}

const ICON_CDN = "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg";
const iconSlugOverrides: Record<string, string | null> = {
  "adguard": "adguard-home",
  "paperless": "paperless-ngx",
  "stirling-pdf": "stirling-pdf",
  "it-tools": "it-tools",
  "uptime-kuma": "uptime-kuma",
  "fs0ciety-website": null,
  "huntarr": null,
  "posterizarr": null,
  "convertx": null,
};

export function getServiceIconUrl(serviceId: string): string | null {
  if (serviceId in iconSlugOverrides) {
    const slug = iconSlugOverrides[serviceId];
    return slug ? `${ICON_CDN}/${slug}.svg` : null;
  }
  return `${ICON_CDN}/${serviceId}.svg`;
}
