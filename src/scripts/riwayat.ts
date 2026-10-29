/**
 * Riwayat pemakaian dan pembayaran lewat API Open (token layanan dari langkah verifikasi):
 *  - GET /riwayat → { nomor, nama, golongan, rekening: [{ periode, stand_awal, stand_akhir, pakai, tagihan, denda,
 *                     lunas, tanggal_bayar, tempat, cicilan }] }  (24 rekening terakhir, terbaru dulu)
 * Grafik kolom 12 bulan dibangun dengan markup yang sama dengan ColumnChart.astro (tooltip dari charts.ts);
 * bukti pembayaran dicetak dari halaman (Cetak / Simpan sebagai PDF di browser).
 */
import { dateLong, dateTimeShort } from '../lib/format'
import { ADDRESS, SITE_LEGAL_NAME } from '../lib/site'
import { rupiah } from '../lib/tarif'
import { AKSEN, angka, bulan, GRID, niceScale, ringkas } from '../lib/viz'
import { bindChart } from './charts'
import { el, setBusy, showError } from './dom'
import { getSesi, layanan, mountVerifikasi, pesanGalat, SesiBerakhir } from './layanan'
import { bringIntoView, enter } from './motion'

type Rekening = {
  periode: string
  stand_awal: number
  stand_akhir: number
  pakai: number
  tagihan: number
  denda: number
  lunas: boolean
  tanggal_bayar: string | null
  tempat: string | null
  cicilan: boolean
}
type Riwayat = { nomor: string, nama: string, golongan: string | null, rekening: Rekening[] }

const SVG = 'http://www.w3.org/2000/svg'
/** pemakaian dianggap melonjak bila di atas 1,5× rata-rata dan selisihnya ≥ 5 m³ */
const LONJAK = { kali: 1.5, minimal: 5 }

const periodeKey = (periode: string) => `${periode.slice(0, 4)}-${periode.slice(4, 6)}`
const periodeLabel = (periode: string, panjang = true) => bulan(periodeKey(periode), panjang)
const m3 = (value: number) => `${angka(value)} m³`

function svg<K extends keyof SVGElementTagNameMap> (tag: K, attrs: Record<string, string | number>, text?: string): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG, tag)
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, String(value))
  }
  if (text !== undefined) {
    node.textContent = text
  }
  return node
}

/** Grafik kolom satu seri, mengikuti spesifikasi ColumnChart.astro (kolom ≤ 24 px, ujung membulat, satu sumbu). */
function usageChart (items: Rekening[]): HTMLElement {
  const W = 640
  const H = 240
  const pad = { top: 28, right: 8, bottom: 30, left: 44 }
  const plotW = W - pad.left - pad.right
  const plotH = H - pad.top - pad.bottom
  const values = items.map(item => item.pakai)
  const scale = niceScale(Math.max(...values, 1))
  const ticks = Array.from({ length: Math.round(scale.max / scale.step) + 1 }, (_, i) => i * scale.step)
  const band = plotW / items.length
  const barW = Math.min(24, band * 0.62)
  const y = (value: number) => pad.top + plotH - (value / scale.max) * plotH
  const bottom = pad.top + plotH
  const peak = values.indexOf(Math.max(...values))
  const last = items.length - 1

  const chart = svg('svg', { 'viewBox': `0 0 ${W} ${H}`, 'class': 'mt-2 block h-auto w-full overflow-visible', 'role': 'img', 'aria-label': 'Pemakaian air 12 bulan terakhir. Rincian nilai ada di tabel data di bawah grafik.' })
  for (const tick of ticks) {
    chart.append(
      svg('line', { 'x1': pad.left, 'x2': W - pad.right, 'y1': y(tick), 'y2': y(tick), 'stroke': GRID, 'stroke-width': 1 }),
      svg('text', { 'x': pad.left - 8, 'y': y(tick), 'dy': '0.32em', 'text-anchor': 'end', 'class': 'fill-redup text-[11px]' }, ringkas(tick)),
    )
  }
  items.forEach((item, i) => {
    const x = pad.left + band * i + (band - barW) / 2
    const top = y(item.pakai)
    const r = Math.min(4, bottom - top, barW / 2)
    const group = svg('g', { 'class': 'chart-group', 'data-i': i })
    group.append(svg('path', {
      d: item.pakai > 0
        ? `M${x} ${bottom}V${top + r}Q${x} ${top} ${x + r} ${top}H${x + barW - r}Q${x + barW} ${top} ${x + barW} ${top + r}V${bottom}Z`
        : `M${x} ${bottom}H${x + barW}`,
      fill: AKSEN,
      class: 'chart-mark',
    }))
    // label langsung hanya untuk bulan terakhir dan puncak
    if (i === last || i === peak) {
      group.append(svg('text', { 'x': x + barW / 2, 'y': top - 7, 'text-anchor': 'middle', 'class': 'fill-pipa text-[11px] font-semibold' }, angka(item.pakai)))
    }
    group.append(
      svg('text', { 'x': pad.left + band * i + band / 2, 'y': H - 10, 'text-anchor': 'middle', 'class': 'fill-redup text-[11px]' }, periodeLabel(item.periode, false)),
      svg('rect', { 'x': pad.left + band * i, 'y': pad.top, 'width': band, 'height': plotH + 4, 'fill': 'transparent', 'class': 'chart-hit', 'tabindex': 0, 'role': 'img', 'aria-label': `${periodeLabel(item.periode)}: ${m3(item.pakai)}` }),
    )
    chart.append(group)
  })
  chart.append(svg('line', { 'x1': pad.left, 'x2': W - pad.right, 'y1': bottom, 'y2': bottom, 'stroke': '#B8C4D2', 'stroke-width': 1 }))

  const figure = el('figure', 'chart relative')
  figure.dataset.chart = JSON.stringify(items.map(item => ({ label: periodeLabel(item.periode), rows: [{ name: 'Pemakaian', color: AKSEN, value: m3(item.pakai) }] })))
  const table = el('table', 'w-full border-collapse text-left',
    el('thead', '', el('tr', 'border-b border-garis', el('th', 'py-1.5 pr-4 font-semibold', 'Periode'), el('th', 'py-1.5 pl-4 text-right font-semibold', 'Pemakaian'))),
    el('tbody', '', ...items.map(item => el('tr', 'border-b border-garis/60', el('td', 'py-1.5 pr-4', periodeLabel(item.periode)), el('td', 'num py-1.5 pl-4 text-right', m3(item.pakai))))),
  )
  const tip = el('div', 'chart-tip pointer-events-none absolute z-10 hidden min-w-40 rounded-lg bg-white px-3 py-2 text-sm shadow-lift ring-1 ring-garis')
  tip.setAttribute('role', 'status')
  figure.append(
    el('figcaption', '', el('h3', 'text-lg font-bold', 'Pemakaian air 12 bulan terakhir'), el('p', 'mt-1 text-sm text-redup', 'Meter kubik (m³) per periode rekening.')),
    chart,
    el('details', 'mt-3 text-sm', el('summary', 'cursor-pointer font-semibold text-patriot', 'Lihat tabel data'), el('div', 'mt-2 overflow-x-auto', table)),
    tip,
  )
  return figure
}

/** Pemberitahuan bila bulan terakhir melonjak dibanding rata-rata bulan sebelumnya (tanda kebocoran di rumah). */
function lonjakan (items: Rekening[]): HTMLElement | null {
  const latest = items.at(-1)
  const before = items.slice(0, -1).filter(item => item.pakai > 0)
  if (!latest || before.length < 3) {
    return null
  }
  const rata = before.reduce((sum, item) => sum + item.pakai, 0) / before.length
  if (latest.pakai < rata * LONJAK.kali || latest.pakai - rata < LONJAK.minimal) {
    return null
  }
  return el('p', 'notice notice-warn',
    `Pemakaian ${periodeLabel(latest.periode)} sebesar ${m3(latest.pakai)}, jauh di atas rata-rata bulan sebelumnya (${m3(Math.round(rata))}). `
    + 'Bila tidak ada kebutuhan tambahan, periksa kemungkinan kebocoran: tutup semua keran, lalu perhatikan apakah angka meter tetap bergerak.')
}

function kotak (label: string, value: string, note: string): HTMLElement {
  return el('div', '', el('dt', 'text-sm text-redup', label), el('dd', 'num text-2xl font-extrabold', value), el('dd', 'text-sm text-redup', note))
}

function ringkasan (items: Rekening[]): HTMLElement[] {
  const latest = items.at(-1)!
  const rata = items.reduce((sum, item) => sum + item.pakai, 0) / items.length
  const puncak = items.reduce((max, item) => item.pakai >= max.pakai ? item : max, items[0]!)
  return [
    kotak('Bulan terakhir', m3(latest.pakai), periodeLabel(latest.periode)),
    kotak('Rata-rata', m3(Math.round(rata)), `${items.length} bulan terakhir`),
    kotak('Tertinggi', m3(puncak.pakai), periodeLabel(puncak.periode)),
  ]
}

function baris (label: string, value: string): HTMLElement {
  return el('tr', 'border-b border-garis', el('th', 'py-2 pr-6 text-left font-normal text-redup', label), el('td', 'py-2 font-semibold', value))
}

/** Susun bukti pembayaran sebagai elemen cetak di <body>, lalu buka dialog cetak browser. */
function cetakBukti (data: Riwayat, item: Rekening): void {
  document.querySelector('.bukti-cetak')?.remove()
  const bukti = el('section', 'bukti-cetak text-pipa',
    el('p', 'text-lg font-extrabold', SITE_LEGAL_NAME),
    el('p', 'text-sm text-redup', ADDRESS),
    el('h1', 'mt-8 text-2xl font-extrabold', 'Bukti Pembayaran Rekening Air'),
    el('table', 'mt-6 w-full border-collapse text-sm',
      el('tbody', '',
        baris('Nomor pelanggan', data.nomor),
        baris('Nama pelanggan', data.nama),
        baris('Golongan tarif', data.golongan ?? '-'),
        baris('Periode rekening', periodeLabel(item.periode)),
        baris('Stand meter', `${angka(item.stand_awal)} – ${angka(item.stand_akhir)}`),
        baris('Pemakaian', m3(item.pakai)),
        baris('Rekening air', rupiah(item.tagihan)),
        baris('Denda', rupiah(item.denda)),
        baris('Jumlah dibayar', rupiah(item.tagihan + item.denda)),
        baris('Tanggal bayar', dateLong(item.tanggal_bayar)),
        baris('Tempat bayar', item.tempat ?? '-'),
      ),
    ),
    el('p', 'mt-8 text-xs text-redup', `Dicetak dari ${location.host} pada ${dateTimeShort(new Date())} WIB. Bukti ini disusun dari data pembayaran di sistem Perumda Tirta Patriot dan tidak menggantikan struk dari tempat pembayaran.`),
  )
  document.body.append(bukti)
  document.body.classList.add('mencetak-bukti')
  const selesai = () => {
    document.body.classList.remove('mencetak-bukti')
    bukti.remove()
  }
  window.addEventListener('afterprint', selesai, { once: true })
  window.print()
}

function bayarRows (data: Riwayat): HTMLElement[] {
  return data.rekening.map(item => {
    const status = item.lunas
      ? el('span', 'font-semibold text-lunas', `Lunas ${dateLong(item.tanggal_bayar)}`)
      : el('a', 'link font-semibold text-meter', item.cicilan ? 'Dicicil' : 'Belum lunas')
    if (status instanceof HTMLAnchorElement) {
      status.href = '/pelanggan/tagihan'
    }
    let aksi: HTMLElement = el('span', '', '')
    if (item.lunas) {
      const tombol = el('button', 'link text-sm font-semibold', 'Bukti')
      tombol.type = 'button'
      tombol.setAttribute('aria-label', `Cetak bukti pembayaran ${periodeLabel(item.periode)}`)
      tombol.addEventListener('click', () => cetakBukti(data, item))
      aksi = tombol
    }
    return el('tr', 'border-t border-garis',
      el('td', 'px-4 py-3', periodeLabel(item.periode)),
      el('td', 'num px-4 py-3 text-right', m3(item.pakai)),
      el('td', 'num px-4 py-3 text-right', rupiah(item.tagihan + item.denda)),
      el('td', 'px-4 py-3', status),
      el('td', 'px-4 py-3 text-redup', item.tempat ?? '–'),
      el('td', 'px-4 py-3 text-right', aksi),
    )
  })
}

export function initRiwayat (): void {
  const form = document.querySelector<HTMLFormElement>('[data-riwayat-form]')
  const result = document.querySelector<HTMLElement>('[data-riwayat]')
  if (!form || !result) {
    return
  }
  const error = form.querySelector<HTMLElement>(':scope > [data-error]')
  const next = form.querySelector<HTMLButtonElement>('[data-next]')
  const verifikasi = mountVerifikasi(form.querySelector<HTMLElement>('[data-verifikasi]')!)

  const tampilkan = (data: Riwayat) => {
    const urut = data.rekening.toReversed()
    const duaBelas = urut.slice(-12)
    result.querySelector('[data-golongan]')!.textContent = data.golongan ? `Golongan ${data.golongan}` : ''
    if (duaBelas.length) {
      result.querySelector('[data-ringkas]')!.replaceChildren(...ringkasan(duaBelas))
      result.querySelector('[data-pakai-notice]')!.replaceChildren(...[lonjakan(duaBelas)].filter(node => node !== null))
      const chart = usageChart(duaBelas)
      result.querySelector('[data-pakai-chart]')!.replaceChildren(chart)
      bindChart(chart)
    } else {
      // kosongkan ringkasan pelanggan sebelumnya
      result.querySelector('[data-ringkas]')!.replaceChildren()
      result.querySelector('[data-pakai-notice]')!.replaceChildren()
      result.querySelector('[data-pakai-chart]')!.replaceChildren(el('p', 'text-redup', 'Belum ada data pemakaian untuk nomor ini.'))
    }
    result.querySelector('[data-bayar-rows]')!.replaceChildren(...bayarRows(data))
    result.hidden = false
    enter(result)
    bringIntoView(result)
  }

  const muat = async () => {
    showError(error, '')
    setBusy(next, true, 'Memuat…')
    try {
      await verifikasi.lanjut()
      tampilkan(await layanan<Riwayat>('/riwayat'))
    } catch (caught) {
      if (caught instanceof SesiBerakhir) {
        verifikasi.reset()
      }
      result.hidden = true
      showError(error, pesanGalat(caught, 'Riwayat belum dapat dimuat. Silakan coba lagi dalam beberapa saat.'))
    } finally {
      setBusy(next, false)
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault()
    void muat()
  })
  // ganti nomor: riwayat pelanggan sebelumnya tidak dibiarkan tampil
  form.addEventListener('verifikasi:ganti', () => {
    result.hidden = true
  })
  // sesi verifikasi masih berlaku (mis. dari halaman catat meter): langsung tampilkan
  if (getSesi()) {
    void muat()
  }
}
