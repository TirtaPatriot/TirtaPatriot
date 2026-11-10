import { describe, expect, it } from 'bun:test'
import { ringkasTagihan } from '../src/lib/tagihan'

describe('ringkasTagihan', () => {
  it('satu rekening air dan dua tagihan non-air tidak dihitung tiga periode', () => {
    const items = [{ bulan: 'Okt 2026' }, { kategori: 'NONAIR', bulan: 'Okt 2026' }, { kategori: 'NONAIR', bulan: 'Okt 2026' }]
    expect(ringkasTagihan(items)).toBe('1 periode belum dibayar, ditambah 2 tagihan non-air')
  })

  it('menghitung periode air per bulan', () => {
    expect(ringkasTagihan([{ kategori: 'AIR', bulan: 'Agu 2026' }, { bulan: 'Sep 2026' }, { bulan: 'Okt 2026' }])).toBe('3 periode belum dibayar')
  })

  it('bulan yang sama dihitung sekali', () => {
    expect(ringkasTagihan([{ bulan: 'Okt 2026' }, { bulan: 'Okt 2026' }])).toBe('1 periode belum dibayar')
  })

  it('menyebut cicilan dan non-air bersama', () => {
    const items = [{ bulan: 'Okt 2026' }, { kategori: 'CICILAN', bulan: 'Okt 2026' }, { kategori: 'NONAIR', bulan: 'Okt 2026' }]
    expect(ringkasTagihan(items)).toBe('1 periode belum dibayar, ditambah 2 tagihan cicilan dan non-air')
  })

  it('hanya tagihan non-air tanpa rekening air', () => {
    expect(ringkasTagihan([{ kategori: 'NONAIR', bulan: 'Okt 2026' }])).toBe('1 tagihan non-air belum dibayar')
  })
})
