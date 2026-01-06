# --- Stage 1: Base ---
FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app

# --- Stage 2: Install ---
FROM base AS install
COPY package.json bun.lockb ./
# Pastikan gunakan --network=host saat build jika DNS masih bermasalah
RUN bun install --frozen-lockfile

# --- Stage 3: Build ---
FROM base AS prerelease
# Ambil node_modules dari stage install
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .

# Tambahkan argumen ini untuk memastikan build nuxt lebih "berani"
ENV NODE_ENV=production
RUN bun run build

# --- Stage 4: Release ---
FROM base AS release
WORKDIR /usr/src/app

# COPY yang paling krusial adalah folder .output
COPY --from=prerelease /usr/src/app/.output ./.output

COPY --from=prerelease /usr/src/app/node_modules/css-tree/data ./.output/server/node_modules/css-tree/data

# Environment wajib agar container bisa diakses
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

USER bun
EXPOSE 3000/tcp

ENTRYPOINT [ "bun", "run", ".output/server/index.mjs" ]