FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

# ─── Production stage ─────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Runtime dependency for better-sqlite3
RUN apk add --no-cache libstdc++

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY server/ ./server/
COPY public/ ./public/
COPY scripts/ ./scripts/

# Data directory for SQLite (mount as volume)
RUN mkdir -p /data

ENV NODE_ENV=production
ENV DB_PATH=/data/db.sqlite
ENV PORT=3002

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3002; require('http').get('http://localhost:'+port+'/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

CMD ["node", "server/index.js"]
