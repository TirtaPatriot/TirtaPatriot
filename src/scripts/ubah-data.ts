/**
 * Pengajuan perubahan data pelanggan lewat API Open (token layanan dari langkah verifikasi):
 *  - GET  /pengajuan/jenis              → jenis pengajuan dan isiannya
 *  - GET  /pengajuan/siapkan?jenis=     → periode realisasi, biaya, tunggakan (isian baca-saja)
 *  - POST /pengajuan { jenis, isian: { alamat_baru?, nama_baru?, keterangan? }, deskripsi, lampiran: [data URL] }
 *  - GET  /pengajuan                    → riwayat pengajuan nomor pelanggan
 */
import { rupiah } from '../lib/tarif'
import { api } from './api'
import { el, setBusy, showError } from './dom'
import { blobToDataUrl, getSesi, layanan, mountVerifikasi, pesanGalat, SesiBerakhir } from './layanan'
import { bringIntoView, enter } from './motion'
import { ticketDisplay } from './pengaduan'
import { bindUploads } from './unggah'
import { createWizard } from './wizard'

const TITLES = ['Verifikasi', 'Jenis pengajuan', 'Lampiran']

type Field = { code: string, label: string, type: 'periode' | 'currency' | 'text' | string, is_readonly: string }
type Jenis = { id: string, label: string, isian: Field[] }
type Prefill = Record<string, string | number | null>
type Riwayat = { nomor: string, tanggal: string, jenis: string | null, status: string, alasan: string | null }

const BULAN = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
const periode = (value: unknown) => {
  const text = String(value ?? '')
  return /^\d{6}$/.test(text) ? BULAN.format(new Date(Number(text.slice(0, 4)), Number(text.slice(4)) - 1, 1)) : text || '–'
}
/** label isian dari API dirapikan: huruf kapital di awal saja, keterangan dalam kurung tetap */
const tidy = (label: string) => label.charAt(0) + label.slice(1).toLowerCase().replace(/\bpemertintah\b/, 'pemerintah')

export async function initUbahData (): Promise<void> {
  const form = document.querySelector<HTMLFormElement>('[data-ubah-form]')
  if (!form) {
    return
  }
  // riwayat dimuat sekali per nomor pelanggan yang terverifikasi
  let riwayatNomor = getSesi()?.nomor ?? ''
  if (riwayatNomor) {
    void loadHistory()
  }

  const error = form.querySelector<HTMLElement>(':scope > [data-error]')
  const next = form.querySelector<HTMLButtonElement>('[data-next]')
  const typesBox = form.querySelector<HTMLElement>('[data-types]')!
  const fieldsBox = form.querySelector<HTMLElement>('[data-fields]')!
  const files = new Map<string, string>()
  // lampiran disimpan di browser dan dikirim bersama pengajuan
  bindUploads(form.querySelector<HTMLElement>('[data-attachments]')!, files, blobToDataUrl)

  const state = { customer: '', jenis: null as Jenis | null, prefill: null as Prefill | null, prefillFor: '' }
  const wizard = createWizard(form, TITLES, { lastLabel: 'Kirim pengajuan' })
  const verifikasi = mountVerifikasi(form.querySelector<HTMLElement>('[data-verifikasi]')!)

  // jenis pengajuan
  let jenisList: Jenis[] = []
  try {
    jenisList = await api<Jenis[]>('/pengajuan/jenis')
    typesBox.replaceChildren(...jenisList.map(jenis => {
      const radio = el('input', 'mt-1 size-4 shrink-0 accent-patriot')
      radio.type = 'radio'
      radio.name = 'jenis'
      radio.value = jenis.id
      return el('label', 'flex cursor-pointer items-start gap-3 rounded-lg border border-garis bg-white p-4 font-semibold transition-colors has-[:checked]:border-patriot has-[:checked]:bg-air', radio, jenis.label)
    }))
  } catch {
    typesBox.replaceChildren(el('p', 'notice notice-error', 'Jenis pengajuan belum dapat dimuat. Silakan muat ulang halaman.'))
  }

  typesBox.addEventListener('change', () => void loadFields())

  async function loadFields (): Promise<void> {
    const id = form!.querySelector<HTMLInputElement>('input[name=jenis]:checked')?.value
    const jenis = jenisList.find(item => item.id === id) ?? null
    state.jenis = jenis
    if (!jenis) {
      fieldsBox.replaceChildren()
      return
    }
    fieldsBox.replaceChildren(el('p', 'text-redup', 'Menyiapkan isian…'))
    const key = `${jenis.id}:${state.customer}`
    try {
      if (state.prefillFor !== key) {
        state.prefill = await layanan<Prefill>(`/pengajuan/siapkan?jenis=${encodeURIComponent(jenis.id)}`)
        state.prefillFor = key
      }
    } catch (caught) {
      state.prefill = null
      fieldsBox.replaceChildren(el('p', 'notice notice-error', pesanGalat(caught, 'Data pengajuan belum dapat disiapkan. Silakan coba lagi.')))
      return
    }
    if (state.jenis !== jenis) {
      return
    }
    renderFields(jenis, state.prefill ?? {})
  }

  function renderFields (jenis: Jenis, prefill: Prefill): void {
    const readonly: HTMLElement[] = []
    const inputs: HTMLElement[] = []
    for (const field of jenis.isian) {
      const known = prefill[field.code]
      if (field.type === 'periode' || field.type === 'currency') {
        const shown = field.type === 'periode' ? periode(known) : rupiah(Number(known ?? 0))
        readonly.push(el('div', '', el('dt', 'text-sm text-redup', tidy(field.label)), el('dd', 'font-bold', shown)))
        continue
      }
      const id = `u-${field.code}`
      const long = /alamat|keterangan/.test(field.code)
      const input = long ? el('textarea', 'input') : el('input', 'input')
      input.id = id
      input.name = `f-${field.code}`
      input.maxLength = long ? 250 : 100
      input.required = field.code !== 'keterangan'
      const label = el('label', '', tidy(field.label), field.code === 'keterangan' ? el('span', 'font-normal text-redup', ' (tidak wajib)') : null)
      label.htmlFor = id
      inputs.push(el('div', 'field', label, input))
    }
    fieldsBox.replaceChildren(
      readonly.length ? el('dl', 'grid gap-x-8 gap-y-3 rounded-lg bg-kabut p-4 sm:grid-cols-2', ...readonly) : '',
      ...inputs,
    )
  }

  const formValues = () => (state.jenis?.isian ?? [])
    .filter(field => field.type !== 'periode' && field.type !== 'currency')
    .map(field => ({ code: field.code, label: tidy(field.label), value: (form!.elements.namedItem(`f-${field.code}`) as HTMLInputElement | null)?.value.trim() ?? '' }))

  function renderReview (): void {
    const rows: [string, string][] = [
      ['Nomor pelanggan', state.customer],
      ['Jenis pengajuan', state.jenis?.label ?? '–'],
      ...formValues().filter(item => item.value).map(item => [item.label, item.value] as [string, string]),
    ]
    const biaya = Number(state.prefill?.biaya ?? 0)
    if (biaya > 0) {
      rows.push(['Biaya', rupiah(biaya)])
    }
    form!.querySelector('[data-review]')!.replaceChildren(...rows.map(([label, text]) => el('div', '', el('dt', 'text-sm text-redup', label), el('dd', 'font-semibold break-words', text))))
  }

  async function send (): Promise<string> {
    if (!(form!.elements.namedItem('deskripsi') as HTMLTextAreaElement).value.trim()) {
      throw new Error('Tuliskan keterangan singkat pengajuan Anda.')
    }
    if (form!.querySelector('[data-upload][data-state="busy"]')) {
      throw new Error('Tunggu hingga semua lampiran selesai diunggah.')
    }
    const isian = Object.fromEntries(formValues().map(({ code, value }) => [code, value]))
    const result = await layanan<{ nomor?: string }>('/pengajuan', {
      method: 'POST',
      body: {
        jenis: state.jenis!.id,
        isian,
        deskripsi: (form!.elements.namedItem('deskripsi') as HTMLTextAreaElement).value.trim(),
        lampiran: [...files.values()],
      },
    })
    return result?.nomor ?? ''
  }

  form.addEventListener('submit', async event => {
    event.preventDefault()
    if (wizard.busy) {
      return
    }
    showError(error, '')
    setBusy(next, true, wizard.step === TITLES.length - 1 ? 'Mengirim…' : 'Memeriksa…')
    try {
      if (wizard.step === 0) {
        const sesi = await verifikasi.lanjut()
        if (sesi.nomor !== state.customer) {
          state.prefillFor = ''
        }
        if (sesi.nomor !== riwayatNomor) {
          riwayatNomor = sesi.nomor
          void loadHistory()
        }
        state.customer = sesi.nomor
        if (state.jenis) {
          void loadFields()
        }
        void wizard.go(1)
      } else if (wizard.step === 1) {
        if (!state.jenis) {
          throw new Error('Pilih jenis pengajuan.')
        }
        if (!state.prefill || state.prefillFor !== `${state.jenis.id}:${state.customer}`) {
          throw new Error('Isian pengajuan belum siap. Pilih ulang jenis pengajuan.')
        }
        const missing = formValues().find(item => item.code !== 'keterangan' && !item.value)
        if (missing) {
          throw new Error(`${missing.label} wajib diisi.`)
        }
        renderReview()
        void wizard.go(2)
      } else {
        const nomor = await send()
        form.hidden = true
        document.querySelector<HTMLElement>('[data-stepper]')!.hidden = true
        const done = document.querySelector<HTMLElement>('[data-done]')!
        const number = done.querySelector<HTMLElement>('[data-done-number]')!
        number.hidden = !nomor
        number.replaceChildren(el('span', 'text-sm text-redup', 'Nomor pengajuan'), ticketDisplay(nomor))
        enter(done)
        done.focus({ preventScroll: true })
        bringIntoView(done)
        void loadHistory()
      }
    } catch (caught) {
      if (caught instanceof SesiBerakhir) {
        verifikasi.reset()
        void wizard.go(0)
      }
      showError(error, pesanGalat(caught, 'Pengajuan belum berhasil dikirim. Silakan coba lagi dalam beberapa saat.'))
    } finally {
      setBusy(next, false)
    }
  })

  document.querySelector('[data-again]')?.addEventListener('click', () => location.reload())
}

async function loadHistory (): Promise<void> {
  const box = document.querySelector<HTMLElement>('[data-history]')
  if (!box) {
    return
  }
  box.replaceChildren(el('p', 'text-redup', 'Memuat…'))
  try {
    const items = await layanan<Riwayat[]>('/pengajuan')
    if (!items?.length) {
      box.replaceChildren(el('p', 'text-redup', 'Belum ada pengajuan untuk nomor ini.'))
      return
    }
    const tanggal = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'Asia/Jakarta' })
    box.replaceChildren(...items.map(item => {
      const ditolak = item.status === 'Ditolak'
      const diterima = item.status === 'Diterima'
      return el('article', 'rounded-lg border border-garis p-4',
        el('p', 'flex flex-wrap items-center justify-between gap-2',
          el('strong', '', item.jenis ?? 'Pengajuan'),
          el('span', `rounded-full px-2.5 py-0.5 text-xs font-bold ${ditolak ? 'bg-meter-soft text-meter' : diterima ? 'bg-lunas-soft text-lunas' : 'bg-awas-soft text-awas'}`, item.status),
        ),
        el('p', 'num mt-1 text-sm text-redup', `${item.nomor} · ${item.tanggal ? tanggal.format(new Date(item.tanggal)) : ''}`),
        ditolak && item.alasan ? el('p', 'mt-2 text-sm', `Alasan: ${item.alasan}`) : null,
      )
    }))
  } catch {
    box.replaceChildren(el('p', 'text-redup', 'Riwayat pengajuan belum dapat dimuat.'))
  }
}
