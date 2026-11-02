/**
 * Pencarian global situs (kolom cari di header dan halaman /cari): menu/halaman dan artikel (berita & edukasi).
 * Indeksnya dibuat saat build di /cari.json; pencocokan berjalan di browser tanpa server.
 */

import navigasi from '../data/navigasi.json'

export type Jenis = 'menu' | 'berita' | 'edukasi'

export type Entri = {
  jenis: Jenis
  judul: string
  ringkasan: string
  url: string
  /** kata lain yang biasa dipakai orang untuk mencari halaman ini */
  kata?: string
  /** tanggal terbit artikel (ISO) */
  tanggal?: string
}

/** Halaman dan layanan situs. Tambahkan di sini bila ada halaman baru yang perlu bisa dicari. */
export const MENU: Entri[] = [
  { judul: 'Cek tagihan air', ringkasan: 'Rincian rekening dan tagihan pemakaian air yang belum dibayar.', url: '/pelanggan/tagihan', kata: 'rekening bayar tunggakan nomor pelanggan' },
  { judul: 'Riwayat pemakaian dan pembayaran', ringkasan: 'Grafik pemakaian 12 bulan, rekening yang sudah dibayar, dan bukti pembayaran.', url: '/pelanggan/riwayat', kata: 'histori kuitansi struk bukti bayar' },
  { judul: 'Pengaduan', ringkasan: 'Laporkan air mati, air keruh, atau kendala sambungan rumah, lalu lacak dengan nomor tiket.', url: '/pelanggan/pengaduan', kata: 'komplain keluhan lapor tiket lacak air mati keruh' },
  { judul: 'Lapor kebocoran', ringkasan: 'Laporkan pipa bocor di jalan atau fasilitas umum dengan foto dan titik lokasi.', url: '/pelanggan/lapor-kebocoran', kata: 'pipa bocor jalan meluap' },
  { judul: 'Tarif air dan simulasi tagihan', ringkasan: 'Tarif setiap golongan dan perkiraan tagihan dari pemakaian bulanan.', url: '/pelanggan/tarif', kata: 'harga golongan kubik hitung' },
  { judul: 'Pendaftaran sambungan baru', ringkasan: 'Daftar sambungan air baru secara online dan pantau status permohonan.', url: '/pelanggan/pendaftaran', kata: 'pasang baru daftar sambungan' },
  { judul: 'Catat meter mandiri', ringkasan: 'Laporkan angka meter air sendiri dengan foto dari kamera.', url: '/pelanggan/catat-meter', kata: 'baca meter stan foto' },
  { judul: 'Perubahan data pelanggan', ringkasan: 'Ajukan perubahan alamat, nama pelanggan, dan layanan lain secara online.', url: '/pelanggan/ubah-data', kata: 'ganti nama alamat balik nama' },
  { judul: 'Layanan pelanggan', ringkasan: 'Semua layanan pelanggan dalam satu tempat.', url: '/pelanggan' },
  { judul: 'Gangguan layanan', ringkasan: 'Pekerjaan perbaikan dan gangguan aliran air yang sedang ditangani.', url: '/informasi/gangguan-layanan', kata: 'air mati tidak mengalir pemadaman perbaikan' },
  { judul: 'Tempat pembayaran', ringkasan: 'Bank, mitra, virtual account, dan loket kantor untuk membayar rekening air.', url: '/informasi/tempat-pembayaran', kata: 'bayar loket bank virtual account minimarket' },
  { judul: 'Peta layanan', ringkasan: 'Jaringan pipa, zona layanan, dan lokasi kantor pelayanan.', url: '/informasi/peta-layanan', kata: 'wilayah zona jaringan pipa kecamatan' },
  { judul: 'Kinerja layanan', ringkasan: 'Jumlah pelanggan, penanganan pengaduan, air terjual, dan sambungan baru dalam angka.', url: '/informasi/kinerja-layanan', kata: 'statistik data angka' },
  { judul: 'Berita', ringkasan: 'Kabar kegiatan, kerja sama, dan pengumuman resmi.', url: '/berita', kata: 'kabar pengumuman' },
  { judul: 'Edukasi', ringkasan: 'Panduan menghemat air, merawat instalasi, dan memahami rekening air.', url: '/edukasi', kata: 'tips panduan hemat air' },
  { judul: 'Kebijakan privasi dan ketentuan layanan', ringkasan: 'Kebijakan privasi dan ketentuan layanan digital.', url: '/informasi/privacy-policy', kata: 'privacy policy syarat ketentuan data pribadi' },
  { judul: 'Manajemen', ringkasan: 'Jajaran direksi serta susunan organisasi dan tata kerja.', url: '/perusahaan/manajemen', kata: 'direksi direktur organisasi struktur sotk' },
  { judul: 'Visi & Misi', ringkasan: 'Arah dan komitmen layanan air minum.', url: '/perusahaan/visi-misi' },
  { judul: 'Sejarah', ringkasan: 'Perjalanan melayani air bersih masyarakat Kota Bekasi.', url: '/perusahaan/sejarah', kata: 'profil perusahaan' },
  { judul: 'Kontak', ringkasan: 'Telepon, WhatsApp, email, media sosial, dan unit pelayanan.', url: '/perusahaan/kontak', kata: 'hubungi telepon whatsapp email alamat kantor' },
  { judul: 'Lelang', ringkasan: 'Pengumuman pengadaan barang dan jasa di e-Procurement.', url: navigasi.find(item => item.id === 'lelang')?.tautan ?? '/', kata: 'pelelangan pengadaan tender eproc vendor' },
].map(entry => ({ jenis: 'menu' as const, ...entry }))

/** Huruf kecil tanpa tanda diakritik, hanya huruf/angka dipisah spasi. */
export function normalisasi (text: string): string {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

/**
 * Semua kata kueri harus ditemukan (awal kata) di judul, ringkasan, atau kata lain.
 * Skor: kecocokan di judul lebih berat, menu lebih dulu, lalu artikel terbaru.
 */
export function cari (index: Entri[], query: string, limit = Infinity): Entri[] {
  const terms = normalisasi(query).split(' ').filter(Boolean)
  if (terms.length === 0) {
    return []
  }

  const scored: { entry: Entri, score: number }[] = []
  for (const entry of index) {
    const judul = ` ${normalisasi(entry.judul)}`
    const isi = ` ${normalisasi(`${entry.ringkasan} ${entry.kata ?? ''}`)}`
    let score = 0
    for (const term of terms) {
      if (judul.includes(` ${term}`)) {
        score += 3
      } else if (isi.includes(` ${term}`)) {
        score += 1
      } else {
        score = -1
        break
      }
    }
    if (score < 0) {
      continue
    }
    if (judul.trim() === terms.join(' ')) {
      score += 5
    }
    if (entry.jenis === 'menu') {
      score += 2
    }
    scored.push({ entry, score })
  }

  return scored
    .toSorted((a, b) => b.score - a.score || (b.entry.tanggal ?? '').localeCompare(a.entry.tanggal ?? ''))
    .slice(0, limit)
    .map(item => item.entry)
}
