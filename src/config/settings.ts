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
    latitude: 50.4542,
    longitude: 3.9522,
    units: "metric",
    city: "Mons",
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
      name: "selfhosted",
      url: "https://www.reddit.com/r/selfhosted/new/.rss",
      icon: "Server",
    },
    {
      name: "Privacy Tools",
      url: "https://www.reddit.com/r/privacytoolsIO/new/.rss",
      icon: "Shield",
    },
    {
      name: "Privacy",
      url: "https://www.reddit.com/r/privacy/new/.rss",
      icon: "Lock",
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
      name: "Google Drive",
      url: "https://drive.google.com",
      icon: "HardDrive",
      color: "#34d399",
    },
    {
      name: "Gmail",
      url: "https://mail.google.com",
      icon: "Mail",
      color: "#ef4444",
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
    {
      name: "Twitter / X",
      url: "https://x.com",
      icon: "AtSign",
      color: "#3b82f6",
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
