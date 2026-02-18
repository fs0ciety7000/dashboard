# fs0ciety Dashboard

A modern, vibrant homelab dashboard built with Next.js, featuring dark glassmorphism UI, real-time service monitoring, media tracking, and system statistics.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

## Features

### Home Page
- Real-time clock with greeting
- Weather widget (Open-Meteo API, no key required)
- RSS feed aggregator with multi-source tabs
- Interactive calendar
- Quick bookmarks
- Service status overview
- System resource gauges (CPU, RAM, Disk)

### Services Page
- All 35+ services with status monitoring (online/offline/error)
- Category filtering (Infrastructure, Media, Tools, Monitoring, Other)
- Search functionality
- Direct links to each service
- Internal service indicator

### Media Page
- Now Playing (Jellyfin active streams)
- Download queue (SABnzbd / qBittorrent) with speed & progress
- Jellyseerr media requests with status
- Recently added content
- Library statistics (Movies, TV, Music, Books, Audiobooks, Photos)
- Arr stack stats (Sonarr, Radarr, Lidarr) with completion tracking

### Homelab Page
- CPU, Memory, Swap gauges with detailed stats
- Storage usage per disk/mount
- Real-time network throughput chart
- Docker container list with CPU/memory usage
- Quick links to monitoring tools (Netdata, Grafana, Dozzle, etc.)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Docker with Traefik integration

## Quick Start

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker Deployment

```bash
# Build and run
docker compose up -d --build

# Or pull and run
docker compose up -d
```

The dashboard will be available at `https://dashboard.internal.fs0ciety.org` (via Traefik).

## Configuration

### Services

Edit `src/config/services.ts` to add, remove, or modify services. Each service has:

```typescript
{
  id: "service-id",
  name: "Service Name",
  url: "https://service.fs0ciety.org",
  icon: "LucideIconName",    // Any icon from lucide-react
  port: 8080,
  category: "media",         // infrastructure | media | tools | monitoring | other
  description: "What it does",
  internal: true,             // Shows lock icon
}
```

### Settings

Edit `src/config/settings.ts` to customize:

- **Weather**: Set your coordinates and city name
- **RSS Feeds**: Add/remove RSS feed sources
- **Bookmarks**: Customize quick links
- **Refresh Intervals**: Adjust polling frequencies

### Environment Variables

Copy `.env.example` to `.env` and configure API keys for deeper service integration:

```bash
cp .env.example .env
```

## Architecture

```
src/
  app/                    # Next.js App Router pages & API routes
    api/                  # Backend API routes
      health/             # Health check endpoint
      weather/            # Weather proxy (Open-Meteo)
      services/status/    # Service health checking
      system/             # System stats (CPU, RAM, Disk)
      rss/                # RSS feed aggregator
    services/             # Services page
    media/                # Media page
    homelab/              # Homelab page
  components/
    layout/               # App shell, sidebar
    ui/                   # Reusable UI primitives (GlassCard, Gauge, etc.)
    widgets/              # Feature widgets
  config/                 # Service & app configuration
  lib/                    # Utility functions
```

## Design

- **Dark glassmorphism** with ambient gradient orbs
- **Frosted glass cards** with backdrop-blur
- **Vibrant accent colors**: Cyan, Violet, Pink, Emerald, Amber
- **Inter** for body text, **JetBrains Mono** for data/stats
- **Framer Motion** page transitions and micro-interactions
- **Responsive** grid layout with collapsible sidebar

## Extending

### Adding a new service

1. Add the service config to `src/config/services.ts`
2. The service will automatically appear on the Services page
3. Status monitoring is automatic via HTTP HEAD checks

### Adding a new widget

1. Create a component in `src/components/widgets/`
2. Import and place it in the relevant page
3. If it needs data, create an API route in `src/app/api/`

### Adding API integrations

Create new API routes under `src/app/api/` that proxy to your services. The existing routes demonstrate the pattern for weather, RSS, system stats, and service health checks.

## License

MIT
