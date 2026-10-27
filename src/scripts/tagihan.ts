/** Cek tagihan: kirim nomor pelanggan ke API lalu tampilkan rincian tagihan. */
import { api, ApiError, recaptchaToken, warmRecaptcha } from './api'
import { mountBayar } from './bayar-online'
import { el, masked, setBusy, showError } from './dom'

type Pelanggan = {
  nomor?: string
  nama?: string
  alamat?: string
  kecamatan?: string
  kelurahan?: string
  _nonaktif?: boolean
}

type ItemTagihan = {
  kategori?: string
  bulan?: string
  stan_awal?: number | string
  stan_akhir?: number | string
  kubik?: number | string
  air?: number | string
  administrasi?: number | string
  denda?: number | string
  lainnya?: number | string
  total?: number | string
}

type ResponseTagihan = {
  pelanggan?: Pelanggan
  tagihan?: ItemTagihan[]
  total?: string | number
}

const KATEGORI: Record<string, string> = { NONAIR: 'Non-air', CICILAN: 'Cicilan' }

const isAir = (item: ItemTagihan) => !item.kategori || item.kategori === 'AIR'
const show = (value: unknown) => (value === undefined || value === null || value === '' ? '–' : String(value))

function customerBlock (pelanggan: Pelanggan = {}): HTMLElement {
  const alamat = masked([pelanggan.alamat, pelanggan.kelurahan, pelanggan.kecamatan].filter(Boolean).join(', ')) || '–'
  const rows: [string, string][] = [
    ['Nomor pelanggan', show(pelanggan.nomor)],
    ['Nama', masked(show(pelanggan.nama))],
    ['Alamat', alamat],
  ]

  return el('div', '',
    el('h2', 'text-xl font-bold', 'Data pelanggan'),
    el('dl', 'mt-3 grid gap-3',
      ...rows.map(([label, value]) => el('div', '', el('dt', 'text-sm text-redup', label), el('dd', 'font-semibold', value))),
    ),
  )
}

function totalBlock (data: ResponseTagihan, count: number): HTMLElement {
  if (!count) {
    return el('div', 'rounded-lg bg-lunas-soft p-6 text-lunas',
      el('p', 'text-2xl font-extrabold', 'Tidak ada tagihan'),
      el('p', 'mt-1', 'Seluruh rekening air Anda sudah terbayar.'),
    )
  }

  return el('div', 'rounded-lg bg-pipa p-6 text-white',
    el('p', 'text-white/85', 'Total tagihan'),
    el('p', 'num mt-1 text-display font-extrabold', `Rp ${show(data.total)}`),
    el('p', 'mt-2 text-white/85', `${count} periode belum dibayar`),
  )
}

function detailTable (items: ItemTagihan[]): HTMLElement {
  const lainnya = items.some(item => item.lainnya && String(item.lainnya) !== '0')
  const columns: { label: string, value: (item: ItemTagihan) => string, airOnly?: boolean, strong?: boolean }[] = [
    { label: 'Stan awal', value: item => show(item.stan_awal), airOnly: true },
    { label: 'Stan akhir', value: item => show(item.stan_akhir), airOnly: true },
    { label: 'Pemakaian (m³)', value: item => show(item.kubik), airOnly: true, strong: true },
    { label: 'Biaya air', value: item => show(item.air), airOnly: true },
    { label: 'Biaya adm.', value: item => show(item.administrasi), airOnly: true },
    { label: 'Denda', value: item => show(item.denda), airOnly: true },
    ...(lainnya ? [{ label: 'Lainnya', value: (item: ItemTagihan) => show(item.lainnya) }] : []),
    { label: 'Total', value: item => show(item.total), strong: true },
  ]

  const head = el('thead', '', el('tr', 'border-b-2 border-pipa text-left',
    el('th', 'py-2 pr-4 font-semibold', 'Periode'),
    ...columns.map(column => el('th', 'py-2 pl-4 text-right font-semibold', column.label)),
  ))

  const body = el('tbody', '', ...items.map(item => {
    const kategori = item.kategori ? KATEGORI[item.kategori] : undefined
    return el('tr', 'border-b border-garis',
      el('td', 'periode py-3 pr-4', el('span', 'font-semibold', show(item.bulan), kategori && el('span', 'ml-2 rounded-sm bg-air px-1.5 py-0.5 text-sm font-semibold text-patriot', kategori))),
      ...columns.map(column => {
        const cell = el('td', `num py-3 pl-4 text-right ${column.strong ? 'font-bold' : ''}`)
        cell.dataset.label = column.label
        cell.append(el('span', '', column.airOnly && !isAir(item) ? '–' : column.value(item)))
        return cell
      }),
    )
  }))

  return el('div', 'mt-10',
    el('h2', 'text-xl font-bold', 'Rincian tagihan belum dibayar'),
    el('div', 'mt-4 overflow-x-auto', el('table', 'tagihan-table w-full border-collapse', head, body)),
  )
}

function render (container: HTMLElement, data: ResponseTagihan): void {
  const items = data.tagihan ?? []
  const nonaktif = data.pelanggan?._nonaktif
    ? el('p', 'notice notice-warn mb-8', `Status kepelangganan Anda saat ini tidak aktif${items.length ? ', namun masih ada tagihan yang belum diselesaikan.' : '.'}`)
    : null

  container.replaceChildren(
    ...(nonaktif ? [nonaktif] : []),
    el('div', 'grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start',
      customerBlock(data.pelanggan),
      totalBlock(data, items.length),
    ),
    ...(items.length ? [detailTable(items)] : []),
  )
}

export function initTagihan (): void {
  const form = document.querySelector<HTMLFormElement>('[data-tagihan-form]')
  const result = document.querySelector<HTMLElement>('[data-tagihan-result]')
  const input = form?.querySelector<HTMLInputElement>('input[name="nomor"]')
  if (!form || !result || !input) {
    return
  }

  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')
  const error = form.querySelector<HTMLElement>('[data-error]')
  input.addEventListener('focus', warmRecaptcha, { once: true })

  form.addEventListener('submit', async event => {
    event.preventDefault()
    const nomor = input.value.trim()
    if (!nomor) {
      input.setAttribute('aria-invalid', 'true')
      showError(error, 'Masukkan nomor pelanggan terlebih dahulu.')
      return
    }

    input.removeAttribute('aria-invalid')
    showError(error, '')
    setBusy(button, true, 'Memeriksa…')

    try {
      const token = await recaptchaToken('tagihan')
      const data = await api<ResponseTagihan>('/tagihan', {
        method: 'POST',
        body: { 'pelanggan': nomor, 'g-recaptcha-response': token },
      })

      render(result, data)
      if (data.tagihan?.length) {
        void mountBayar(result, data.pelanggan?.nomor ?? nomor)
      }
      result.hidden = false
      result.focus({ preventScroll: true })
      result.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (caught) {
      result.hidden = true
      const message = caught instanceof ApiError && caught.message
        ? caught.message
        : caught instanceof ApiError && caught.status === 404
          ? 'Nomor pelanggan tidak ditemukan. Periksa kembali nomor pada rekening air Anda.'
          : caught instanceof ApiError && caught.status === 0
            ? caught.message
            : 'Tagihan belum dapat diperiksa saat ini. Coba lagi dalam beberapa menit.'
      showError(error, message)
    } finally {
      setBusy(button, false)
    }
  })
}
