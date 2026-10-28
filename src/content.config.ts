/**
 * Content collections situs. Konten redaksi (berita, edukasi, halaman profil, dokumen legal)
 * dan data referensi (navigasi, kantor, mitra, direksi) disimpan di repo ini; perubahan lewat
 * commit/editor di /admin memicu build ulang. Data operasional dimuat saat build dari sistem internal.
 */
import { defineCollection } from 'astro:content'
import { file, glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { fetchGangguan, fetchPengumuman, isGangguan, isSelesai } from './lib/info-pelanggan'
import { renderContent } from './lib/render-content'

/** Berita & edukasi: Markdown di src/content/artikel/{berita,edukasi}/<slug>.md, id = "berita/<slug>". */
const artikel = defineCollection({
  loader: glob({ pattern: '{berita,edukasi}/*.md', base: './src/content/artikel' }),
  schema: ({ image }) => z.object({
    judul: z.string(),
    ringkasan: z.string().optional(),
    sampul: image().optional(),
    terbit: z.coerce.date(),
    diperbarui: z.coerce.date().optional(),
    draf: z.boolean().default(false),
  }),
})

/** Halaman profil (sejarah, visi-misi) */
const halaman = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/halaman' }),
  schema: ({ image }) => z.object({
    judul: z.string(),
    sampul: image().optional(),
  }),
})

const navLink = z.object({ judul: z.string(), tautan: z.string() })

const navigasi = defineCollection({
  loader: file('src/data/navigasi.json'),
  schema: z.object({
    judul: z.string(),
    tautan: z.string().nullable(),
    anak: z.array(navLink),
  }),
})

/** Kantor pelayanan, dari info_pelanggan.cabang (sistem Informasi Pelanggan) */
const kantor = defineCollection({
  loader: file('src/data/kantor.json'),
  schema: z.object({
    nama: z.string(),
    alamat: z.string(),
    hari: z.string(),
    jam: z.string(),
    telepon: z.string(),
    lat: z.number(),
    lng: z.number(),
    zona: z.number().nullable(),
  }),
})

const mitra = defineCollection({
  loader: file('src/data/mitra.json'),
  schema: ({ image }) => z.object({
    nama: z.string(),
    url: z.string().url(),
    aktif: z.boolean(),
    logo: image(),
  }),
})

const direksi = defineCollection({
  loader: file('src/data/direksi.json'),
  schema: ({ image }) => z.object({
    nama: z.string(),
    jabatan: z.string(),
    foto: image().nullable(),
  }),
})

/**
 * Gangguan layanan yang sedang berlaku, dari sistem Informasi Pelanggan (aplikasi mobile).
 * Snapshot saat build; halaman memperbaruinya langsung dari API di browser.
 */
const gangguan = defineCollection({
  loader: {
    name: 'info-pelanggan-gangguan',
    async load ({ store, parseData, logger }) {
      store.clear()
      let items: Awaited<ReturnType<typeof fetchGangguan>> = []
      try {
        items = await fetchGangguan()
      } catch (error) {
        // API tidak terjangkau saat build: halaman tetap dibangun, browser akan memuat ulang
        logger.warn(`gangguan tidak dimuat: ${String(error)}`)
      }
      for (const item of items) {
        const data = await parseData({ id: item.id, data: { title: item.title, tanggal: item.date, image: item.cover_image || item.image || null, selesai: isSelesai(item) } })
        store.set({ id: item.id, data, rendered: { html: await renderContent(item.description, 'html') } })
      }
      logger.info(`${items.length} gangguan aktif`)
    },
  },
  schema: z.object({
    title: z.string(),
    tanggal: z.string(),
    image: z.string().nullable(),
    selesai: z.boolean(),
  }),
})

/**
 * Pengumuman & berita yang tayang di aplikasi Tirta Patriot Mobile (sistem Informasi Pelanggan), untuk karosel beranda.
 * Snapshot saat build; beranda memperbaruinya langsung dari API di browser.
 */
const pengumuman = defineCollection({
  loader: {
    name: 'info-pelanggan-pengumuman',
    async load ({ store, parseData, logger }) {
      store.clear()
      let items: Awaited<ReturnType<typeof fetchPengumuman>> = []
      try {
        items = await fetchPengumuman()
      } catch (error) {
        logger.warn(`pengumuman tidak dimuat: ${String(error)}`)
      }
      for (const [urutan, item] of items.entries()) {
        const data = await parseData({ id: item.id, data: { title: item.title, tanggal: item.date, image: item.cover_image || item.image || null, gangguan: isGangguan(item), urutan } })
        store.set({ id: item.id, data, rendered: { html: await renderContent(item.description, 'html') } })
      }
      logger.info(`${items.length} pengumuman tayang`)
    },
  },
  schema: z.object({
    title: z.string(),
    tanggal: z.string(),
    image: z.string().nullable(),
    gangguan: z.boolean(),
    // urutan dari API (terbaru lebih dulu), sama dengan aplikasi
    urutan: z.number(),
  }),
})

const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    subtitle: z.string(),
    badge: z.string().optional(),
    effective: z.string().optional(),
    partyLabel: z.string(),
    party: z.string(),
    links: z.array(z.object({ title: z.string(), href: z.string() })).optional(),
    group: z.enum(['whatsapp', 'google']),
    order: z.number(),
    summary: z.string(),
    indexBadge: z.string(),
    aliases: z.array(z.string()).optional(),
  }),
})

export const collections = { artikel, halaman, navigasi, kantor, mitra, direksi, gangguan, pengumuman, legal }
