/**
 * Content collections situs. Konten redaksi tetap dikelola di CMS Directus dan ditarik
 * saat build melalui loader di bawah; dokumen legal disimpan sebagai Markdown di repo.
 * Setiap perubahan di CMS perlu build ulang (mis. lewat webhook Directus ke build hook).
 */
import { defineCollection } from 'astro:content'
import type { Loader } from 'astro/loaders'
import { glob } from 'astro/loaders'
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

type DirectusArtikel = {
  id: string
  jenis: string
  judul: string
  ringkasan: string | null
  cover: string | null
  content: string | null
  permalink: string | null
  dipublikasi: string | null
  date_created: string
  date_updated: string | null
}

const artikel = defineCollection({
  loader: directusLoader('artikel', async () => {
    const rows = await directusItems<DirectusArtikel[]>('artikel', {
      'fields': 'id,jenis,judul,ringkasan,cover,content,permalink,dipublikasi,date_created,date_updated',
      'filter[status][_eq]': 'published',
      'sort': '-date_created',
      'limit': -1,
    })

    return rows
      .filter(row => row.permalink?.trim().startsWith(`/${row.jenis}/`))
      .map(row => ({
        // id = permalink tanpa garis miring awal, mis. "berita/judul-artikel"
        id: row.permalink!.trim().replace(/^\/+|\/+$/g, ''),
        data: {
          cmsId: row.id,
          jenis: row.jenis,
          judul: row.judul,
          ringkasan: row.ringkasan?.trim() || null,
          cover: row.cover,
          terbit: row.dipublikasi || row.date_created,
          dibuat: row.date_created,
          diperbarui: row.date_updated,
        },
        content: row.content,
      }))
  }),
  schema: z.object({
    cmsId: z.string(),
    jenis: z.enum(['berita', 'edukasi']),
    judul: z.string(),
    ringkasan: z.string().nullable(),
    cover: z.string().nullable(),
    terbit: z.coerce.date(),
    dibuat: z.coerce.date(),
    diperbarui: z.coerce.date().nullable(),
  }),
})

type DirectusNav = {
  id: number
  title: string | null
  to: string | null
  icon: string | null
  active: boolean
  children?: DirectusNav[]
}

/** Tautan CMS lama yang kini punya alamat kanonis sendiri. */
const NAV_CANONICAL: Record<string, string> = {
  '/informasi/berita': '/berita',
  '/info/berita': '/berita',
  '/informasi/edukasi': '/edukasi',
  '/info/edukasi': '/edukasi',
}

const navLink = z.object({
  title: z.string(),
  href: z.string(),
  external: z.boolean(),
  icon: z.string().nullable(),
})

const navigasi = defineCollection({
  loader: directusLoader('navigasi', async () => {
    const rows = await directusItems<DirectusNav[]>('butir_navigasi', {
      'fields': 'id,title,to,icon,active,sort,children.id,children.title,children.to,children.icon,children.active,children.sort',
      'filter[active][_eq]': 'true',
      'filter[navigasi][pid][_eq]': 'main',
      'sort': 'sort,id',
      'deep[children][_sort]': 'sort,id',
    })

    const link = (item: DirectusNav) => {
      const to = item.to?.trim() ?? ''
      return {
        title: item.title?.trim() ?? '',
        href: NAV_CANONICAL[to] ?? to,
        external: /^https?:\/\//.test(to),
        icon: item.icon || null,
      }
    }

    return rows.map((item, order) => ({
      id: String(item.id),
      data: {
        ...link(item),
        order,
        children: (item.children ?? []).filter(child => child.active && child.title && child.to).map(child => link(child)),
      },
    }))
  }),
  schema: navLink.extend({
    order: z.number(),
    children: z.array(navLink),
  }),
})

const korsel = defineCollection({
  loader: directusLoader('korsel', async () => {
    const rows = await directusItems<{ id: number, image: string, title: string | null }[]>('korsel', {
      'fields': 'id,image,title',
      'filter[status][_eq]': 'published',
      'sort': 'sort,id',
    })

    return rows.map((row, order) => ({ id: String(row.id), data: { image: row.image, title: row.title ?? '', order } }))
  }),
  schema: z.object({ image: z.string(), title: z.string(), order: z.number() }),
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

const kantor = defineCollection({
  loader: directusLoader('kantor', async () => {
    const rows = await directusItems<{ id: string, name: string, address: string, latitude: number | null, longitude: number | null }[]>('kantor', {
      sort: 'id',
    })

    return rows.map(row => ({ id: String(row.id), data: { name: row.name, address: row.address, latitude: row.latitude, longitude: row.longitude } }))
  }),
  schema: z.object({
    name: z.string(),
    address: z.string(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
  }),
})

const mitra = defineCollection({
  loader: directusLoader('mitra', async () => {
    const rows = await directusItems<{ id: number, name: string, logo: string, url: string }[]>('tempat_pembayaran', {
      fields: 'id,name,logo,url',
      sort: 'sort,id',
    })

    return rows.map(row => ({ id: String(row.id), data: { name: row.name, logo: row.logo, url: row.url } }))
  }),
  schema: z.object({ name: z.string(), logo: z.string(), url: z.string() }),
})

const direksi = defineCollection({
  loader: directusLoader('direksi', async () => {
    const rows = await directusItems<{ id: number, nama: string, jabatan: string, foto: string | null }[]>('manajemen_pegawai', {
      'fields': 'id,nama,jabatan,foto',
      'filter[manajemen][_eq]': 'direksi',
      'sort': 'sort,id',
    })

    return rows.map((row, order) => ({ id: String(row.id), data: { nama: row.nama, jabatan: row.jabatan, foto: row.foto, order } }))
  }),
  schema: z.object({ nama: z.string(), jabatan: z.string(), foto: z.string().nullable(), order: z.number() }),
})

/** Halaman tunggal (singleton) di CMS. */
const halaman = defineCollection({
  loader: directusLoader('halaman', async () => {
    const [sejarah, visi] = await Promise.all([
      directusItems<{ judul: string | null, cover: string | null, isi: string | null }>('Sejarah'),
      directusItems<{ isi: string | null }>('visi'),
    ])

    return [
      { id: 'sejarah', data: { judul: sejarah.judul || 'Sejarah', cover: sejarah.cover }, content: sejarah.isi, format: 'html' as const },
      { id: 'visi-misi', data: { judul: 'Visi & Misi', cover: null }, content: visi.isi },
    ]
  }),
  schema: z.object({ judul: z.string(), cover: z.string().nullable() }),
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

export const collections = { artikel, navigasi, korsel, statistik, kantor, mitra, direksi, halaman, gangguan, legal }
