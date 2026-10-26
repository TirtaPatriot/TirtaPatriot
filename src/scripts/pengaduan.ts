/**
 * Pengaduan pelanggan: formulir bertahap (nomor → verifikasi nama → pelapor → kendala)
 * dan tampilan status tiket. Logika API sama dengan versi sebelumnya:
 *  - POST /pelanggan { nomor }          → nama tersamar
 *  - POST /pelanggan { nomor, nama }    → id sambungan (CN403 bila nama tidak cocok)
 *  - GET  /pengaduan                    → daftar perihal
 *  - POST /pengaduan { ... }            → nomor tiket
 *  - GET  /pengaduan/:tiket             → status tiket
 */
import { dateLong } from '../lib/format'
import { api, ApiError, recaptchaToken, warmRecaptcha } from './api'
import { el, setBusy, showError } from './dom'

const STEP_TITLES = ['Nomor pelanggan', 'Verifikasi nama', 'Data pelapor', 'Kendala']

type JenisOption = string | { title?: string, text?: string, value?: string | number, id?: string | number }

function errorMessage (caught: unknown, fallback: string): string {
  if (caught instanceof ApiError) {
    if (caught.status === 404) {
      return 'Nomor pelanggan tidak ditemukan. Periksa kembali nomor pada rekening air Anda.'
    }
    return caught.message || fallback
  }
  return caught instanceof Error && caught.message ? caught.message : fallback
}

/** Nomor tiket berupa angka tampil sebagai register meter, selain itu teks tebal. */
export function ticketDisplay (tiket: string): HTMLElement {
  if (/^\d{1,16}$/.test(tiket)) {
    const register = el('span', 'register text-2xl')
    register.setAttribute('role', 'img')
    register.setAttribute('aria-label', `Nomor tiket ${tiket}`)
    const digits = [...tiket]
    digits.forEach((digit, index) => {
      register.append(el('span', index >= digits.length - 3 ? 'dec' : '', digit))
    })
    return register
  }
  return el('strong', 'text-2xl font-extrabold break-all', tiket)
}

export function initPengaduan (): void {
  const form = document.querySelector<HTMLFormElement>('[data-pengaduan-form]')
  if (!form) {
    return
  }

  const fieldsets = [...form.querySelectorAll<HTMLFieldSetElement>('[data-step]')]
  const stepper = [...document.querySelectorAll<HTMLElement>('[data-stepper] > li')]
  const announce = document.querySelector<HTMLElement>('[data-step-announce]')
  const error = form.querySelector<HTMLElement>('[data-error]')
  const prev = form.querySelector<HTMLButtonElement>('[data-prev]')
  const next = form.querySelector<HTMLButtonElement>('[data-next]')
  const done = document.querySelector<HTMLElement>('[data-done]')

  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  const nomorInput = field('nomor') as HTMLInputElement
  const namaInput = field('nama') as HTMLInputElement
  const jenisSelect = field('jenis') as HTMLSelectElement
  const masalahInput = field('masalah') as HTMLTextAreaElement

  const state = { step: 0, masked: '', id: '', verifiedNama: '', maskedFor: '' }

  nomorInput.addEventListener('focus', warmRecaptcha, { once: true })

  // mengganti nomor pelanggan membatalkan verifikasi sebelumnya
  nomorInput.addEventListener('input', () => {
    state.masked = ''
    state.id = ''
    state.verifiedNama = ''
  })

  const count = form.querySelector('[data-count]')
  masalahInput.addEventListener('input', () => {
    if (count) {
      count.textContent = String(masalahInput.value.length)
    }
  })

  // daftar perihal dari API; bila gagal, pelapor tetap bisa memilih "Lainnya"
  void api<{ jenis?: JenisOption[] }>('/pengaduan').then(data => {
    for (const option of data?.jenis ?? []) {
      const label = typeof option === 'string' ? option : option.title ?? option.text ?? String(option.value ?? option.id ?? '')
      const value = typeof option === 'string' ? option : String(option.value ?? option.id ?? label)
      if (label) {
        jenisSelect.append(new Option(label, value))
      }
    }
  }).catch(() => {
    jenisSelect.append(new Option('Lainnya', 'Lainnya'))
  })

  function go (step: number): void {
    state.step = step
    fieldsets.forEach((fieldset, index) => {
      fieldset.hidden = index !== step
    })
    stepper.forEach((item, index) => {
      item.dataset.state = index < step ? 'done' : index === step ? 'current' : 'todo'
      if (index === step) {
        item.setAttribute('aria-current', 'step')
      } else {
        item.removeAttribute('aria-current')
      }
    })
    if (announce) {
      announce.textContent = `Langkah ${step + 1} dari ${STEP_TITLES.length}: ${STEP_TITLES[step]}`
    }
    if (prev) {
      prev.hidden = step === 0
    }
    if (next) {
      next.dataset.idle = step === STEP_TITLES.length - 1 ? 'Kirim pengaduan' : 'Lanjut'
      const label = next.querySelector('[data-label]')
      if (label) {
        label.textContent = next.dataset.idle
      }
    }
    showError(error, '')
    fieldsets[step]?.querySelector<HTMLElement>('input, select, textarea')?.focus()
  }

  async function lookUpCustomer (): Promise<void> {
    const nomor = nomorInput.value.trim()
    if (!nomor) {
      throw new Error('Masukkan nomor pelanggan terlebih dahulu.')
    }
    if (state.masked && state.maskedFor === nomor) {
      return
    }

    const result = await api<{ nama?: string }>('/pelanggan', {
      method: 'POST',
      body: { 'nomor': nomor, 'g-recaptcha-response': await recaptchaToken('aduan') },
    })
    state.masked = result?.nama ?? ''
    state.maskedFor = nomor

    const echoNomor = form!.querySelector('[data-echo-nomor]')
    const echoMasked = form!.querySelector('[data-echo-masked]')
    if (echoNomor) {
      echoNomor.textContent = nomor
    }
    if (echoMasked) {
      echoMasked.textContent = state.masked
    }
  }

  async function verifyName (): Promise<void> {
    const nama = namaInput.value.trim()
    if (!nama) {
      throw new Error('Tulis nama lengkap sesuai data sambungan Anda.')
    }
    if (state.id && state.verifiedNama === nama) {
      return
    }

    try {
      const result = await api<{ id?: string }>('/pelanggan', {
        method: 'POST',
        body: { 'nomor': nomorInput.value.trim(), nama, 'g-recaptcha-response': await recaptchaToken('aduan') },
      })
      state.id = result?.id ?? ''
      state.verifiedNama = nama
    } catch (caught) {
      state.id = ''
      state.verifiedNama = ''
      if (caught instanceof ApiError && caught.code === 'CN403') {
        throw new Error('Nama tidak sesuai dengan data sambungan. Tulis nama lengkap sesuai rekening air, tanpa tanda bintang.', { cause: caught })
      }
      throw caught
    }
  }

  async function submitComplaint (): Promise<string> {
    if (!jenisSelect.value) {
      throw new Error('Pilih perihal pengaduan terlebih dahulu.')
    }

    const tiket = await api<string | { tiket?: string, id?: string }>('/pengaduan', {
      method: 'POST',
      body: {
        'id': state.id,
        'nomor': nomorInput.value.trim(),
        'jenis': jenisSelect.value,
        'pelapor': field('pelapor').value.trim(),
        'masalah': masalahInput.value.trim(),
        'telepon': field('telepon').value.trim(),
        'nama': state.verifiedNama,
        'g-recaptcha-response': await recaptchaToken('aduan'),
      },
    })

    return typeof tiket === 'string' ? tiket : String(tiket?.tiket ?? tiket?.id ?? '')
  }

  prev?.addEventListener('click', () => go(Math.max(0, state.step - 1)))

  form.addEventListener('submit', async event => {
    event.preventDefault()
    showError(error, '')
    setBusy(next, true)

    try {
      if (state.step === 0) {
        await lookUpCustomer()
      } else if (state.step === 1) {
        await verifyName()
      } else if (state.step === 3) {
        const tiket = await submitComplaint()
        form.hidden = true
        document.querySelector<HTMLElement>('[data-stepper]')!.hidden = true
        if (done) {
          done.querySelector('[data-done-ticket]')?.replaceChildren(ticketDisplay(tiket))
          done.querySelector<HTMLAnchorElement>('[data-done-link]')!.href = `/pelanggan/pengaduan?tiket=${encodeURIComponent(tiket)}`
          done.hidden = false
          done.focus()
        }
        return
      }
      go(state.step + 1)
    } catch (caught) {
      showError(error, errorMessage(caught, 'Permintaan belum berhasil. Coba lagi dalam beberapa saat.'))
    } finally {
      setBusy(next, false)
    }
  })
}

type Tiket = Record<string, unknown> & {
  pelapor?: string
  perihal?: string
  masalah?: string
  solusi?: string
  status?: string
  estimasi?: string
  selesai?: unknown
}

const STAGES = [
  { label: 'Pengaduan diterima', description: 'Aduan tercatat dan diteruskan ke cabang terkait.', dateKey: 'tgl_pengaduan' },
  { label: 'Survei lokasi', description: 'Petugas memeriksa kondisi di lokasi.', dateKey: 'tgl_survei' },
  { label: 'Material disiapkan', description: 'Barang untuk perbaikan sudah disiapkan.', dateKey: 'tgl_pengeluaran' },
  { label: 'Perbaikan selesai', description: 'Petugas telah menyelesaikan perbaikan.', dateKey: 'tgl_selesai' },
]

function statusView (tiketId: string, data: Tiket): HTMLElement[] {
  const stages = STAGES.map((stage, index) => {
    const date = data[stage.dateKey]
    const finished = Boolean(date) || (index === STAGES.length - 1 && Boolean(data.selesai))
    return { ...stage, date: typeof date === 'string' ? date : '', finished }
  })
  const completed = stages.filter(stage => stage.finished).length
  const nextStage = stages.find(stage => !stage.finished)
  const statusLabel = data.selesai ? 'Selesai' : data.status ? String(data.status) : nextStage ? `Menunggu ${nextStage.label.toLowerCase()}` : 'Dalam proses'
  const masalah = String(data.masalah ?? '').replace(/^\s*Masalah\s*:\s*/i, '').trim() || '–'

  const details: [string, string][] = [
    ['Pelapor', String(data.pelapor || '–')],
    ['Perihal', String(data.perihal || '–')],
    ['Masalah', masalah],
    ['Solusi', String(data.solusi ?? '').trim() || 'Belum tersedia'],
  ]
  if (data.estimasi && !data.selesai) {
    details.push(['Perkiraan selesai', dateLong(String(data.estimasi))])
  }

  const timeline = el('ol', 'mt-4 grid gap-0', ...stages.map((stage, index) => el('li', 'relative grid grid-cols-[2rem_1fr] gap-3 pb-6 last:pb-0',
    el('span', `relative z-10 mt-0.5 grid size-8 place-items-center rounded-full border-2 text-sm font-bold ${stage.finished ? 'border-patriot bg-patriot text-white' : 'border-garis bg-white text-redup'}`, String(index + 1)),
    el('div', '',
      el('p', 'font-bold', stage.label, el('span', `ml-2 text-sm font-semibold ${stage.finished ? 'text-lunas' : 'text-redup'}`, stage.finished ? 'Selesai' : 'Menunggu')),
      el('p', 'text-redup', stage.description),
      stage.finished && stage.date ? el('p', 'text-sm text-redup', dateLong(stage.date)) : null,
    ),
    index < stages.length - 1 ? el('span', `absolute top-9 bottom-1 left-[0.95rem] w-0.5 ${stages[index + 1]!.finished ? 'bg-patriot' : 'bg-garis'}`) : null,
  )))

  return [
    el('div', 'flex flex-wrap items-center gap-4',
      el('h2', 'text-2xl font-extrabold', 'Status pengaduan'),
      ticketDisplay(tiketId),
    ),
    el('p', `notice mt-6 ${data.selesai ? 'notice-ok' : ''}`, el('span', '', el('strong', '', 'Saat ini: '), statusLabel, ` (${completed} dari ${stages.length} tahap selesai)`)),
    el('div', 'mt-8 grid gap-10 md:grid-cols-2',
      el('section', '', el('h3', 'text-lg font-bold', 'Detail aduan'), el('dl', 'mt-3 grid gap-3', ...details.map(([label, value]) => el('div', '', el('dt', 'text-sm text-redup', label), el('dd', 'font-semibold', value))))),
      el('section', '', el('h3', 'text-lg font-bold', 'Perjalanan pengaduan'), timeline),
    ),
  ]
}

function statusActions (tiketId: string): HTMLElement {
  const reload = el('a', 'btn btn-quiet', 'Muat ulang status')
  reload.href = `/pelanggan/pengaduan?tiket=${encodeURIComponent(tiketId)}`
  const create = el('a', 'btn btn-primary', 'Buat pengaduan baru')
  create.href = '/pelanggan/pengaduan'
  return el('div', 'mt-10 flex flex-wrap gap-3', create, reload)
}

export async function showTicketStatus (tiketId: string): Promise<void> {
  const container = document.querySelector<HTMLElement>('[data-status]')
  const formArea = document.querySelector<HTMLElement>('[data-form-area]')
  if (!container) {
    return
  }

  if (formArea) {
    formArea.hidden = true
  }
  container.hidden = false
  container.replaceChildren(el('p', 'text-redup', `Memuat status tiket ${tiketId}…`))

  try {
    const data = await api<Tiket>(`/pengaduan/${encodeURIComponent(tiketId)}`)
    container.replaceChildren(...statusView(tiketId, data ?? {}), statusActions(tiketId))
  } catch (caught) {
    const notFound = caught instanceof ApiError && caught.status === 404
    container.replaceChildren(
      el('h2', 'text-2xl font-extrabold', 'Status pengaduan'),
      el('p', 'notice notice-error mt-6', notFound
        ? `Tiket ${tiketId} tidak ditemukan. Periksa kembali nomor tiket Anda, lalu coba lagi.`
        : 'Status tiket belum dapat dimuat. Coba lagi dalam beberapa saat.'),
      statusActions(tiketId),
    )
  }
  container.focus()
}
