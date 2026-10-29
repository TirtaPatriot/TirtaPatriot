import type { APIRoute } from 'astro'

/** robots.txt mengikuti domain situs (SITE_URL), sehingga alamat sitemap selalu benar. */
export const GET: APIRoute = ({ site }) => new Response(`User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap-index.xml', site)}
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
