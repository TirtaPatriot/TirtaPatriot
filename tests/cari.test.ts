import { describe, expect, it } from 'bun:test'
import { cari, type Entri, MENU, normalisasi } from '../src/lib/cari'

const artikel = (judul: string, tanggal: string, ringkasan = ''): Entri => ({ jenis: 'berita', judul, ringkasan, url: `/berita/${normalisasi(judul).replaceAll(' ', '-')}`, tanggal })

const index: Entri[] = [
  ...MENU,
  artikel('Tirta Patriot gelar pelatihan NRW', '2026-03-01'),
  artikel('Pelatihan kepemimpinan manajer', '2026-10-08', 'Sertifikasi manajer dan asisten manajer.'),
]

describe('normalisasi', () => {
  it('huruf kecil, tanpa tanda baca dan diakritik', () => {
    expect(normalisasi('Visi & Misi — Café!')).toBe('visi misi cafe')
  })
})

describe('cari', () => {
  it('kueri kosong tidak menghasilkan apa pun', () => {
    expect(cari(index, '  ')).toEqual([])
  })

  it('menemukan menu lewat kata lain', () => {
    expect(cari(index, 'pelelangan')[0]?.judul).toBe('Lelang')
    expect(cari(index, 'pasang baru')[0]?.url).toBe('/pelanggan/pendaftaran')
  })

  it('semua kata harus cocok', () => {
    expect(cari(index, 'pelatihan nrw').map(entry => entry.judul)).toEqual(['Tirta Patriot gelar pelatihan NRW'])
  })

  it('mencocokkan awal kata, tidak di tengah kata', () => {
    expect(cari(index, 'atih')).toEqual([])
  })

  it('kecocokan judul di atas ringkasan, lalu artikel terbaru lebih dulu', () => {
    expect(cari(index, 'pelatihan').map(entry => entry.tanggal)).toEqual(['2026-10-08', '2026-03-01'])
    expect(cari(index, 'manajer')[0]?.judul).toBe('Pelatihan kepemimpinan manajer')
  })

  it('menu yang judulnya persis sama di urutan pertama', () => {
    expect(cari(index, 'tarif')[0]?.url).toBe('/pelanggan/tarif')
    expect(cari(index, 'berita')[0]?.url).toBe('/berita')
  })

  it('membatasi jumlah hasil', () => {
    expect(cari(index, 'air', 3)).toHaveLength(3)
  })
})
