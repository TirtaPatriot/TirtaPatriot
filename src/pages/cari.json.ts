import type { APIRoute } from 'astro'
import { getArtikel, jenisOf } from '../lib/artikel'
import { type Entri, MENU } from '../lib/cari'

/** Indeks pencarian global (lihat src/lib/cari.ts), dibuat saat build. */
export const GET: APIRoute = async () => {
  const artikel = [...await getArtikel('berita'), ...await getArtikel('edukasi')]
  const index: Entri[] = [
    ...MENU,
    ...artikel.map(entry => ({ jenis: jenisOf(entry), judul: entry.data.judul, ringkasan: entry.data.ringkasan ?? '', url: `/${entry.id}`, tanggal: entry.data.terbit.toISOString() })),
  ]
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
}
