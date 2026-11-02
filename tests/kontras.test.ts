import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Token warna dibaca langsung dari @theme di src/styles/global.css agar uji ikut berubah bersama desain. */
const css = readFileSync(join(import.meta.dir, '../src/styles/global.css'), 'utf8')
const token = (name: string): string => {
  const hex = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1]
  if (!hex) {
    throw new Error(`token --color-${name} tidak ditemukan`)
  }
  return hex
}
const WHITE = '#ffffff'

function luminance (hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map(start => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
    .map(channel => (channel <= 0.039_28 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast (a: string, b: string): number {
  const [light = 0, dark = 0] = [luminance(a), luminance(b)].toSorted((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

const color = (name: string): string => (name === 'putih' ? WHITE : token(name))

// [teks, latar, batas minimum]: WCAG 2.2 AA, 4,5:1 untuk teks biasa
const PAIRS: [string, string, number][] = [
  ['pipa', 'putih', 7],
  ['pipa', 'air', 4.5],
  ['pipa', 'kabut', 4.5],
  ['redup', 'putih', 4.5],
  ['redup', 'kabut', 4.5],
  ['redup', 'air', 4.5],
  ['patriot', 'putih', 4.5],
  ['patriot', 'air', 4.5],
  ['patriot', 'kabut', 4.5],
  ['putih', 'patriot', 4.5],
  ['putih', 'patriot-strong', 4.5],
  ['putih', 'pipa', 7],
  ['putih', 'pipa-soft', 4.5],
  ['putih', 'pipa-deep', 7],
  ['emas', 'pipa', 4.5],
  ['emas', 'pipa-deep', 4.5],
  ['emas-soft', 'pipa', 4.5],
  ['pipa-deep', 'emas', 4.5],
  ['pipa-deep', 'emas-soft', 4.5],
  ['lunas', 'putih', 4.5],
  ['lunas', 'lunas-soft', 4.5],
  ['putih', 'lunas', 4.5],
  ['meter', 'putih', 4.5],
  ['meter', 'meter-soft', 4.5],
  ['awas', 'awas-soft', 4.5],
  ['awas', 'putih', 4.5],
]

describe('kontras warna (WCAG AA)', () => {
  for (const [text, background, minimum] of PAIRS) {
    it(`${text} di atas ${background} ≥ ${minimum}:1`, () => {
      expect(contrast(color(text), color(background))).toBeGreaterThanOrEqual(minimum)
    })
  }

  it('biru merek asli hanya untuk aksen: tidak dipakai sebagai teks kecil', () => {
    expect(contrast(token('biru'), WHITE)).toBeLessThan(4.5)
    expect(contrast(token('biru'), WHITE)).toBeGreaterThanOrEqual(3)
  })
})
