/**
 * Migrasi satu kali isi CMS Directus (cms.tirtapatriot.net) ke repo:
 *   bun scripts/migrate-directus.ts
 *
 * - artikel  → src/content/artikel/{berita,edukasi}/<slug>.md (gambar ke src/assets/artikel/<slug>/)
 * - Sejarah, visi → src/content/halaman/*.md (HTML editor diubah menjadi Markdown)
 * - kantor, tempat_pembayaran, direksi, navigasi, statistik → src/data/*.json (+ gambar ke src/assets)
 *
 * Aset diunduh dalam ukuran wajar (lebar maks. 1800 px) karena Astro akan mengoptimalkan ulang.
 * Skrip aman dijalankan ulang: berkas yang sudah ada ditimpa.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'

const CMS = 'https://cms.tirtapatriot.net'
const ROOT = join(import.meta.dir, '..')
const slugify = (value: unknown) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const ASSET_ID = /[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/

type Row = Record<string, unknown>

async function items<T = Row> (collection: string, query = ''): Promise<T> {
  const response = await fetch(`${CMS}/items/${collection}?${query}`)
  if (!response.ok) {
    throw new Error(`${collection}: HTTP ${response.status}`)
  }
  return (await response.json() as { data: T }).data
}

const EXTENSIONS: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}

/**
 * Unduh aset Directus. Gambar raster diperkecil & dijadikan WebP oleh CMS; berkas lain apa adanya.
 * Mengembalikan path absolut berkas yang ditulis.
 */
async function download (id: string, folder: string, name: string, options: { keepFormat?: boolean } = {}): Promise<string> {
  const head = await fetch(`${CMS}/assets/${id}`, { method: 'HEAD' })
  const type = head.headers.get('content-type')?.split(';')[0] ?? ''
  const raster = /^image\/(jpeg|png|webp)$/.test(type)
  const url = raster && !options.keepFormat
    ? `${CMS}/assets/${id}?width=1800&fit=inside&withoutEnlargement=true&format=webp&quality=86`
    : `${CMS}/assets/${id}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`aset ${id}: HTTP ${response.status}`)
  }
  const ext = raster && !options.keepFormat ? 'webp' : (EXTENSIONS[type] ?? 'bin')
  const file = join(folder, `${name}.${ext}`)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, new Uint8Array(await response.arrayBuffer()))
  return file
}

function rel (from: string, to: string): string {
  const path = relative(dirname(from), to)
  return path.startsWith('.') ? path : `./${path}`
}

function yamlString (value: string): string {
  return JSON.stringify(value)
}

function frontmatter (data: Record<string, string | null | undefined>): string {
  const lines = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}: ${yamlString(String(value))}`)
  return `---\n${lines.join('\n')}\n---\n`
}

async function htmlToMarkdown (html: string): Promise<string> {
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify, { bullet: '-', emphasis: '*', strong: '*', fences: true })
    .process(html)
  return String(file)
}

/** Ganti setiap rujukan aset CMS di Markdown dengan berkas lokal. */
async function localiseAssets (markdown: string, mdFile: string, assetFolder: string): Promise<string> {
  const pattern = new RegExp(`(?:https?://cms\\.tirtapatriot\\.net)?/assets/(${ASSET_ID.source})[^\\s)"'<]*`, 'g')
  const found = [...new Set([...markdown.matchAll(pattern)].map(match => match[0]))]
  let result = markdown
  for (const url of found) {
    const id = ASSET_ID.exec(url)![0].toUpperCase()
    const file = await download(id, assetFolder, id.toLowerCase())
    // PDF & berkas non-gambar disajikan apa adanya dari public/
    if (!/\.(webp|png|jpg|svg|gif)$/.test(file)) {
      const target = join(ROOT, 'public/berkas', file.split('/').at(-1)!)
      await mkdir(dirname(target), { recursive: true })
      await writeFile(target, new Uint8Array(await Bun.file(file).arrayBuffer()))
      await Bun.file(file).delete()
      result = result.replaceAll(url, `/berkas/${file.split('/').at(-1)}`)
      continue
    }
    result = result.replaceAll(url, rel(mdFile, file))
  }
  return result
}

async function migrateArtikel (): Promise<void> {
  const rows = await items<Row[]>('artikel', 'filter[status][_eq]=published&limit=-1&sort=-date_created&fields=id,jenis,judul,ringkasan,cover,content,permalink,dipublikasi,date_created,date_updated')
  for (const row of rows) {
    const permalink = String(row.permalink ?? '').trim().replace(/^\/+|\/+$/g, '')
    const [jenis, slug] = permalink.split('/')
    if (!slug || (jenis !== 'berita' && jenis !== 'edukasi')) {
      console.warn('lewati (permalink tidak dikenal):', row.id, permalink)
      continue
    }

    const mdFile = join(ROOT, 'src/content/artikel', jenis, `${slug}.md`)
    const assetFolder = join(ROOT, 'src/assets/artikel', slug)
    const cover = row.cover ? await download(String(row.cover), assetFolder, 'sampul') : undefined
    const body = await localiseAssets(String(row.content ?? '').trim(), mdFile, assetFolder)

    await mkdir(dirname(mdFile), { recursive: true })
    await writeFile(mdFile, `${frontmatter({
      judul: String(row.judul ?? '').trim(),
      ringkasan: String(row.ringkasan ?? '').trim() || undefined,
      sampul: cover ? rel(mdFile, cover) : undefined,
      terbit: String(row.dipublikasi || row.date_created),
      diperbarui: row.date_updated ? String(row.date_updated) : undefined,
    })}\n${body}\n`)
    console.log('artikel', permalink)
  }
}

async function migrateHalaman (): Promise<void> {
  const [sejarah, visi] = await Promise.all([items<Row>('Sejarah'), items<Row>('visi')])
  const pages = [
    { id: 'sejarah', judul: String(sejarah.judul || 'Sejarah'), isi: String(sejarah.isi ?? ''), cover: sejarah.cover as string | null },
    { id: 'visi-misi', judul: 'Visi & Misi', isi: String(visi.isi ?? ''), cover: null },
  ]
  for (const page of pages) {
    const mdFile = join(ROOT, 'src/content/halaman', `${page.id}.md`)
    const assetFolder = join(ROOT, 'src/assets/halaman', page.id)
    const markdown = await localiseAssets(await htmlToMarkdown(page.isi), mdFile, assetFolder)
    const cover = page.cover ? await download(page.cover, assetFolder, 'sampul') : undefined
    await mkdir(dirname(mdFile), { recursive: true })
    await writeFile(mdFile, `${frontmatter({ judul: page.judul, sampul: cover ? rel(mdFile, cover) : undefined })}\n${markdown}`)
    console.log('halaman', page.id)
  }
}

async function writeJson (name: string, data: unknown): Promise<void> {
  const file = join(ROOT, 'src/data', `${name}.json`)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`)
  console.log('data', name)
}

async function migrateData (): Promise<void> {
  const dataFile = (name: string) => join(ROOT, 'src/data', `${name}.json`)

  const kantor = await items<Row[]>('kantor', 'sort=id&limit=-1')
  await writeJson('kantor', kantor.map(row => ({ id: String(row.id), nama: row.name, alamat: row.address, lat: row.latitude, lng: row.longitude })))

  // seperti situs lama, seluruh mitra ditampilkan; kolom aktif memudahkan menyembunyikan tanpa menghapus
  const mitra = await items<Row[]>('tempat_pembayaran', 'sort=sort,id&limit=-1&fields=id,name,logo,url,status')
  await writeJson('mitra', await Promise.all(mitra.map(async row => ({
    id: slugify(row.name),
    nama: row.name,
    url: row.url,
    aktif: row.status === 'published',
    logo: rel(dataFile('mitra'), await download(String(row.logo), join(ROOT, 'src/assets/mitra'), String(row.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'), { keepFormat: true })),
  }))))

  const direksi = await items<Row[]>('manajemen_pegawai', 'filter[manajemen][_eq]=direksi&sort=sort,id&fields=id,nama,jabatan,foto')
  await writeJson('direksi', await Promise.all(direksi.map(async row => ({
    id: slugify(row.nama),
    nama: row.nama,
    jabatan: row.jabatan,
    foto: row.foto ? rel(dataFile('direksi'), await download(String(row.foto), join(ROOT, 'src/assets/direksi'), String(row.id))) : null,
  }))))

  const navigasi = await items<Row[]>('butir_navigasi', 'filter[active][_eq]=true&filter[navigasi][pid][_eq]=main&sort=sort,id&deep[children][_sort]=sort,id&fields=title,to,children.title,children.to,children.active')
  const canonical: Record<string, string> = { '/informasi/berita': '/berita', '/informasi/edukasi': '/edukasi' }
  const link = (to: unknown) => canonical[String(to ?? '')] ?? String(to ?? '')
  await writeJson('navigasi', navigasi.map(row => ({
    id: slugify(row.title),
    judul: row.title,
    tautan: row.to ? link(row.to) : null,
    anak: ((row.children as Row[] | undefined) ?? []).filter(child => child.active && child.to).map(child => ({ judul: child.title, tautan: link(child.to) })),
  })))

  // gambar tetap halaman
  await download('8A917A55-EC1A-4166-890A-1FB3AC32E481', join(ROOT, 'src/assets/halaman'), 'sotk', { keepFormat: true })
  await download('C74BDC20-E6AE-423E-BE27-68F220D0F119', join(ROOT, 'src/assets'), 'kantor-pusat')
  const [slide] = await items<Row[]>('korsel', 'filter[status][_eq]=published&sort=sort,id&limit=1&fields=image,title')
  if (slide) {
    await download(String(slide.image), join(ROOT, 'src/assets'), 'hero')
  }
}

await migrateArtikel()
await migrateHalaman()
await migrateData()
console.log('selesai')
