/**
 * Ambil berita dan edukasi yang baru atau berubah dari CMS Directus (cms.tirtapatriot.net), tanpa login:
 *   bun run cms
 *
 * Hanya artikel yang belum ada di src/content/artikel atau yang `date_updated`-nya berbeda dengan `diperbarui`
 * di Markdown yang ditulis ulang (beserta gambarnya); sisanya dibiarkan agar diff tetap kecil. Periksa hasilnya
 * dengan `git status`, lalu commit. Untuk migrasi penuh satu kali, lihat scripts/migrate-directus.ts.
 */
import { existsSync, readFileSync } from 'node:fs'
import { migrateArtikel } from './migrate-directus'

await migrateArtikel((row, mdFile) => {
  if (!existsSync(mdFile)) {
    return true
  }
  const tersimpan = readFileSync(mdFile, 'utf8').match(/^diperbarui: "([^"]*)"/m)?.[1] ?? ''
  return tersimpan !== String(row.date_updated ?? '')
})
console.log('selesai')
