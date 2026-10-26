# tirtapatriot-web

Situs publik Perumda Tirta Patriot Kota Bekasi — https://tirtapatriot.co.id

## Stack

- [Astro 7](https://docs.astro.build/) dengan keluaran statis
- [Tailwind CSS v4](https://tailwindcss.com/) lewat `@tailwindcss/vite`
- TypeScript 7 (kompiler native) untuk pemeriksaan tipe; interaksi di browser memakai TypeScript biasa tanpa framework
- Konten: Astro content collections yang dimuat dari CMS Directus (`cms.tirtapatriot.net`) saat build
- Package manager: bun

## Mulai

```bash
bun install
cp .env.example .env   # isi kunci reCAPTCHA / Chatwoot bila perlu
bun run dev
```

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `bun run dev` | server pengembangan |
| `bun run build` | build statis ke `dist/` |
| `bun run preview` | pratinjau hasil build |
| `bun run typecheck` | `astro sync` lalu `tsc --noEmit` (TypeScript 7) |
| `bun run lint` | oxlint |
| `bun test` | unit test (penyaring konten, format, URL aset) |

## Struktur

- `src/content.config.ts` — koleksi konten: artikel (berita & edukasi), navigasi, kantor, mitra pembayaran, direksi, statistik, halaman profil, gangguan, dokumen legal
- `src/lib/` — akses Directus, render konten CMS yang aman, format tanggal/angka, data perusahaan
- `src/pages/` — rute situs
- `src/components/` — komponen Astro
- `src/scripts/` — skrip browser: cek tagihan, pengaduan, gangguan langsung dari CMS
- `src/styles/global.css` — token desain dan gaya dasar
- `public/_redirects` — pengalihan alamat lama (format Netlify)

## Konten

Konten redaksi tetap dikelola di Directus. Karena situs dibangun statis, **setiap perubahan konten di CMS memerlukan build ulang**: hubungkan webhook Directus (flow saat item dibuat/diubah) ke build hook hosting.

Pengecualian: halaman **Gangguan layanan** dan panel status di beranda memuat ulang data gangguan langsung dari CMS di browser, sehingga tetap terbaru di antara build.

## Variabel lingkungan

Lihat `.env.example`. Semuanya bersifat publik (dibaca di browser):

- `PUBLIC_DIRECTUS_URL` — alamat CMS
- `PUBLIC_API_URL` — API layanan pelanggan untuk tagihan dan pengaduan (bawaan `/api`)
- `PUBLIC_RECAPTCHA_SITE_KEY` — reCAPTCHA v3 untuk formulir
- `PUBLIC_CHATWOOT_WEBSITE_TOKEN`, `PUBLIC_CHATWOOT_BASE_URL` — widget obrolan
