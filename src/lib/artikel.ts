import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'

export type Jenis = 'berita' | 'edukasi'

export const JENIS: Record<Jenis, { title: string, lead: string, empty: string }> = {
  berita: {
    title: 'Berita',
    lead: 'Kabar kegiatan, kerja sama, dan pengumuman resmi Perumda Tirta Patriot.',
    empty: 'Belum ada berita yang diterbitkan.',
  },
  edukasi: {
    title: 'Edukasi',
    lead: 'Panduan menghemat air, merawat instalasi di rumah, dan memahami rekening air.',
    empty: 'Belum ada materi edukasi yang diterbitkan.',
  },
}

/** Jenis artikel dari id koleksi ("berita/<slug>"). */
export function jenisOf (article: CollectionEntry<'artikel'>): Jenis {
  return article.id.split('/')[0] as Jenis
}

/** Artikel terbit satu jenis, terbaru lebih dulu. */
export async function getArtikel (jenis: Jenis): Promise<CollectionEntry<'artikel'>[]> {
  const entries = await getCollection('artikel', entry => !entry.data.draf && jenisOf(entry) === jenis)
  return entries.toSorted((a, b) => b.data.terbit.getTime() - a.data.terbit.getTime())
}

/** Nama view-transition yang unik dan valid untuk sampul artikel (dipakai kartu dan halaman artikel). */
export function coverTransition (id: string): string {
  let hash = 0
  for (const char of id) {
    hash = (hash * 31 + char.codePointAt(0)!) >>> 0
  }
  return `sampul-${hash.toString(36)}`
}
