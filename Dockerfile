# syntax=docker/dockerfile:1.7

############################
# Builder (Node.js)
############################
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json bun.lockb* ./

# Install with npm (handles dependencies better than bun in containers)
RUN npm install

COPY . .

# Build with npm run
RUN npm run build

############################
# Runtime (Bun)
############################
FROM oven/bun:1-slim

WORKDIR /app

ENV NODE_ENV=production \
    NUXT_TELEMETRY_DISABLED=1 \
    NUXT_HOST=0.0.0.0 \
    NUXT_PORT=3000

# Only copy built output + package.json
COPY --from=builder /app/.output ./.output
COPY package.json ./

USER bun
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
