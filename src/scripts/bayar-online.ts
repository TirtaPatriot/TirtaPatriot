/**
 * Bayar online di bawah hasil cek tagihan, lewat API Open saja (tidak ada panggilan langsung ke PPOB/gateway):
 *  - GET  /bayar             → { aktif, kanal: [{ kode, nama, biaya_admin, persen }] }
 *  - POST /bayar             { nomor, kanal, g-recaptcha-response } → transaksi dengan nomor VA
 *  - GET  /bayar/:kode       → status: menunggu | diproses | lunas | diperiksa | kedaluwarsa
 * Transaksi berjalan disimpan di sessionStorage agar bisa dilanjutkan setelah halaman dimuat ulang.
 */
import { dateTimeShort } from '../lib/format'
import { rupiah } from '../lib/tarif'
import { api, recaptchaToken } from './api'
import { el, setBusy, showError } from './dom'
import { pesanGalat } from './layanan'
import { enter } from './motion'

type Kanal = { kode: string, nama: string, biaya_admin: number, persen: number }
type Transaksi = {
  kode: string
  status: 'menunggu' | 'diproses' | 'lunas' | 'diperiksa' | 'kedaluwarsa'
  kanal: string
  nomor_bayar: string | null
  qr: string | null
  jumlah: number
  biaya_admin: number
  total: number
  batas: string | null
}

const KEY = 'tirtapatriot.bayar'
const PANTAU_MS = 10_000
const PANTAU_MAKS = 30 * 60_000

let daftarKanal: Promise<{ aktif: boolean, kanal: Kanal[] }> | undefined

function simpan (nomor: string, kode: string | null): void {
  try {
    if (kode) {
      sessionStorage.setItem(KEY, JSON.stringify({ nomor, kode }))
    } else {
      sessionStorage.removeItem(KEY)
    }
  } catch {
    // tanpa penyimpanan: transaksi tetap dapat dipantau selama halaman terbuka
  }
}

function tersimpan (nomor: string): string | null {
  try {
    const data = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as { nomor: string, kode: string } | null
    return data?.nomor === nomor ? data.kode : null
  } catch {
    return null
  }
}

const biaya = (kanal: Kanal) => kanal.persen ? `biaya admin ${kanal.persen * 100}%` : `biaya admin ${rupiah(kanal.biaya_admin)}`

function statusNotice (trx: Transaksi): HTMLElement {
  switch (trx.status) {
    case 'lunas':
      return el('p', 'notice notice-ok', 'Pembayaran berhasil dan tagihan Anda telah lunas. Terima kasih.')
    case 'diproses':
      return el('p', 'notice', 'Pembayaran diterima dan sedang dibukukan.')
    case 'diperiksa':
      return el('p', 'notice notice-warn', `Pembayaran diterima dan sedang diperiksa petugas. Bila tagihan belum berubah dalam 1×24 jam, hubungi kami dengan kode transaksi ${trx.kode}.`)
    case 'kedaluwarsa':
      return el('p', 'notice notice-warn', 'Kode pembayaran ini sudah kedaluwarsa. Silakan buat kode pembayaran baru.')
    default:
      return el('p', 'notice', 'Menunggu pembayaran. Halaman ini akan diperbarui otomatis setelah pembayaran diterima.')
  }
}

function transaksiCard (trx: Transaksi, onBaru: () => void): HTMLElement {
  const nomor = trx.nomor_bayar ?? ''
  const salin = el('button', 'btn btn-quiet', 'Salin')
  salin.type = 'button'
  salin.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(nomor)
      salin.textContent = 'Tersalin'
    } catch {
      salin.textContent = 'Salin manual'
    }
  })
  const rows: Array<[string, string]> = [
    ['Tagihan', rupiah(trx.jumlah)],
    ['Biaya admin', rupiah(trx.biaya_admin)],
    ['Total dibayar', rupiah(trx.total)],
    ['Bayar sebelum', trx.batas ? `${dateTimeShort(trx.batas)} WIB` : '–'],
    ['Kode transaksi', trx.kode],
  ]
  const card = el('div', 'grid gap-4 rounded-2xl border border-garis p-5 sm:p-6',
    statusNotice(trx),
    el('div', '',
      el('p', 'text-sm text-redup', `Nomor ${trx.kanal}`),
      el('div', 'mt-1 flex flex-wrap items-center gap-3', el('p', 'num text-title font-extrabold tracking-wider', nomor || '–'), ...(nomor && trx.status === 'menunggu' ? [salin] : [])),
    ),
    el('dl', 'grid gap-x-8 gap-y-2 sm:grid-cols-2', ...rows.map(([label, value]) => el('div', '', el('dt', 'text-sm text-redup', label), el('dd', 'num font-semibold', value)))),
  )
  if (trx.qr && /^(https:|data:image\/png;base64,)/.test(trx.qr)) {
    const image = el('img', 'size-56 rounded-lg ring-1 ring-garis')
    image.src = trx.qr
    image.alt = 'Kode QR pembayaran'
    card.append(image)
  }
  if (trx.status === 'menunggu') {
    card.append(el('p', 'text-sm text-redup', `Bayar melalui aplikasi atau ATM ${trx.kanal.replace(/\s*VA$/, '')} dengan menu Virtual Account, lalu masukkan nomor di atas. Pastikan jumlahnya sesuai total di atas.`))
  }
  if (trx.status === 'lunas') {
    const link = el('a', 'btn btn-quiet justify-self-start', 'Lihat riwayat pembayaran')
    link.href = '/pelanggan/riwayat'
    card.append(link)
  }
  if (trx.status === 'kedaluwarsa') {
    const baru = el('button', 'btn btn-primary justify-self-start', 'Buat kode pembayaran baru')
    baru.type = 'button'
    baru.addEventListener('click', onBaru)
    card.append(baru)
  }
  return card
}

/** Tambahkan bagian "Bayar online" ke hasil cek tagihan bila layanan aktif. */
export async function mountBayar (container: HTMLElement, nomor: string): Promise<void> {
  daftarKanal ??= api<{ aktif: boolean, kanal: Kanal[] }>('/bayar').catch(() => ({ aktif: false, kanal: [] }))
  const { aktif, kanal } = await daftarKanal
  if (!aktif || !kanal.length || !container.isConnected) {
    return
  }

  const body = el('div', 'mt-4 grid gap-4')
  const errorText = el('p', '')
  errorText.dataset.errorText = ''
  const error = el('div', 'notice notice-error', errorText)
  error.setAttribute('role', 'alert')
  error.tabIndex = -1
  error.hidden = true
  const section = el('section', 'mt-10 max-w-[44rem]', el('h2', 'text-xl font-bold', 'Bayar online'), body)
  container.append(section)
  enter(section)

  let timer: number | undefined
  const mulai = Date.now()

  const tampilTransaksi = (trx: Transaksi) => {
    body.replaceChildren(transaksiCard(trx, () => {
      simpan(nomor, null)
      pilihan()
    }))
    window.clearTimeout(timer)
    if (trx.status === 'menunggu' || trx.status === 'diproses') {
      simpan(nomor, trx.kode)
      if (Date.now() - mulai < PANTAU_MAKS) {
        timer = window.setTimeout(() => void pantau(trx.kode), PANTAU_MS)
      }
    } else {
      simpan(nomor, trx.status === 'lunas' || trx.status === 'kedaluwarsa' ? null : trx.kode)
    }
  }

  const pantau = async (kode: string) => {
    if (!section.isConnected) {
      return
    }
    if (document.hidden) {
      timer = window.setTimeout(() => void pantau(kode), PANTAU_MS)
      return
    }
    try {
      tampilTransaksi(await api<Transaksi>(`/bayar/${encodeURIComponent(kode)}`))
    } catch {
      timer = window.setTimeout(() => void pantau(kode), PANTAU_MS * 2)
    }
  }

  function pilihan (): void {
    const radios = kanal.map((item, index) => {
      const input = el('input', 'size-4 accent-patriot')
      input.type = 'radio'
      input.name = 'kanal-bayar'
      input.value = item.kode
      input.checked = index === 0
      return el('label', 'flex cursor-pointer items-center gap-3 rounded-lg border border-garis px-4 py-3 has-[:checked]:border-patriot has-[:checked]:bg-air', input, el('span', 'font-semibold', item.nama), el('span', 'ml-auto text-sm text-redup', biaya(item)))
    })
    const label = el('span', '', 'Buat kode pembayaran')
    label.dataset.label = ''
    const tombol = el('button', 'btn btn-primary justify-self-start px-6', label)
    tombol.type = 'button'
    tombol.dataset.idle = 'Buat kode pembayaran'
    tombol.addEventListener('click', async () => {
      const dipilih = section.querySelector<HTMLInputElement>('input[name="kanal-bayar"]:checked')?.value
      showError(error, '')
      setBusy(tombol, true, 'Membuat kode…')
      try {
        const trx = await api<Transaksi>('/bayar', {
          method: 'POST',
          body: { 'nomor': nomor, 'kanal': dipilih, 'g-recaptcha-response': await recaptchaToken('bayar') },
        })
        tampilTransaksi(trx)
      } catch (caught) {
        showError(error, pesanGalat(caught, 'Kode pembayaran belum dapat dibuat. Silakan coba lagi atau bayar di tempat pembayaran resmi.'))
      } finally {
        setBusy(tombol, false)
      }
    })
    const fieldset = el('fieldset', 'grid gap-2', el('legend', 'mb-2 text-redup', 'Pilih bank untuk virtual account. Biaya admin ditambahkan ke total pembayaran.'), ...radios)
    body.replaceChildren(fieldset, error, tombol)
  }

  const kodeLama = tersimpan(nomor)
  if (kodeLama) {
    try {
      tampilTransaksi(await api<Transaksi>(`/bayar/${encodeURIComponent(kodeLama)}`))
      return
    } catch {
      simpan(nomor, null)
    }
  }
  pilihan()
}
