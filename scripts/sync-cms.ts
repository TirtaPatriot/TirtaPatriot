/**
 * Ambil konten publik yang baru atau berubah dari CMS Directus, tanpa login:
 *   bun run cms
 *
 * Alamat CMS dari CMS_URL (bawaan https://cms.tirtapatriot.net). Yang disinkronkan:
 * - berita dan edukasi: hanya yang belum ada di src/content/artikel atau yang `date_updated`-nya berbeda
 *   dengan `diperbarui` di Markdown (beserta gambarnya), sisanya dibiarkan agar diff kecil;
 * - direksi (src/data/direksi.json dan fotonya), gambar utama beranda (src/assets/hero.webp),
 *   serta halaman Sejarah dan Visi-Misi (src/content/halaman).
 * Tarif, kantor, kinerja, mitra, navigasi, dan bagan SOTK tidak disentuh (dari ERP atau diubah manual di repo).
 *
 * Dipakai build Netlify (lihat netlify.toml) agar penerbitan di CMS cukup memicu build ulang; lokal, periksa
 * hasilnya dengan `git status` lalu commit. Untuk migrasi penuh satu kali, lihat scripts/migrate-directus.ts.
 */
import { existsSync, readFileSync } from 'node:fs'
import { migrateArtikel, migrateDireksi, migrateHalaman, migrateHero } from './migrate-directus'

await migrateArtikel((row, mdFile) => {
  if (!existsSync(mdFile)) {
    return true
  }
  const tersimpan = readFileSync(mdFile, 'utf8').match(/^diperbarui: "([^"]*)"/m)?.[1] ?? ''
  return tersimpan !== String(row.date_updated ?? '')
})
await migrateDireksi()
await migrateHero()
await migrateHalaman()
console.log('selesai')
