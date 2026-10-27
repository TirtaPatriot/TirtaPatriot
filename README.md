# tirtapatriot-web

Situs publik Perumda Tirta Patriot Kota Bekasi — https://tirtapatriot.co.id

## Stack

- [Astro 7](https://docs.astro.build/) dengan keluaran statis
- [Tailwind CSS v4](https://tailwindcss.com/) lewat `@tailwindcss/vite`
- TypeScript 7 (kompiler native) untuk pemeriksaan tipe; interaksi di browser memakai TypeScript biasa tanpa framework
- Konten: Astro content collections dari Markdown/JSON di repo, ditambah data agregat dari ERP, PostGIS, dan API Informasi Pelanggan
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
| `bun test` | unit test (penyaring konten, rumus tagihan, format, grafik) |
| `bun run data` | perbarui snapshot tarif, kantor, dan kinerja dari ERP (jaringan internal) |

## Struktur

- `src/content.config.ts` — koleksi konten: artikel (berita & edukasi), halaman profil, navigasi, kantor, mitra pembayaran, direksi, gangguan, dokumen legal
- `src/data/` — data referensi dan snapshot operasional (tarif, kantor, kinerja, batas wilayah)
- `src/lib/` — render konten yang aman, rumus tagihan, API Informasi Pelanggan, format tanggal/angka, token grafik
- `src/pages/` — rute situs
- `src/components/` — komponen Astro
- `src/scripts/` — skrip browser: cek tagihan, pengaduan, pendaftaran sambungan baru, verifikasi layanan mandiri, catat meter mandiri (kamera langsung), perubahan data, peta interaktif, gangguan langsung dari API, grafik
- `scripts/` — `export-data.ts` (perbarui snapshot ERP), `migrate-directus.ts` (migrasi satu kali)
- `src/styles/global.css` — token desain dan gaya dasar
- `public/_redirects` — pengalihan alamat lama (format Netlify)

## Sumber konten dan data

Situs tidak lagi bergantung pada CMS Directus (cms.tirtapatriot.net).

| Isi | Sumber | Cara memperbarui |
| --- | --- | --- |
| Berita & edukasi | `src/content/artikel/{berita,edukasi}/*.md`, gambar di `src/assets/artikel/` | tambah/ubah berkas Markdown lalu commit |
| Sejarah, visi-misi, dokumen legal | `src/content/halaman/`, `src/content/legal/` | ubah Markdown lalu commit |
| Navigasi, mitra pembayaran, direksi | `src/data/*.json` | ubah JSON lalu commit |
| Tarif, kantor pelayanan, kinerja layanan | snapshot dari ERP (MSSQL) di `src/data/{tarif,kantor,kinerja}.json` | `bun run data` dari jaringan internal, lalu commit |
| Tempat pembayaran: bank/mitra resmi dan virtual account | snapshot dari ERP (`billing.billing_loket` dengan transaksi 60 hari terakhir, `info_pelanggan.channel`) di `src/data/pembayaran.json`; logo di `src/assets/mitra/<id>.png` | `bun run data`; gerai & aplikasi lain di `src/data/mitra.json` diubah manual |
| Batas kecamatan & zona layanan | snapshot dari PostGIS (`jaringan.bataskecamatan`, `jaringan.bataslayanan`), disederhanakan, di `src/data/geo/` | jarang berubah; ekspor ulang bila batas diperbarui |
| Gangguan layanan | API Informasi Pelanggan (`GET /news`, sama dengan aplikasi Tirta Patriot Mobile) | otomatis: dimuat saat build **dan** langsung di browser |
| Cek tagihan & pengaduan | API layanan pelanggan `https://papi.tirtapatriot.id/web` | – |
| Pendaftaran sambungan baru | API Informasi Pelanggan (`/files/upload`, `/new-customer/v2/insert`, `/new-customer/tracking`) | – |
| Catat meter mandiri, perubahan data pelanggan | API Open `/web/akses`, `/web/catat-meter`, `/web/pengajuan` (repo TirtaPatriot/Open, branch `main`). Verifikasi: nomor + nama + jumlah pembayaran terakhir; token 30 menit di `sessionStorage`. Catat meter butuh SP `bacameter.sp_catat_meter_mandiri_*` (lihat `sql/` di repo Open) | – |
| Jaringan pipa | vector tile PostGIS function layer `publik.pipa` (hanya garis dan diameter) dari `https://tile.api.tirtapatriot.com`, di atas peta dasar OpenFreeMap | langsung dari server tile |

`scripts/migrate-directus.ts` adalah skrip migrasi satu kali dari Directus, disimpan sebagai dokumentasi.

### Memperbarui data dari ERP

```bash
MSSQL_SERVER=… MSSQL_USER=… MSSQL_PASSWORD=… MSSQL_DATABASE=erp bun run data
```

Gunakan akun baca-saja. Skrip hanya membaca agregat (jumlah per kecamatan, per bulan, dsb.), tidak ada data pelanggan perorangan. Cocok dijadwalkan bulanan dari server internal (mis. Dokploy) yang lalu meng-commit perubahan ke repo sehingga situs ter-build ulang.

## Docker

Image dua tahap: Bun membangun situs, lalu nginx menyajikan berkas statis. Pengalihan alamat lama
dibangkitkan otomatis dari `public/_redirects`, sehingga sama dengan di Netlify.

```bash
docker build -t tirtapatriot-web \
  --build-arg PUBLIC_RECAPTCHA_SITE_KEY=… \
  --build-arg PUBLIC_CHATWOOT_WEBSITE_TOKEN=… \
  --build-arg PUBLIC_CHATWOOT_BASE_URL=… .
docker run -p 8080:80 tirtapatriot-web
```

Container mendengarkan port 80 dan menyediakan `/healthz` untuk pemeriksaan kesehatan. TLS ditangani proxy di depannya (mis. Traefik pada Dokploy).

## Variabel lingkungan

Lihat `.env.example`. Variabel `PUBLIC_*` ditanam saat build dan terlihat oleh pengunjung:

- `PUBLIC_API_URL` — API layanan pelanggan untuk tagihan dan pengaduan (bawaan `https://papi.tirtapatriot.id/web`)
- `PUBLIC_INFO_PELANGGAN_API` — API Informasi Pelanggan untuk gangguan dan pendaftaran sambungan baru (bawaan `https://pelanggan.api.tirtapatriot.co`)
- `PUBLIC_BASEMAP_STYLE`, `PUBLIC_PIPA_TILES` — peta dasar dan vector tile jaringan pipa untuk peta interaktif
- `PUBLIC_RECAPTCHA_SITE_KEY` — site key reCAPTCHA v3 untuk cek tagihan dan pengaduan (bawaan di Dockerfile: key situs saat ini). Domain situs harus terdaftar pada key tersebut di Google Cloud console

Di Dokploy, isi variabel `PUBLIC_*` pada **Build-time Arguments**, bukan pada Environment biasa: nilainya ditanam saat build.
- `PUBLIC_CHATWOOT_WEBSITE_TOKEN`, `PUBLIC_CHATWOOT_BASE_URL` — widget obrolan

Variabel `MSSQL_*` hanya untuk `bun run data` dari jaringan internal dan tidak boleh ikut ke build situs.
