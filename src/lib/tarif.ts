/**
 * Perkiraan tagihan air, mengikuti rumus billing (bacameter.sf_hitung_kalkulasi):
 *  - pemakaian dihitung paling sedikit sebesar pemakaian minimal golongan
 *  - harga progresif per blok: 0–10 m³, 11–20 m³, di atas 20 m³
 *  - ditambah biaya administrasi menurut ukuran meter
 *  - bea materai bila tagihan mencapai batasnya
 * Denda keterlambatan tidak termasuk.
 */
import data from '../data/tarif.json'

export type Golongan = (typeof data.golongan)[number]
export type Meter = (typeof data.meter)[number]

export const TARIF = data

export type Rincian = {
  /** pemakaian yang ditagih (setelah pemakaian minimal) */
  ditagih: number
  blok: { dari: number, sampai: number | null, m3: number, harga: number, biaya: number }[]
  air: number
  admin: number
  materai: number
  total: number
}

export function hitungTagihan (golongan: Golongan, admin: number, pakai: number): Rincian {
  const ditagih = Math.max(Math.max(0, Math.floor(pakai)), golongan.minimal)
  let sisa = ditagih
  let dari = 0
  const blok = data.blok.map(({ sampai }, index) => {
    const lebar = sampai === null ? sisa : Math.min(sisa, sampai - dari)
    const harga = golongan.harga[index] ?? 0
    const baris = { dari: dari + 1, sampai, m3: lebar, harga, biaya: lebar * harga }
    sisa -= lebar
    dari = sampai ?? dari
    return baris
  })

  const air = blok.reduce((sum, baris) => sum + baris.biaya, 0)
  const subtotal = air + admin
  const materai = subtotal >= data.materai.batas ? data.materai.nominal : 0
  return { ditagih, blok, air, admin, materai, total: subtotal + materai }
}

export function rupiah (value: number): string {
  return `Rp${new Intl.NumberFormat('id-ID').format(value)}`
}
