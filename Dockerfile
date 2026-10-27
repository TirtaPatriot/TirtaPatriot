# syntax=docker/dockerfile:1

# --- build: situs statis Astro --------------------------------------------------------------
FROM oven/bun:1.4.4 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Nilai PUBLIC_* ditanam ke HTML/JS saat build (bukan saat container berjalan).
ARG PUBLIC_API_URL=https://open.tirtapatriot.net/web
ARG PUBLIC_INFO_PELANGGAN_API=https://pelanggan.api.tirtapatriot.co
ARG PUBLIC_RECAPTCHA_SITE_KEY=
ARG PUBLIC_BASEMAP_STYLE=https://tiles.openfreemap.org/styles/positron
ARG PUBLIC_PIPA_TILES=https://tile.api.tirtapatriot.com
ARG PUBLIC_CHATWOOT_WEBSITE_TOKEN=
ARG PUBLIC_CHATWOOT_BASE_URL=
ENV PUBLIC_API_URL=$PUBLIC_API_URL \
    PUBLIC_INFO_PELANGGAN_API=$PUBLIC_INFO_PELANGGAN_API \
    PUBLIC_RECAPTCHA_SITE_KEY=$PUBLIC_RECAPTCHA_SITE_KEY \
    PUBLIC_BASEMAP_STYLE=$PUBLIC_BASEMAP_STYLE \
    PUBLIC_PIPA_TILES=$PUBLIC_PIPA_TILES \
    PUBLIC_CHATWOOT_WEBSITE_TOKEN=$PUBLIC_CHATWOOT_WEBSITE_TOKEN \
    PUBLIC_CHATWOOT_BASE_URL=$PUBLIC_CHATWOOT_BASE_URL \
    ASTRO_TELEMETRY_DISABLED=1

RUN bun --bun run build \
 && bun scripts/nginx-redirects.ts public/_redirects > redirects.conf

# --- runtime: nginx menyajikan berkas statis --------------------------------------------------
FROM nginx:1.30-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/redirects.conf /etc/nginx/snippets/redirects.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
