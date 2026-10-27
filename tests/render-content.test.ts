import { describe, expect, it } from 'bun:test'
import { numberId, titleCase } from '../src/lib/format'
import { isHtmlContent, plainText, renderContent } from '../src/lib/render-content'

describe('renderContent', () => {
  it('mengenali HTML editor dan markdown', () => {
    expect(isHtmlContent('<p>halo</p>')).toBe(true)
    expect(isHtmlContent('# Judul\n\nteks')).toBe(false)
  })

  it('merender markdown dengan tabel GFM yang dibungkus', async () => {
    const html = await renderContent('| a | b |\n| - | - |\n| 1 | 2 |')
    expect(html).toContain('<div class="content-table"><table>')
  })

  it('menyaring HTML berbahaya di markdown maupun HTML', async () => {
    for (const source of ['Teks <script>alert(1)</script> <img src=x onerror=alert(1)>', '<p onclick="x()">a</p><iframe src="https://evil.example/x"></iframe>']) {
      const html = await renderContent(source)
      expect(html).not.toMatch(/script|onerror|onclick|evil\.example/i)
    }
  })

  it('membuat gambar dapat diperbesar dan tetap inline', async () => {
    const html = await renderContent('<p><img src="https://cms.tirtapatriot.net/assets/a.jpg" alt="Meter air"></p>')
    expect(html).toContain('<p><span class="content-figure"><button type="button" data-zoom="" aria-label="Perbesar gambar: Meter air">')
    expect(html).toContain('loading="lazy"')
  })

  it('membuka tautan eksternal di tab baru dengan keterangan untuk pembaca layar', async () => {
    const html = await renderContent('[Google](https://google.com) dan [tagihan](/pelanggan/tagihan)')
    expect(html).toContain('<a href="https://google.com" target="_blank" rel="noopener noreferrer">Google<span class="sr-only">')
    expect(html).toContain('<a href="/pelanggan/tagihan">tagihan</a>')
  })

  it('mengembalikan string kosong untuk konten kosong', async () => {
    expect(await renderContent(null)).toBe('')
    expect(await renderContent('   ')).toBe('')
  })
})

describe('plainText', () => {
  it('membuang markup dan memotong di batas kata', () => {
    expect(plainText('<p>Air <strong>bersih</strong> untuk warga</p>')).toBe('Air bersih untuk warga')
    const long = plainText('kata '.repeat(60), 20)
    expect(long.length).toBeLessThanOrEqual(20)
    expect(long.endsWith('…')).toBe(true)
  })
})

describe('format', () => {
  it('mengubah alamat kapital menjadi Title Case', () => {
    expect(titleCase('JL. PERJUANGAN RT.003/011 KOTA BEKASI')).toBe('Jl. Perjuangan RT.003/011 Kota Bekasi')
    expect(titleCase('Sudah Rapi')).toBe('Sudah Rapi')
  })

  it('memformat angka gaya Indonesia', () => {
    expect(numberId('129734')).toBe('129.734')
    expect(numberId('n/a')).toBe('n/a')
  })
})
