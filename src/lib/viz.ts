/**
 * Token visualisasi data. Semua palet sudah divalidasi dengan validate_palette.js (skill dataviz):
 *  - DUA_TINGKAT: satu warna dua tingkat untuk dua ukuran hal yang sama (mis. pengaduan masuk vs selesai)
 *  - RAMP: urutan 5 tingkat untuk besaran (peta pelanggan per kecamatan), terang → gelap
 */
export const AKSEN = '#0B6FB8'
export const DUA_TINGKAT = ['#7DB5E3', '#0B6FB8'] as const
export const RAMP = ['#7DB5E3', '#4E96D2', '#2479BE', '#0B5E9E', '#08406E'] as const

export const GRID = '#E3E9F0'

/** Batas atas sumbu yang "bulat" (1, 2, 2,5, 5 × 10ⁿ) dan langkah ticknya. */
export function niceScale (max: number, ticks = 4): { max: number, step: number } {
  if (max <= 0) {
    return { max: 1, step: 1 }
  }
  const raw = max / ticks
  const power = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map(f => f * power).find(s => s >= raw) ?? raw
  return { max: Math.ceil(max / step) * step, step }
}

const id = new Intl.NumberFormat('id-ID')

export function angka (value: number, digits = 0): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value)
}

/** Ringkas untuk tick sumbu: 1.500 → 1,5 rb; 2.600.000 → 2,6 jt. */
export function ringkas (value: number): string {
  if (value >= 1_000_000) {
    return `${angka(value / 1_000_000, value % 1_000_000 === 0 ? 0 : 1)} jt`
  }
  if (value >= 1000) {
    return `${angka(value / 1000, value % 1000 === 0 ? 0 : 1)} rb`
  }
  return id.format(value)
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

/** "2026-08" → "Agu 26" (sumbu) atau "Agustus 2026" (tooltip/tabel). */
export function bulan (value: string, panjang = false): string {
  const [tahun, nomor] = value.split('-').map(Number)
  const index = (nomor ?? 1) - 1
  return panjang ? `${BULAN_PANJANG[index]} ${tahun}` : `${BULAN[index]} ${String(tahun).slice(2)}`
}

/** Kelas ramp untuk nilai, berdasarkan batas atas tiap kelas (panjang batas = RAMP.length - 1). */
export function kelas (value: number, batas: readonly number[]): number {
  const index = batas.findIndex(limit => value < limit)
  return index === -1 ? batas.length : index
}
