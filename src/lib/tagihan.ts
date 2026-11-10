/** Pembantu tampilan cek tagihan: hitungan periode dan ringkasan di kartu total. */

export type KategoriTagihan = { kategori?: string, bulan?: string }

export const KATEGORI: Record<string, string> = { NONAIR: 'Non-air', CICILAN: 'Cicilan' }

export const isAir = (item: KategoriTagihan): boolean => !item.kategori || item.kategori === 'AIR'

/**
 * Kalimat di bawah total. Yang dihitung "periode" hanya rekening air per bulan; tagihan non-air
 * (misalnya denda dari periode sebelumnya) dan cicilan dihitung terpisah, jadi pelanggan dengan satu
 * rekening air plus dua tagihan non-air tertulis "1 periode", bukan "3 periode".
 */
export function ringkasTagihan (items: KategoriTagihan[]): string {
  const air = items.filter(item => isAir(item))
  const lain = items.filter(item => !isAir(item))
  const bulan = new Set(air.map(item => item.bulan).filter(Boolean))
  const periode = bulan.size || air.length

  const jenis = [...new Set(lain.map(item => (KATEGORI[item.kategori ?? ''] ?? 'lain').toLowerCase()))].join(' dan ')
  const tagihanLain = `${lain.length} tagihan ${jenis}`

  if (!periode) {
    return `${tagihanLain} belum dibayar`
  }
  return lain.length ? `${periode} periode belum dibayar, ditambah ${tagihanLain}` : `${periode} periode belum dibayar`
}
