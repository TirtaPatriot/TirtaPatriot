/**
 * Content collections situs. Konten redaksi (berita, edukasi, halaman profil, dokumen legal)
 * dan data referensi (navigasi, kantor, mitra, direksi) disimpan di repo ini; perubahan lewat
 * commit/editor di /admin memicu build ulang. Data operasional dimuat saat build dari sistem internal.
 */
import { defineCollection } from 'astro:content'
import type { Loader } from 'astro/loaders'
import { file, glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { directusItems, GANGGUAN_QUERY } from './lib/directus'
import { renderContent } from './lib/render-content'

type LoadedEntry = {
  id: string
  data: Record<string, unknown>
  /** konten mentah dari CMS yang dirender menjadi HTML aman */
  content?: string | null
  format?: 'auto' | 'markdown' | 'html'
}

function directusLoader (name: string, fetchEntries: () => Promise<LoadedEntry[]>): Loader {
  return {
    name: `directus-${name}`,
    async load ({ store, parseData, generateDigest, logger }) {
      const entries = await fetchEntries()
      store.clear()

      for (const entry of entries) {
        const data = await parseData({ id: entry.id, data: entry.data })
        const html = entry.content === undefined ? undefined : await renderContent(entry.content, entry.format)

        store.set({
          id: entry.id,
          data,
          digest: generateDigest({ ...entry.data, content: entry.content ?? '' }),
          ...(html === undefined ? {} : { rendered: { html } }),
        })
      }

      logger.info(`${entries.length} entri dimuat`)
    },
  }
}

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

const kantor = defineCollection({
  loader: file('src/data/kantor.json'),
  schema: z.object({
    nama: z.string(),
    alamat: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
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

const statistik = defineCollection({
  loader: directusLoader('statistik', async () => {
    const rows = await directusItems<{ id: number, name: string, value: string }[]>('statistik', {
      fields: 'id,name,value',
      sort: 'sort,id',
    })

    return rows.map((row, order) => ({ id: String(row.id), data: { name: row.name, value: row.value, order } }))
  }),
  schema: z.object({ name: z.string(), value: z.string(), order: z.number() }),
})

type DirectusGangguan = {
  id: string
  title: string
  subtitle: string | null
  image: string | null
  content: string | null
  waktu_mulai: string | null
  estimasi_selesai: string | null
}

/** Snapshot saat build; halaman gangguan memperbarui daftar ini langsung dari CMS di browser. */
const gangguan = defineCollection({
  loader: directusLoader('gangguan', async () => {
    const rows = await directusItems<DirectusGangguan[]>('gangguan_layanan', GANGGUAN_QUERY)

    return rows.map(row => ({
      id: row.id,
      data: {
        title: row.title,
        subtitle: row.subtitle,
        image: row.image,
        mulai: row.waktu_mulai,
        estimasi: row.estimasi_selesai,
      },
      content: row.content,
    }))
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().nullable(),
    image: z.string().nullable(),
    mulai: z.string().nullable(),
    estimasi: z.string().nullable(),
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

export const collections = { artikel, halaman, navigasi, kantor, mitra, direksi, statistik, gangguan, legal }
