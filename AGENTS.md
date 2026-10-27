# Project Rules

## General
- Follow the existing code style and patterns.
- Use bun for running project commands.
- Keep code in TypeScript unless migration is required.

## Stack
- Framework: Astro 7 (static output, deployed to https://tirtapatriot.co.id)
- Styling: Tailwind CSS v4 (CSS-first config in `src/styles/global.css`, no UI library)
- Language: TypeScript 7 (native compiler) for type-checking; interactive pages use plain TypeScript in `src/scripts/`, no client framework
- Content: Astro content collections (`src/content.config.ts`) from Markdown/JSON in the repo (no Directus); operational snapshots from ERP MSSQL via `bun run data`; outages from the Info Pelanggan API (`/news`)
- Data rule: publish aggregates only — never per-customer data; never publish the pipe network (critical infrastructure)
- Lint: oxlint (typescript-eslint and `astro check` do not support TypeScript 7)
- Enabled MCP: Vuetify docs, Astro docs (see `.ruler/ruler.toml`)

## Conventions
- CMS HTML/Markdown is always rendered through `src/lib/render-content.ts` (sanitised by `rehype-content-guard`); never insert CMS or API text with `innerHTML`.
- Client scripts build DOM with `el()` from `src/scripts/dom.ts` (text via `textContent`).
- Design tokens (colours, type scale) live in `@theme` in `src/styles/global.css`; reuse them instead of new hex values.
- Old URLs are kept working through `public/_redirects`.
