FROM oven/bun:1-alpine

WORKDIR /usr/src/app

# 1. Copy file package saja untuk caching
COPY package.json bun.lockb ./

# 2. Install (Gunakan network host saat build jika DNS bermasalah)
RUN bun install --frozen-lockfile

# 3. Copy seluruh source code
COPY . .

# 4. Build Nuxt
# ENV NODE_ENV=production
RUN bun run build --preset=bun

# 5. Konfigurasi Runtime
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT [ "bun", "run", ".output/server/index.mjs" ]