/**
 * Perbarui snapshot data operasional situs dari database ERP (MSSQL), hanya agregat:
 *   MSSQL_SERVER=... MSSQL_USER=... MSSQL_PASSWORD=... bun scripts/export-data.ts
 *
 * Menulis src/data/tarif.json, src/data/kantor.json, dan src/data/kinerja.json. Jalankan dari jaringan
 * internal dengan akun baca-saja (mis. mcp_readonly_user), lalu commit hasilnya; build situs berikutnya
 * memakai data baru. Query di bawah sama dengan yang dipakai saat data pertama kali diambil.
 * Tidak ada data pelanggan perorangan yang dibaca ke luar database.
 */
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sql from 'mssql'

const ROOT = join(import.meta.dir, '..')

const env = (name: string, fallback?: string) => {
  const value = process.env[name] ?? fallback
  if (value === undefined) {
    throw new Error(`variabel lingkungan ${name} belum diisi`)
  }
  return value
}

const pool = await sql.connect({
  server: env('MSSQL_SERVER'),
  port: Number(env('MSSQL_PORT', '1433')),
  user: env('MSSQL_USER'),
  password: env('MSSQL_PASSWORD'),
  database: env('MSSQL_DATABASE', 'erp'),
  options: { encrypt: env('MSSQL_ENCRYPT', 'false') === 'true', trustServerCertificate: true },
  requestTimeout: 120_000,
})

async function rows<T> (query: string): Promise<T[]> {
  return (await pool.request().query<T>(query)).recordset
}

async function write (name: string, data: unknown): Promise<void> {
  await writeFile(join(ROOT, 'src/data', `${name}.json`), `${JSON.stringify(data, null, 2)}\n`)
  console.log('ditulis', name)
}

const diambil = new Date().toISOString()

// golongan publik (status aktif); golongan khusus/program tidak dicantumkan di situs
const GOLONGAN_PUBLIK = ['1A', '1B', '2A', '2B', '2C', '2D', '3A', '4A', '4B', '4C', '5A', '5B', '5C']

type TarifRow = { kode: string, nama: string, kelompok: string, minimal: number, h1: number, h2: number, h3: number, denda: number | null, persen: number | null, perjanjian: boolean }
const tarif = await rows<TarifRow>(`
  SELECT RTRIM(g.kode) kode, g.nama, kt.nama kelompok, ta.minimal_pemakaian minimal,
         ta.harga_air1 h1, ta.harga_air2 h2, ta.harga_air3 h3, g.denda_1 denda, g.persentase_denda persen, g.perjanjian
  FROM billing.golongan_tarif g
  JOIN billing.tarif_air ta ON ta.id_tarif = g.id AND ta.status_aktif = 1
  JOIN billing.sk_tarif sk ON sk.id = ta.id_sk AND sk.status = 1
  LEFT JOIN billing.kelompok_tarif kt ON kt.kode = g.inisial
  WHERE g.status = 1
  ORDER BY RTRIM(g.kode)`)

type MeterRow = { size: string, admin: number }
const meter = await rows<MeterRow>(`
  SELECT RTRIM(ws.size) size, MAX(t.biaya_admin) admin
  FROM billing.watermeter_size ws
  JOIN billing.tarif_watermeter_adm t ON t.watermetersize_id = ws.id
  WHERE ws.id BETWEEN 1 AND 11 OR ws.id IN (16, 17)
  GROUP BY ws.id, ws.size ORDER BY ws.id`)

const UKURAN: Record<string, string> = { '0.50': '1/2', '0.75': '3/4', '1.00': '1', '1.25': '1 1/4', '1.50': '1 1/2', '1.75': '1 3/4', '2.00': '2', '3.00': '3', '4.00': '4', '6.00': '6', '8.00': '8', '12.00': '12', '16.00': '16' }

await write('tarif', {
  sumber: 'erp.billing.golongan_tarif, tarif_air, sk_tarif (status aktif); rumus sesuai bacameter.sf_hitung_kalkulasi',
  diambil,
  blok: [{ sampai: 10 }, { sampai: 20 }, { sampai: null }],
  golongan: tarif.filter(row => GOLONGAN_PUBLIK.includes(row.kode)).map(row => ({
    kode: row.kode,
    nama: row.nama,
    kelompok: row.kelompok,
    minimal: row.minimal,
    harga: [row.h1, row.h2, row.h3],
    denda: row.perjanjian ? null : row.denda,
    dendaPersen: row.perjanjian ? row.persen : null,
  })),
  meter: meter.map(row => ({ ukuran: UKURAN[row.size] ?? row.size, admin: row.admin })),
  materai: { batas: 5_000_000, nominal: 10_000 },
})

type KantorRow = { id: number, nama: string, alamat: string, hari: string, jam: string, telepon: string, lat: number, lng: number }
const kantor = await rows<KantorRow>(`
  SELECT id, nama, alamat, hari_operasional hari, waktu_operasional jam, nomor_telepon telepon, latitude lat, longitude lng
  FROM info_pelanggan.cabang WHERE deleted_at IS NULL ORDER BY id`)

const ZONA: Record<string, number> = { SATU: 1, DUA: 2, TIGA: 3, EMPAT: 4, LIMA: 5 }
const titleCase = (text: string) => text.toLowerCase().replace(/(^|[\s(])([a-z])/g, (_, p: string, c: string) => p + c.toUpperCase()).replace(/\bMpp\b/, 'MPP')
await write('kantor', kantor.map(row => ({
  id: String(row.id),
  nama: titleCase(row.nama.trim()),
  alamat: row.alamat.trim().replace(/, Indonesia$/, ''),
  hari: row.hari.trim().replace(/\s*-\s*/, '–'),
  jam: row.jam.trim().replaceAll(':', '.').replace(/\s*-\s*/, '–'),
  telepon: row.telepon.trim(),
  lat: row.lat,
  lng: row.lng,
  zona: ZONA[/ZONA (\w+)/.exec(row.nama.toUpperCase())?.[1] ?? ''] ?? null,
})))

const kecamatan = await rows<{ nama: string, jumlah: number }>(`
  SELECT k.nama, COUNT(*) jumlah FROM billing.customer c
  JOIN billing.kecamatan k ON k.id = c.id_kecamatan
  WHERE c.status_pelanggan = 1 GROUP BY k.nama ORDER BY jumlah DESC`)

const kelompok = await rows<{ nama: string, jumlah: number }>(`
  SELECT kt.nama, COUNT(*) jumlah FROM billing.customer c
  JOIN billing.golongan_tarif g ON g.id = c.id_tarif
  JOIN billing.kelompok_tarif kt ON kt.kode = g.inisial
  WHERE c.status_pelanggan = 1 GROUP BY kt.nama ORDER BY jumlah DESC`)

const [{ aktif }] = await rows<{ aktif: number }>('SELECT COUNT(*) aktif FROM billing.customer WHERE status_pelanggan = 1') as [{ aktif: number }]

// waktu penyelesaian sebelum Juli 2026 tidak andal (realisasi dientri belakangan)
const aduan = await rows<{ bulan: string, masuk: number, selesai: number, medianHari: number, dalam3Hari: number }>(`
  WITH s AS (
    SELECT id_pengaduan, MIN(CAST(tanggal_realisasi AS datetime) + CAST(waktu_realisasi AS datetime)) t_selesai
    FROM pengaduan.realisasi WHERE status_insert = 1 GROUP BY id_pengaduan),
  d AS (
    SELECT FORMAT(p.tanggal, 'yyyy-MM') bulan, p.status_pengaduan,
           DATEDIFF(HOUR, CAST(p.tanggal AS datetime) + CAST(p.waktu AS datetime), s.t_selesai) / 24.0 hari
    FROM pengaduan.pengaduan_data p LEFT JOIN s ON s.id_pengaduan = p.id
    WHERE p.tanggal >= '2026-07-01'),
  m AS (
    SELECT bulan, COUNT(*) masuk, SUM(CASE WHEN status_pengaduan = 'Closed' THEN 1 ELSE 0 END) selesai,
           SUM(CASE WHEN hari >= 0 AND hari <= 3 THEN 1 ELSE 0 END) * 1.0 / NULLIF(SUM(CASE WHEN hari >= 0 THEN 1 ELSE 0 END), 0) dalam3Hari
    FROM d GROUP BY bulan)
  SELECT m.*, (SELECT TOP 1 PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY hari) OVER () FROM d WHERE d.bulan = m.bulan AND hari >= 0) medianHari
  FROM m ORDER BY bulan`)

const jenis = await rows<{ nama: string, persen: number }>(`
  SELECT TOP 8 j.nama, CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () AS decimal(5, 1)) persen
  FROM pengaduan.pengaduan_data p JOIN pengaduan.jenis_pengaduan j ON j.id = p.jenis_pengaduan
  WHERE p.tanggal >= '2026-07-01' GROUP BY j.nama ORDER BY COUNT(*) DESC`)

const terjual = await rows<{ periode: number, m3: number, rekening: number }>(`
  SELECT TOP 12 periode, SUM(CAST(pakai AS bigint)) m3, COUNT(*) rekening
  FROM billing.billing GROUP BY periode ORDER BY periode DESC`)

const aktivasi = await rows<{ bulan: string, jumlah: number }>(`
  SELECT FORMAT(tanggal_aktivasi, 'yyyy-MM') bulan, COUNT(*) jumlah FROM billing.customer
  WHERE tanggal_aktivasi >= DATEADD(MONTH, -12, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
  GROUP BY FORMAT(tanggal_aktivasi, 'yyyy-MM') ORDER BY bulan`)

const sentence = (text: string) => text.charAt(0) + text.slice(1).toLowerCase().replace(/\s+/g, ' ')
const round = (value: number, digits: number) => Math.round(Number(value) * 10 ** digits) / 10 ** digits
const periode = (value: number) => `${String(value).slice(0, 4)}-${String(value).slice(4)}`

await write('kinerja', {
  diambil,
  sumber: 'erp.billing (customer, billing), erp.pengaduan (pengaduan_data, realisasi, jenis_pengaduan); agregat saja',
  pelanggan: {
    aktif: Number(aktif),
    definisi: 'billing.customer.status_pelanggan = 1',
    kelompok: kelompok.map(row => ({ nama: row.nama, jumlah: Number(row.jumlah) })),
    kecamatan: kecamatan.map(row => ({ nama: row.nama, jumlah: Number(row.jumlah) })),
  },
  pengaduan: {
    catatan: 'Data pengaduan dimulai 1 Januari 2026; waktu penyelesaian Januari–Juni tidak andal (realisasi dientri belakangan) sehingga hanya Juli dan seterusnya yang ditampilkan.',
    bulanan: aduan.map(row => ({ bulan: row.bulan, masuk: Number(row.masuk), selesai: Number(row.selesai), medianHari: round(row.medianHari, 1), dalam3Hari: round(row.dalam3Hari, 3) })),
    bulanBerjalan: new Date().toISOString().slice(0, 7),
    jenis: jenis.map(row => ({ nama: sentence(row.nama), persen: Number(row.persen) })),
    periodeJenis: 'sejak Juli 2026',
  },
  airTerjual: {
    catatan: 'Mulai periode Agustus 2026 termasuk pelanggan wilayah Poncol dan Pondok Ungu yang diambil alih pada 20 Juli 2026.',
    bulanan: terjual.toReversed().map(row => ({ periode: periode(row.periode), m3: Number(row.m3), rekening: Number(row.rekening) })),
  },
  sambunganBaru: {
    catatan: 'Desember 2025 memuat aktivasi massal dari pemindahan data.',
    bulanan: aktivasi.map(row => ({ bulan: row.bulan, jumlah: Number(row.jumlah) })),
  },
})

await pool.close()
console.log('selesai')
