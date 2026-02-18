export interface DashboardSettings {
  title: string;
  subtitle: string;
  domain: string;
  weather: {
    latitude: number;
    longitude: number;
    units: "metric" | "imperial";
    city: string;
  };
  rssFeeds: {
    name: string;
    url: string;
    icon: string;
  }[];
  bookmarks: {
    name: string;
    url: string;
    icon: string;
    color: string;
  }[];
  calendar: {
    googleCalendarId?: string;
  };
  refreshIntervals: {
    serviceStatus: number;
    weather: number;
    rss: number;
    systemStats: number;
    downloads: number;
  };
}

export const settings: DashboardSettings = {
  title: "fs0ciety",
  subtitle: "Homelab Dashboard",
  domain: "fs0ciety.org",
  weather: {
    latitude: 48.8566,
    longitude: 2.3522,
    units: "metric",
    city: "Paris",
  },
  rssFeeds: [
    {
      name: "Hacker News",
      url: "https://hnrss.org/frontpage",
      icon: "Newspaper",
    },
    {
      name: "Ars Technica",
      url: "https://feeds.arstechnica.com/arstechnica/index",
      icon: "Globe",
    },
    {
      name: "TorrentFreak",
      url: "https://torrentfreak.com/feed/",
      icon: "Rss",
    },
    {
      name: "selfhosted (Reddit)",
      url: "https://www.reddit.com/r/selfhosted/.rss",
      icon: "Server",
    },
  ],
  bookmarks: [
    {
      name: "GitHub",
      url: "https://github.com",
      icon: "GitBranch",
      color: "#8b5cf6",
    },
    {
      name: "Reddit",
      url: "https://reddit.com",
      icon: "MessageCircle",
      color: "#f97316",
    },
    {
      name: "YouTube",
      url: "https://youtube.com",
      icon: "Play",
      color: "#ef4444",
    },
    {
      name: "Twitter / X",
      url: "https://x.com",
      icon: "AtSign",
      color: "#3b82f6",
    },
    {
      name: "Discord",
      url: "https://discord.com",
      icon: "MessageSquare",
      color: "#6366f1",
    },
    {
      name: "Proton Mail",
      url: "https://mail.proton.me",
      icon: "Mail",
      color: "#8b5cf6",
    },
  ],
  calendar: {},
  refreshIntervals: {
    serviceStatus: 30000,
    weather: 600000,
    rss: 300000,
    systemStats: 5000,
    downloads: 3000,
  },
};
