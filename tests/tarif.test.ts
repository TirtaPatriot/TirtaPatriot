import { describe, expect, it } from 'bun:test'
import { hitungTagihan, TARIF } from '../src/lib/tarif'

const gol = (kode: string) => TARIF.golongan.find(item => item.kode === kode)!
const ADMIN_HALF_INCH = 6000

// angka pembanding dihitung oleh fungsi billing bacameter.sf_hitung_kalkulasi
describe('hitungTagihan', () => {
  it('Rumah Tangga 1, 20 m³', () => {
    const r = hitungTagihan(gol('2A'), ADMIN_HALF_INCH, 20)
    expect(r.air).toBe(89_000)
    expect(r.total).toBe(95_000)
  })

  it('pemakaian di bawah minimal ditagih 10 m³', () => {
    const r = hitungTagihan(gol('2A'), ADMIN_HALF_INCH, 5)
    expect(r.ditagih).toBe(10)
    expect(r.air).toBe(41_000)
    expect(r.total).toBe(47_000)
  })

  it('Rumah Tangga 3, 35 m³ melewati tiga blok', () => {
    const r = hitungTagihan(gol('2C'), ADMIN_HALF_INCH, 35)
    expect(r.blok.map(b => b.m3)).toEqual([10, 10, 15])
    expect(r.air).toBe(365_000)
    expect(r.total).toBe(371_000)
  })

  it('bea materai mulai Rp5 juta', () => {
    const r = hitungTagihan(gol('5C'), 1_235_000, 200)
    expect(r.materai).toBe(10_000)
    expect(r.total).toBe(r.air + r.admin + 10_000)
  })

  it('angka pemakaian tidak valid dianggap nol', () => {
    expect(hitungTagihan(gol('2A'), ADMIN_HALF_INCH, -4).ditagih).toBe(10)
  })
})
