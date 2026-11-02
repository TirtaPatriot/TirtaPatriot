/**
 * Buat ulang gambar pratinjau tautan (Open Graph, 1200×630 JPEG):
 *   bun run og
 *
 * 1. src/assets/og-default.jpg: foto utama beranda (src/assets/hero.webp) dan logo, dengan judul dan ajakan cek tagihan yang sama
 *    dengan hero beranda (dipakai beranda dan halaman tanpa kartu sendiri).
 * 2. src/assets/og/<jalur>.jpg: satu kartu per halaman layanan, informasi, dan perusahaan, dengan judul dan
 *    deskripsi halaman itu. Judul dan deskripsi dibaca dari hasil build di dist/ (jalankan `bun run build`
 *    dulu), jadi tidak ada teks ganda yang perlu dirawat. Base.astro memilih kartu dari jalur URL.
 *
 * Huruf Plus Jakarta Sans (TTF) diunduh dari Google Fonts saat dijalankan, jadi butuh internet.
 * Periksa hasilnya, lalu commit.
 */
import { Resvg } from '@resvg/resvg-js'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = join(import.meta.dir, '..')
const OUT = join(ROOT, 'src/assets/og-default.jpg')
const OUT_DIR = join(ROOT, 'src/assets/og')
const DIST = join(ROOT, 'dist')
const W = 1200
const H = 630

// warna dari @theme di src/styles/global.css
const C = {
  pipa: '#0a3d5f',
  pipaDeep: '#062a43',
  patriot: '#0098da',
  emas: '#fff212',
  emasSoft: '#fff88f',
}

const TEXT = {
  judul: ['Berapa tagihan', 'air Anda bulan ini?'],
  lead: ['Cek tagihan, lapor gangguan, dan info', 'layanan air bersih Kota Bekasi.'],
  tombol: 'Cek tagihan',
  alamat: 'web.tirtapatriot.id',
}

/** TTF statis per ketebalan, disimpan di dir; UA lama membuat Google Fonts mengirim TTF, bukan WOFF2 */
async function font (dir: string, weight: number): Promise<string> {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@${weight}`, {
    headers: { 'User-Agent': 'Mozilla/4.0' },
  }).then(res => res.text())
  const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1]
  if (!url) {
    throw new Error(`TTF Plus Jakarta Sans ${weight} tidak ditemukan`)
  }
  const file = join(dir, `plus-jakarta-sans-${weight}.ttf`)
  await writeFile(file, Buffer.from(await (await fetch(url)).arrayBuffer()))
  return file
}

const png = (buffer: Buffer) => `data:image/png;base64,${buffer.toString('base64')}`

// foto utama beranda (hero.webp, dari carousel CMS): bagian tengah gedung, dipotong tegak untuk bingkai tetesan
const photo = await sharp(join(ROOT, 'src/assets/hero.webp'))
  .extract({ left: 480, top: 0, width: 700, height: 821 })
  .resize(520, 600, { fit: 'cover' })
  .png()
  .toBuffer()

const LOGO_H = 58
const logo = await sharp(join(ROOT, 'src/assets/logo-wordmark.png')).resize({ height: LOGO_H }).png().toBuffer()
const logoW = (await sharp(logo).metadata()).width ?? 180

// tetesan seperti logo, bentuk yang sama dengan clipPath #tetesan di beranda, dalam kotak 520×600
const DROP = 'M260 0 C312 96 520 252 520 396 C520 522 406 600 260 600 C114 600 0 522 0 396 C0 252 208 96 260 0 Z'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="cahaya" cx="0.88" cy="-0.1" r="0.9">
      <stop offset="0" stop-color="${C.patriot}" stop-opacity="0.75"/>
      <stop offset="1" stop-color="${C.patriot}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="tetesan"><path d="${DROP}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.pipa}"/>
  <rect width="${W}" height="${H}" fill="url(#cahaya)"/>

  <g transform="translate(650 14)">
    <path d="${DROP}" transform="translate(18 12)" fill="${C.patriot}" fill-opacity="0.28"/>
    <image href="${png(photo)}" width="520" height="600" clip-path="url(#tetesan)" preserveAspectRatio="xMidYMid slice"/>
  </g>

  <!-- logo berwarna biru tua, perlu alas putih agar terbaca -->
  <rect x="64" y="56" width="${logoW + 32}" height="${LOGO_H + 24}" rx="14" fill="#ffffff"/>
  <image href="${png(logo)}" x="80" y="68" width="${logoW}" height="${LOGO_H}"/>

  <text font-family="Plus Jakarta Sans" font-weight="800" font-size="66" fill="#ffffff" letter-spacing="-1.5">
    <tspan x="64" y="250">${TEXT.judul[0]}</tspan>
    <tspan x="64" y="328">${TEXT.judul[1]}</tspan>
  </text>
  <text font-family="Plus Jakarta Sans" font-weight="500" font-size="27" fill="#ffffff" fill-opacity="0.82">
    <tspan x="64" y="388">${TEXT.lead[0]}</tspan>
    <tspan x="64" y="424">${TEXT.lead[1]}</tspan>
  </text>

  <rect x="64" y="476" width="304" height="76" rx="14" fill="${C.emas}"/>
  <text x="96" y="525" font-family="Plus Jakarta Sans" font-weight="800" font-size="30" fill="${C.pipaDeep}">${TEXT.tombol}</text>
  <path d="M292 514 h40 m-15 -15 l15 15 l-15 15" stroke="${C.pipaDeep}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="392" y="524" font-family="Plus Jakarta Sans" font-weight="700" font-size="26" fill="${C.emasSoft}">${TEXT.alamat}</text>
</svg>`

// resvg-js hanya membaca huruf dari berkas, bukan buffer
const fontDir = await mkdtemp(join(tmpdir(), 'og-font-'))
const fontFiles = await Promise.all([500, 700, 800].map(weight => font(fontDir, weight)))

async function render (markup: string, file: string): Promise<void> {
  const rendered = new Resvg(markup, {
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Plus Jakarta Sans' },
    fitTo: { mode: 'width', value: W },
  }).render().asPng()
  await sharp(rendered).flatten({ background: C.pipa }).jpeg({ quality: 86, mozjpeg: true }).toFile(file)
  console.log('ditulis', file)
}

await render(svg, OUT)

// ---- kartu per halaman -------------------------------------------------------------------------------

const escape = (value: string): string => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const decode = (value: string): string => value.replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')

/** Bungkus teks per baris menurut perkiraan lebar (huruf), maksimal `lines` baris, dipotong dengan elipsis. */
function wrap (text: string, perLine: number, lines: number): string[] {
  const out: string[] = []
  let line = ''
  const words = text.split(/\s+/)
  for (const [index, word] of words.entries()) {
    if (line && `${line} ${word}`.length > perLine) {
      out.push(line)
      line = word
      if (out.length === lines) {
        break
      }
    } else {
      line = line ? `${line} ${word}` : word
    }
    if (index === words.length - 1) {
      out.push(line)
    }
  }
  const clipped = out.slice(0, lines)
  if (out.length > lines || (out.length === lines && words.join(' ').length > clipped.join(' ').length)) {
    clipped[lines - 1] = `${(clipped[lines - 1] ?? '').replace(/[\s,.;:]+$/, '')}…`
  }
  return clipped
}

type Kartu = { path: string, judul: string, deskripsi: string }

/** Halaman yang punya kartu sendiri: jalur sitemap sedalam satu atau dua bagian, bukan artikel. */
async function halaman (): Promise<Kartu[]> {
  const sitemap = await readFile(join(DIST, 'sitemap-0.xml'), 'utf8')
  const jalur = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(match => new URL(match[1] ?? '').pathname.replace(/^\/|\/$/g, ''))
    .filter(path => path && /^(pelanggan|informasi|perusahaan)(\/[^/]+)?$|^(berita|edukasi)$/.test(path))
  const result: Kartu[] = []
  for (const path of jalur) {
    const html = await readFile(join(DIST, path, 'index.html'), 'utf8')
    const judul = decode(html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ?? '')
    const deskripsi = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '')
    if (judul) {
      result.push({ path, judul, deskripsi })
    }
  }
  return result
}

if (existsSync(join(DIST, 'sitemap-0.xml'))) {
  await mkdir(OUT_DIR, { recursive: true })
  for (const kartu of await halaman()) {
    const judul = wrap(kartu.judul, 14, 3)
    const baris = 72
    const mulai = 222
    const deskripsiY = mulai + (judul.length - 1) * baris + 58
    const deskripsi = wrap(kartu.deskripsi, 38, 3)
    // alamat lengkap hanya bila muat di kiri tetesan (±34 huruf), selain itu cukup domain
    const lengkap = `${TEXT.alamat}/${kartu.path}`
    const alamat = lengkap.length <= 34 ? lengkap : TEXT.alamat
    const halamanSvg = svg
      // ganti judul, deskripsi, dan tombol bawaan; latar, tetesan, dan logo tetap
      .replace(/<text font-family="Plus Jakarta Sans" font-weight="800" font-size="66"[\s\S]*$/, `<text font-family="Plus Jakarta Sans" font-weight="800" font-size="60" fill="#ffffff" letter-spacing="-1.2">
    ${judul.map((text, index) => `<tspan x="64" y="${mulai + index * baris}">${escape(text)}</tspan>`).join('\n    ')}
  </text>
  <text font-family="Plus Jakarta Sans" font-weight="500" font-size="26" fill="#ffffff" fill-opacity="0.85">
    ${deskripsi.map((text, index) => `<tspan x="64" y="${deskripsiY + index * 36}">${escape(text)}</tspan>`).join('\n    ')}
  </text>
  <rect x="64" y="540" width="6" height="36" rx="3" fill="${C.emas}"/>
  <text x="84" y="568" font-family="Plus Jakarta Sans" font-weight="700" font-size="26" fill="${C.emasSoft}">${escape(alamat)}</text>
</svg>`)
    await render(halamanSvg, join(OUT_DIR, `${kartu.path.replaceAll('/', '-')}.jpg`))
  }
} else {
  console.log('dist/ belum ada: kartu per halaman dilewati (jalankan `bun run build` lebih dulu)')
}

await rm(fontDir, { recursive: true })
