/** Pembantu tampilan cek tagihan: label baris dan ringkasan di kartu total. */

export type KategoriTagihan = { kategori?: string, jenis?: string, bulan?: string }

export const KATEGORI: Record<string, string> = { NONAIR: 'Non-air', CICILAN: 'Cicilan' }

export const isAir = (item: KategoriTagihan): boolean => !item.kategori || item.kategori === 'AIR'

/** Label di samping periode: baris non-air jenis denda ditulis "Denda", bukan "Non-air". */
export function labelTagihan (item: KategoriTagihan): string | undefined {
  if (isAir(item)) {
    return undefined
  }
  return item.jenis === 'DENDA' ? 'Denda' : KATEGORI[item.kategori ?? ''] ?? 'Lainnya'
}

const FRASA: Record<string, (jumlah: number) => string> = {
  Denda: jumlah => `${jumlah} denda`,
  Cicilan: jumlah => `${jumlah} cicilan`,
  'Non-air': jumlah => `${jumlah} tagihan non-air`,
  Lainnya: jumlah => `${jumlah} tagihan lain`,
}

/**
 * Kalimat di bawah total. Yang dihitung "periode" hanya rekening air per bulan; denda, tagihan non-air,
 * dan cicilan disebut terpisah, jadi pelanggan dengan satu rekening air plus dua denda tertulis
 * "1 periode belum dibayar, ditambah 2 denda", bukan "3 periode".
 */
export function ringkasTagihan (items: KategoriTagihan[]): string {
  const air = items.filter(item => isAir(item))
  const bulan = new Set(air.map(item => item.bulan).filter(Boolean))
  const periode = bulan.size || air.length

  const jumlah = new Map<string, number>()
  for (const item of items) {
    const label = labelTagihan(item)
    if (label) {
      jumlah.set(label, (jumlah.get(label) ?? 0) + 1)
    }
  }
  const lain = [...jumlah].map(([label, banyak]) => (FRASA[label] ?? FRASA['Lainnya']!)(banyak)).join(' dan ')

  if (!periode) {
    return `${lain} belum dibayar`
  }
  return lain ? `${periode} periode belum dibayar, ditambah ${lain}` : `${periode} periode belum dibayar`
}
