# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build the application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Production image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Entrypoint script to match docker socket GID at runtime
RUN printf '#!/bin/sh\nif [ -S /var/run/docker.sock ]; then\n  SOCK_GID=$(stat -c "%%g" /var/run/docker.sock)\n  if ! getent group "$SOCK_GID" >/dev/null 2>&1; then\n    addgroup --system --gid "$SOCK_GID" docker\n  fi\n  SOCK_GROUP=$(getent group "$SOCK_GID" | cut -d: -f1)\n  addgroup nextjs "$SOCK_GROUP" 2>/dev/null || true\nfi\nexec su-exec nextjs "$@"\n' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

RUN apk add --no-cache su-exec

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server.js"]
