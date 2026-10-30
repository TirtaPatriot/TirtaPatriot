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

// persen dari API berupa pecahan (0,01 = 1%)
const PERSEN = new Intl.NumberFormat('id-ID', { style: 'percent', maximumFractionDigits: 2 })
const biaya = (kanal: Kanal) => kanal.persen ? PERSEN.format(kanal.persen) : rupiah(kanal.biaya_admin)

// logo bank dari src/assets/mitra/bank-<kode>.png; kanal VA tertutup berkode va<bank>-close
const LOGO = import.meta.glob<string>('../assets/mitra/bank-*.png', { eager: true, query: '?url', import: 'default' })
const logoKanal = (kode: string) => LOGO[`../assets/mitra/bank-${/^va([a-z]+)-/.exec(kode)?.[1] ?? ''}.png`]
const namaPendek = (nama: string) => nama.replace(/\s*(VA|Virtual Account)$/i, '')

const blok = (kelas: string) => el('div', `skeleton ${kelas}`)

/** Kerangka berkilau selama data dari layanan pembayaran dimuat. */
function kerangka (jenis: 'pilihan' | 'transaksi'): HTMLElement {
  const isi = jenis === 'pilihan'
    ? [blok('h-4 w-64'), el('div', 'grid grid-cols-2 gap-2 sm:grid-cols-4', ...Array.from({ length: 8 }, () => blok('h-14'))), blok('h-4 w-80 max-w-full'), blok('h-11 w-56 rounded-full')]
    : [blok('h-14'), blok('h-4 w-32'), blok('h-9 w-72 max-w-full'), el('div', 'grid gap-3 sm:grid-cols-2', ...Array.from({ length: 4 }, () => blok('h-10')))]
  const wadah = el('div', jenis === 'pilihan' ? 'grid gap-3' : 'grid gap-4 rounded-2xl border border-garis p-5 sm:p-6', ...isi)
  wadah.setAttribute('aria-hidden', 'true')
  return el('div', '', el('p', 'sr-only', jenis === 'pilihan' ? 'Memuat pilihan pembayaran…' : 'Memuat status pembayaran…'), wadah)
}

const LANGKAH = [
  { teks: 'Memeriksa tagihan Anda', mulai: 0 },
  { teks: 'Menyiapkan virtual account', mulai: 1800 },
  { teks: 'Menyimpan kode pembayaran', mulai: 5000 },
]

/**
 * Tahapan saat kode pembayaran dibuat (API Open → PPOB → gateway, bisa beberapa detik). Server tidak mengirim
 * kemajuan bertahap, jadi langkah maju menurut waktu dan berhenti di langkah terakhir sampai jawaban datang.
 */
function prosesPembuatan (bank: string): { panel: HTMLElement, selesai: () => void } {
  const items = LANGKAH.map((langkah, index) => {
    const ikon = el('span', 'grid size-5 shrink-0 place-items-center')
    const teks = el('span', '', index === 1 ? `${langkah.teks} ${bank}` : langkah.teks)
    return { item: el('li', 'flex items-center gap-3 text-redup transition-colors duration-300', ikon, teks), ikon }
  })
  const pengumuman = el('p', 'sr-only')
  pengumuman.setAttribute('aria-live', 'polite')
  const panel = el('div', 'grid gap-5 overflow-hidden rounded-2xl border border-garis p-5 sm:p-6',
    el('div', 'flow-bar -mx-5 -mt-5 sm:-mx-6 sm:-mt-6'),
    el('p', 'font-semibold', 'Membuat kode pembayaran…'),
    el('ol', 'grid gap-3', ...items.map(({ item }) => item)),
    el('p', 'text-sm text-redup', 'Biasanya hanya beberapa detik. Jangan tutup halaman ini.'),
    pengumuman,
  )

  const tandai = (aktif: number) => {
    items.forEach(({ item, ikon }, index) => {
      item.classList.toggle('text-redup', index > aktif)
      item.classList.toggle('text-pipa', index <= aktif)
      item.classList.toggle('font-semibold', index === aktif)
      ikon.replaceChildren(index < aktif
        ? el('span', 'grid size-5 place-items-center rounded-full bg-lunas text-xs font-bold text-white', '✓')
        : index === aktif ? el('span', 'spin-ring') : el('span', 'size-2 rounded-full bg-garis'))
    })
    pengumuman.textContent = items[aktif]?.item.textContent ?? ''
  }
  tandai(0)
  const timers = LANGKAH.slice(1).map((langkah, index) => window.setTimeout(() => tandai(index + 1), langkah.mulai))
  return { panel, selesai: () => timers.forEach(timer => window.clearTimeout(timer)) }
}

function statusNotice (trx: Transaksi): HTMLElement {
  switch (trx.status) {
    case 'lunas':
      return el('p', 'notice notice-ok', 'Pembayaran berhasil dan tagihan Anda telah lunas. Terima kasih.')
    case 'diproses':
      return el('p', 'notice items-center', el('span', 'spin-ring'), el('span', '', 'Pembayaran diterima dan sedang dibukukan.'))
    case 'diperiksa':
      return el('p', 'notice notice-warn', `Pembayaran diterima dan sedang diperiksa petugas. Bila tagihan belum berubah dalam 1×24 jam, hubungi kami dengan kode transaksi ${trx.kode}.`)
    case 'kedaluwarsa':
      return el('p', 'notice notice-warn', 'Kode pembayaran ini sudah kedaluwarsa. Silakan buat kode pembayaran baru.')
    default: {
      const titik = el('span', 'live-dot mt-1.5 shrink-0 text-patriot')
      titik.setAttribute('aria-hidden', 'true')
      return el('p', 'notice items-start', titik, el('span', '', 'Menunggu pembayaran. Halaman ini diperbarui otomatis setelah pembayaran diterima.'))
    }
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
    ['Biaya layanan', rupiah(trx.biaya_admin)],
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
    const ganti = el('button', 'btn btn-quiet justify-self-start', 'Ganti metode pembayaran')
    ganti.type = 'button'
    ganti.addEventListener('click', onBaru)
    card.append(ganti)
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

  const body = el('div', 'mt-4 grid gap-4')
  body.setAttribute('aria-busy', 'true')
  body.append(kerangka(tersimpan(nomor) ? 'transaksi' : 'pilihan'))
  const errorText = el('p', '')
  errorText.dataset.errorText = ''
  const error = el('div', 'notice notice-error', errorText)
  error.setAttribute('role', 'alert')
  error.tabIndex = -1
  error.hidden = true
  const section = el('section', 'mt-10 max-w-[44rem]', el('h2', 'text-xl font-bold', 'Bayar online'), body)
  container.append(section)
  enter(section)

  const { aktif, kanal } = await daftarKanal
  if (!aktif || !kanal.length || !section.isConnected) {
    section.remove()
    return
  }
  const ganti = (...nodes: HTMLElement[]) => {
    body.replaceChildren(...nodes)
    body.removeAttribute('aria-busy')
    for (const node of nodes) {
      enter(node)
    }
  }

  let timer: number | undefined
  // batas pemantauan dihitung per transaksi, bukan sejak halaman dimuat
  let dipantau = ''
  let mulai = 0
  // tampilan terakhir: kartu hanya digambar ulang bila ada yang berubah, agar tidak berkedip saat polling
  let tampil = ''
  // kode yang sedang dipantau; polling yang tertinggal (mis. setelah "ganti metode") diabaikan
  let pantauKode = ''

  // kembali ke pilihan metode: hentikan pemantauan transaksi lama (VA-nya dibiarkan kedaluwarsa sendiri)
  const gantiMetode = (dipilihSebelumnya?: string) => {
    window.clearTimeout(timer)
    pantauKode = ''
    tampil = ''
    simpan(nomor, null)
    pilihan(dipilihSebelumnya)
  }

  const tampilTransaksi = (trx: Transaksi) => {
    const tanda = `${trx.kode}|${trx.status}|${trx.nomor_bayar ?? ''}|${trx.qr ?? ''}|${trx.total}|${trx.batas ?? ''}`
    if (tanda !== tampil) {
      tampil = tanda
      ganti(transaksiCard(trx, () => gantiMetode(kanal.find(k => k.nama === trx.kanal)?.kode)))
    }
    window.clearTimeout(timer)
    if (trx.status === 'menunggu' || trx.status === 'diproses') {
      simpan(nomor, trx.kode)
      if (trx.kode !== dipantau) {
        dipantau = trx.kode
        mulai = Date.now()
      }
      if (Date.now() - mulai < PANTAU_MAKS) {
        pantauKode = trx.kode
        timer = window.setTimeout(() => void pantau(trx.kode), PANTAU_MS)
      } else {
        body.append(el('p', 'notice notice-warn', 'Status tidak lagi diperbarui otomatis. Muat ulang halaman untuk melihat status terbaru.'))
      }
    } else {
      simpan(nomor, trx.status === 'lunas' || trx.status === 'kedaluwarsa' ? null : trx.kode)
    }
  }

  const pantau = async (kode: string) => {
    // transaksi sudah ditinggalkan (ganti metode / transaksi lain): abaikan polling tertinggal
    if (kode !== pantauKode || !section.isConnected) {
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

  function pilihan (dipilihSebelumnya?: string, pesan?: string): void {
    const keterangan = el('p', 'text-sm text-redup')
    const perbaruiBiaya = (item: Kanal) => {
      keterangan.textContent = `Biaya layanan ${namaPendek(item.nama)} ${biaya(item)}, ditambahkan ke total pembayaran.`
    }
    const pilihanBank = kanal.map((item, index) => {
      const input = el('input', 'sr-only')
      input.type = 'radio'
      input.name = 'kanal-bayar'
      input.value = item.kode
      input.checked = dipilihSebelumnya ? item.kode === dipilihSebelumnya : index === 0
      input.addEventListener('change', () => perbaruiBiaya(item))
      const src = logoKanal(item.kode)
      let tanda: HTMLElement = el('span', 'text-sm font-bold', namaPendek(item.nama))
      if (src) {
        const image = el('img', 'h-7 w-full object-contain')
        image.src = src
        image.alt = namaPendek(item.nama)
        image.loading = 'lazy'
        tanda = image
      }
      return el('label', 'grid h-14 cursor-pointer place-items-center rounded-lg border border-garis bg-white px-3 transition-colors hover:border-patriot/50 has-[:checked]:border-patriot has-[:checked]:bg-air has-[:checked]:ring-1 has-[:checked]:ring-patriot has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-patriot', input, tanda)
    })
    perbaruiBiaya(kanal.find(item => item.kode === dipilihSebelumnya) ?? kanal[0]!)
    const label = el('span', '', 'Buat kode pembayaran')
    label.dataset.label = ''
    const tombol = el('button', 'btn btn-primary justify-self-start px-6', label)
    tombol.type = 'button'
    tombol.dataset.idle = 'Buat kode pembayaran'
    tombol.addEventListener('click', async () => {
      const dipilih = section.querySelector<HTMLInputElement>('input[name="kanal-bayar"]:checked')?.value
      const bank = namaPendek(kanal.find(item => item.kode === dipilih)?.nama ?? '')
      setBusy(tombol, true, 'Membuat kode…')
      const proses = prosesPembuatan(bank)
      body.setAttribute('aria-busy', 'true')
      ganti(proses.panel)
      section.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      try {
        const trx = await api<Transaksi>('/bayar', {
          method: 'POST',
          body: { 'nomor': nomor, 'kanal': dipilih, 'g-recaptcha-response': await recaptchaToken('bayar') },
        })
        tampilTransaksi(trx)
      } catch (caught) {
        pilihan(dipilih, pesanGalat(caught, 'Kode pembayaran belum dapat dibuat. Silakan coba lagi atau bayar di tempat pembayaran resmi.'))
      } finally {
        proses.selesai()
      }
    })
    const fieldset = el('fieldset', 'grid gap-3',
      el('legend', 'mb-3 text-redup', 'Pilih bank, lalu bayar dengan virtual account.'),
      el('div', 'grid grid-cols-2 gap-2 sm:grid-cols-4', ...pilihanBank),
      keterangan,
    )
    ganti(fieldset, error, tombol)
    showError(error, pesan ?? '')
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
