# syntax=docker/dockerfile:1.7

############################
# base
############################
FROM oven/bun:1-alpine AS base
WORKDIR /app
ENV NODE_ENV=production \
    NUXT_TELEMETRY_DISABLED=1 \
    NUXT_HOST=0.0.0.0 \
    NUXT_PORT=3000

############################
# deps (cached)
############################
FROM base AS deps

# Copy only manifest + lock for best cache hit rate
COPY package.json bun.lockb ./

# BuildKit cache for bun to speed up rebuilds
RUN --mount=type=cache,target=/root/.bun \
    bun install --frozen-lockfile

############################
# build - copy pre-built output from local
############################
FROM base AS build

WORKDIR /app
COPY package.json bun.lockb ./
COPY .output ./.output

############################
# runner (small)
############################
FROM base AS runner

# Only ship build output (small + secure)
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

USER bun
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
