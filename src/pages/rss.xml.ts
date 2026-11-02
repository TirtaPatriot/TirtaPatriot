import type { APIRoute } from 'astro'
import { getArtikel, JENIS } from '../lib/artikel'
import { plainText } from '../lib/render-content'
import { SITE_DESCRIPTION, SITE_NAME } from '../lib/site'

const escape = (value: string): string => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

/** Umpan RSS untuk berita dan materi edukasi (30 terbaru), mengikuti domain situs (SITE_URL). */
export const GET: APIRoute = async ({ site }) => {
  const entries = (await Promise.all((Object.keys(JENIS) as (keyof typeof JENIS)[]).map(getArtikel))).flat()
    .toSorted((a, b) => b.data.terbit.getTime() - a.data.terbit.getTime())
    .slice(0, 30)

  const items = entries.map(entry => {
    const url = new URL(`/${entry.id}`, site).toString()
    const description = entry.data.ringkasan ? plainText(entry.data.ringkasan) : plainText(entry.rendered?.html)
    return `    <item>
      <title>${escape(entry.data.judul)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${entry.data.terbit.toUTCString()}</pubDate>
      <category>${escape(JENIS[entry.id.split('/')[0] as keyof typeof JENIS].title)}</category>
      <description>${escape(description)}</description>
    </item>`
  })

  const home = new URL('/', site).toString()
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(`Berita dan edukasi ${SITE_NAME}`)}</title>
    <link>${home}</link>
    <description>${escape(SITE_DESCRIPTION)}</description>
    <language>id-ID</language>
    <atom:link href="${new URL('/rss.xml', site)}" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
