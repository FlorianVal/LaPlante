# Stage 1: Build
FROM node:20-bookworm AS builder
WORKDIR /app

# Copy workspace root + all package.json files for npm ci
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY apps/server/package*.json ./apps/server/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

# Copy full source
COPY . .

# Build shared first (dependency of server and web)
RUN npm --workspace @laplante/shared run build

# Build web app (vite build → apps/web/dist/)
RUN npm --workspace @laplante/web run build

# Build server (tsc → apps/server/dist/)
RUN npm --workspace @laplante/server run build

# Prune devDependencies for production
RUN npm prune --omit=dev

# Stage 2: Production
FROM node:20-slim
WORKDIR /app

# Install sqlite3 CLI for debugging (optional, lightweight)
RUN apt-get update && apt-get install -y --no-install-recommends sqlite3 && rm -rf /var/lib/apt/lists/*

# Copy built server
COPY --from=builder /app/apps/server/dist ./dist

# Copy built web app (SPA)
COPY --from=builder /app/apps/web/dist ./public

# Copy production node_modules (symlinks become broken dirs — shared package fixed below)
COPY --from=builder /app/node_modules ./node_modules

# Copy shared workspace package (replace broken symlink from builder)
RUN rm -rf ./node_modules/@laplante/shared && mkdir -p ./node_modules/@laplante/shared
COPY --from=builder /app/packages/shared/dist ./node_modules/@laplante/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@laplante/shared/package.json

# Copy package manifests (needed for module resolution)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/server/package.json ./package.server.json

# Create data directory
RUN mkdir -p /app/data/photos

ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATABASE_PATH=/app/data/laplante.sqlite

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>{process.exit(r.ok?0:1)}).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
