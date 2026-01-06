# 1. Base Image
FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app

# 2. Install Dependencies
FROM base AS install
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# 3. Build Project
FROM base AS prerelease
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run build --preset=bun

# 4. Final Release (Hanya ambil yang perlu saja)
FROM base AS release
# COPY folder .output adalah kunci utama Nuxt 3
COPY --from=prerelease /usr/src/app/.output ./.output
COPY --from=prerelease /usr/src/app/package.json .

# Jalankan sebagai user bun (lebih aman)
USER bun
EXPOSE 3000/tcp

# Pointing langsung ke hasil build Nitro
ENTRYPOINT [ "bun", "run", ".output/server/index.mjs" ]