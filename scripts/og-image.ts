/**
 * Buat ulang gambar pratinjau tautan bawaan (Open Graph, 1200×630 JPEG):
 *   bun run og
 *
 * Menulis src/assets/og-default.jpg dari foto kantor pusat dan logo, dengan judul dan ajakan cek tagihan
 * yang sama dengan hero beranda. Huruf Plus Jakarta Sans (TTF) diunduh dari Google Fonts saat dijalankan,
 * jadi butuh internet. Periksa hasilnya, lalu commit; Base.astro memakainya untuk halaman tanpa gambar sendiri.
 */
import { Resvg } from '@resvg/resvg-js'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = join(import.meta.dir, '..')
const OUT = join(ROOT, 'src/assets/og-default.jpg')
const W = 1200
const H = 630

// warna dari @theme di src/styles/global.css
const C = {
  pipa: '#0a2a5e',
  pipaDeep: '#061d45',
  patriot: '#0b6fb8',
  aqua: '#3cc4f0',
  aquaSoft: '#a9e6fa',
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

// gedung saja (bagian kiri foto), dipotong tegak untuk bingkai tetesan
const photo = await sharp(join(ROOT, 'src/assets/kantor-pusat.webp'))
  .extract({ left: 230, top: 0, width: 760, height: 655 })
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
    <path d="${DROP}" transform="translate(18 12)" fill="${C.aqua}" fill-opacity="0.28"/>
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

  <rect x="64" y="476" width="304" height="76" rx="14" fill="${C.aqua}"/>
  <text x="96" y="525" font-family="Plus Jakarta Sans" font-weight="800" font-size="30" fill="${C.pipaDeep}">${TEXT.tombol}</text>
  <path d="M292 514 h40 m-15 -15 l15 15 l-15 15" stroke="${C.pipaDeep}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="392" y="524" font-family="Plus Jakarta Sans" font-weight="700" font-size="26" fill="${C.aquaSoft}">${TEXT.alamat}</text>
</svg>`

// resvg-js hanya membaca huruf dari berkas, bukan buffer
const fontDir = await mkdtemp(join(tmpdir(), 'og-font-'))
const rendered = new Resvg(svg, {
  font: {
    fontFiles: await Promise.all([500, 700, 800].map(weight => font(fontDir, weight))),
    loadSystemFonts: false,
    defaultFontFamily: 'Plus Jakarta Sans',
  },
  fitTo: { mode: 'width', value: W },
}).render().asPng()
await rm(fontDir, { recursive: true })

await sharp(rendered).flatten({ background: C.pipa }).jpeg({ quality: 86, mozjpeg: true }).toFile(OUT)
console.log('ditulis', OUT)
