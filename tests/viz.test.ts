import { describe, expect, it } from 'bun:test'
import { bulan, kelas, niceScale, ringkas } from '../src/lib/viz'

describe('viz', () => {
  it('membulatkan skala sumbu', () => {
    expect(niceScale(47_047)).toEqual({ max: 60_000, step: 20_000 })
    expect(niceScale(2_740_125)).toEqual({ max: 3_000_000, step: 1_000_000 })
    expect(niceScale(0)).toEqual({ max: 1, step: 1 })
  })

  it('meringkas angka sumbu', () => {
    expect(ringkas(2_500_000)).toBe('2,5 jt')
    expect(ringkas(3_000_000)).toBe('3 jt')
    expect(ringkas(12_500)).toBe('12,5 rb')
    expect(ringkas(800)).toBe('800')
  })

  it('menamai bulan', () => {
    expect(bulan('2026-08')).toBe('Agu 26')
    expect(bulan('2026-08', true)).toBe('Agustus 2026')
  })

  it('memilih kelas ramp', () => {
    const batas = [1000, 5000, 15_000, 25_000]
    expect(kelas(124, batas)).toBe(0)
    expect(kelas(4022, batas)).toBe(1)
    expect(kelas(47_047, batas)).toBe(4)
  })
})
