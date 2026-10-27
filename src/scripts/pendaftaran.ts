/**
 * Pendaftaran sambungan baru lewat API Info Pelanggan (alur yang sama dengan aplikasi Tirta Patriot Mobile):
 *  - GET  /reference/district, /reference/sub-district?district_id=  → pilihan kecamatan & kelurahan
 *  - POST /files/upload (isi berkas mentah, JPG/PNG)                  → nama berkas sementara
 *  - POST /new-customer/v2/insert                                     → nomor registrasi
 *  - GET  /new-customer/tracking?number=                              → tahapan permohonan
 * Status permohonan hanya menampilkan tahapan dan tanggal, tanpa data pribadi pemohon.
 */
import { dateLong } from '../lib/format'
import { INFO_PELANGGAN_API } from '../lib/info-pelanggan'
import { WHATSAPP_CC } from '../lib/site'
import { rupiah } from '../lib/tarif'
import { api, ApiError } from './api'
import { el, setBusy, showError } from './dom'
import { bringIntoView, enter, reveal, swapPanels } from './motion'
import { BEKASI, createMap, whenVisible } from './peta'
import { ticketDisplay } from './pengaduan'
import { bindUploads, uploadFile } from './unggah'

const STEP_TITLES = ['Data pemohon', 'Lokasi pemasangan', 'Berkas', 'Periksa dan kirim']

type Option = { id: string, label: string }
type Field = HTMLInputElement | HTMLSelectElement

const ip = <T>(path: string, init: Parameters<typeof api>[1] = {}) => api<T>(path, { ...init, base: INFO_PELANGGAN_API })

/** Pesan validasi API (bahasa Inggris, mis. "customer_name must not be optional") diganti kalimat yang dimengerti pemohon. */
function errorMessage (caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 0) {
      return caught.message
    }
    if (/upload|file/i.test(caught.message) || /Upload/i.test(String(caught.data?.description ?? ''))) {
      return 'Berkas belum tersimpan. Unggah ulang foto pada langkah Berkas, lalu kirim kembali.'
    }
    if (/must|optional|valid/i.test(caught.message)) {
      return 'Sebagian data belum lengkap atau belum sesuai. Periksa kembali isian Anda.'
    }
  }
  return 'Permohonan belum berhasil dikirim. Silakan coba lagi dalam beberapa saat.'
}

/** Kotak tanda tangan sederhana dengan Pointer Events. */
function bindSignature (canvas: HTMLCanvasElement): { isEmpty: () => boolean, toBlob: () => Promise<Blob | null>, clear: () => void } {
  const context = canvas.getContext('2d')!
  let empty = true
  let drawing = false

  const resize = () => {
    const ratio = window.devicePixelRatio || 1
    const { width, height } = canvas.getBoundingClientRect()
    if (!width) {
      return
    }
    canvas.width = width * ratio
    canvas.height = height * ratio
    context.scale(ratio, ratio)
    context.lineWidth = 2.5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#0a2a5e'
    empty = true
  }

  const point = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    return [event.clientX - rect.left, event.clientY - rect.top] as const
  }

  canvas.addEventListener('pointerdown', event => {
    if (canvas.width === 0 || canvas.width !== Math.round(canvas.getBoundingClientRect().width * (window.devicePixelRatio || 1))) {
      resize()
    }
    drawing = true
    canvas.setPointerCapture(event.pointerId)
    context.beginPath()
    context.moveTo(...point(event))
  })
  canvas.addEventListener('pointermove', event => {
    if (!drawing) {
      return
    }
    context.lineTo(...point(event))
    context.stroke()
    empty = false
    canvas.removeAttribute('aria-invalid')
  })
  const stop = () => {
    drawing = false
  }
  canvas.addEventListener('pointerup', stop)
  canvas.addEventListener('pointercancel', stop)

  return {
    isEmpty: () => empty,
    toBlob: () => new Promise(resolve => canvas.toBlob(resolve, 'image/png')),
    clear: () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
      empty = true
    },
  }
}

async function fillOptions (select: HTMLSelectElement, path: string, placeholder: string): Promise<void> {
  // permintaan terakhir yang menang bila pilihan induk diganti cepat
  select.dataset.source = path
  select.disabled = true
  select.replaceChildren(new Option('Memuat…', ''))
  try {
    const options = await ip<Option[]>(path)
    if (select.dataset.source !== path) {
      return
    }
    select.replaceChildren(new Option(placeholder, ''), ...(options ?? []).map(option => new Option(option.label, option.id)))
    select.disabled = false
  } catch {
    if (select.dataset.source === path) {
      select.replaceChildren(new Option('Gagal memuat. Muat ulang halaman.', ''))
    }
  }
}

/** Tandai kolom yang belum sesuai, lalu hentikan validasi dengan pesannya. */
function invalid (target: Element | null, message: string): never {
  target?.setAttribute('aria-invalid', 'true')
  if (target instanceof HTMLElement) {
    target.addEventListener('input', () => target.removeAttribute('aria-invalid'), { once: true })
  }
  throw new Error(message)
}

function checkRequired (fieldset: HTMLFieldSetElement): void {
  for (const input of fieldset.querySelectorAll<Field>('input[required], select[required]')) {
    if (!input.closest('[hidden]') && !input.value.trim()) {
      const label = fieldset.querySelector(`label[for="${input.id}"]`)?.textContent?.replace(/\(.*\)/, '').trim() ?? 'Kolom ini'
      invalid(input, `${label} wajib diisi.`)
    }
  }
}

export function initPendaftaran (): void {
  const form = document.querySelector<HTMLFormElement>('[data-daftar-form]')
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
  const field = (name: string) => form.elements.namedItem(name) as Field
  const value = (name: string) => field(name).value.trim()

  const files = new Map<string, string>()
  const signature = bindSignature(form.querySelector<HTMLCanvasElement>('[data-signature]')!)
  const state = { step: 0, signatureFile: '', moving: false }

  bindUploads(form, files)
  form.querySelector('[data-signature-clear]')?.addEventListener('click', () => {
    signature.clear()
    state.signatureFile = ''
  })

  // pekerjaan "Lainnya" dan surat keterangan untuk bangunan sewa
  const lain = form.querySelector<HTMLElement>('[data-pekerjaan-lain]')!
  field('applicant_job').addEventListener('change', () => {
    reveal(lain, value('applicant_job') === 'Lainnya')
  })
  const surat = form.querySelector<HTMLElement>('[data-surat]')!
  field('ownership_status').addEventListener('change', () => {
    reveal(surat, value('ownership_status') === 'Sewa')
  })

  // kecamatan → kelurahan
  const district = field('district') as HTMLSelectElement
  const subdistrict = field('subdistrict') as HTMLSelectElement
  void fillOptions(district, '/reference/district', 'Pilih kecamatan')
  district.addEventListener('change', () => {
    if (district.value) {
      void fillOptions(subdistrict, `/reference/sub-district?district_id=${encodeURIComponent(district.value)}`, 'Pilih kelurahan')
    } else {
      subdistrict.dataset.source = ''
      subdistrict.disabled = true
      subdistrict.replaceChildren(new Option('Pilih kecamatan dahulu', ''))
    }
  })

  // pemilih titik lokasi
  const picker = form.querySelector<HTMLElement>('[data-picker]')!
  const coords = form.querySelector<HTMLElement>('[data-coords]')!
  const setPoint = (lng: number, lat: number) => {
    field('latitude').value = lat.toFixed(7)
    field('longitude').value = lng.toFixed(7)
    const [[west, south], [east, north]] = BEKASI
    const inside = lng >= west && lng <= east && lat >= south && lat <= north
    coords.textContent = inside
      ? `Titik dipilih: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
      : 'Titik berada di luar Kota Bekasi. Pastikan letaknya sudah benar.'
    coords.classList.toggle('text-meter', !inside)
  }
  let placeMarker: ((lng: number, lat: number) => void) | undefined
  whenVisible(picker, async () => {
    try {
      const { map, maplibre } = await createMap(picker)
      picker.querySelector('[data-map-status]')?.remove()
      const marker = new maplibre.Marker({ color: '#c2182b', draggable: true })
      placeMarker = (lng, lat) => {
        marker.setLngLat([lng, lat]).addTo(map)
        setPoint(lng, lat)
      }
      map.on('click', event => placeMarker!(event.lngLat.lng, event.lngLat.lat))
      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat()
        setPoint(lng, lat)
      })
      if (value('latitude')) {
        placeMarker(Number(value('longitude')), Number(value('latitude')))
      }
    } catch {
      const status = picker.querySelector('[data-map-status]')
      if (status) {
        status.textContent = 'Peta belum dapat dimuat. Gunakan tombol lokasi saya di bawah.'
      }
    }
  })
  form.querySelector<HTMLButtonElement>('[data-locate]')?.addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
      coords.textContent = 'Perangkat ini tidak mendukung penentuan lokasi.'
      return
    }
    coords.textContent = 'Mencari lokasi Anda…'
    navigator.geolocation.getCurrentPosition(position => {
      const { longitude, latitude } = position.coords
      if (placeMarker) {
        placeMarker(longitude, latitude)
      } else {
        setPoint(longitude, latitude)
      }
    }, () => {
      coords.textContent = 'Lokasi tidak dapat diakses. Izinkan akses lokasi atau ketuk titik pada peta.'
    }, { enableHighAccuracy: true, timeout: 15_000 })
  })

  function validate (step: number): void {
    checkRequired(fieldsets[step]!)
    if (step === 0) {
      if (!/^\d{16}$/.test(value('identity_number'))) {
        invalid(field('identity_number'), 'Nomor KTP harus 16 digit angka.')
      }
      const phone = value('phone_number').replace(/[\s-]/g, '')
      if (!/^(\+62|62|0)8\d{7,12}$/.test(phone)) {
        invalid(field('phone_number'), 'Tulis nomor telepon seluler yang aktif, contoh 0812xxxxxxxx.')
      }
      if (value('email') && !(field('email') as HTMLInputElement).checkValidity()) {
        invalid(field('email'), 'Alamat email belum sesuai.')
      }
      if (value('applicant_job') === 'Lainnya' && !value('other_applicant_job')) {
        invalid(field('other_applicant_job'), 'Tuliskan pekerjaan Anda.')
      }
      if (Number(value('number_residents')) < 1) {
        invalid(field('number_residents'), 'Jumlah penghuni minimal 1 orang.')
      }
    }
    if (step === 1 && !value('latitude')) {
      invalid(picker, 'Tentukan titik lokasi bangunan pada peta.')
    }
    if (step === 2) {
      const ktp = form!.querySelector('[data-upload="filename_identity"]')
      if (!files.has('filename_identity')) {
        invalid(ktp, 'Unggah foto KTP terlebih dahulu.')
      }
      if (value('ownership_status') === 'Sewa' && !files.has('filename_description_letter')) {
        invalid(form!.querySelector('[data-upload="filename_description_letter"]'), 'Unggah surat keterangan dari pemilik bangunan.')
      }
      if (form!.querySelector('[data-upload][data-state="busy"]')) {
        throw new Error('Tunggu hingga semua foto selesai diunggah.')
      }
      if (signature.isEmpty() && !state.signatureFile) {
        invalid(form!.querySelector('[data-signature]'), 'Bubuhkan tanda tangan Anda.')
      }
    }
    if (step === 3 && !(field('setuju') as HTMLInputElement).checked) {
      invalid(field('setuju'), 'Centang pernyataan untuk melanjutkan.')
    }
  }

  const selectedText = (name: string) => {
    const select = field(name) as HTMLSelectElement
    return select.selectedOptions[0]?.text ?? ''
  }

  function addressPreview (): string {
    const parts = [
      value('address'),
      value('block') && `Blok ${value('block')}`,
      value('no') && `No. ${value('no')}`,
      (value('rt') || value('rw')) && `RT ${value('rt') || '-'}/RW ${value('rw') || '-'}`,
      `Kel. ${selectedText('subdistrict')}`,
      `Kec. ${selectedText('district')}`,
      'Kota Bekasi',
      value('postal_code'),
    ]
    return parts.filter(Boolean).join(', ')
  }

  function renderReview (): void {
    const pekerjaan = value('applicant_job') === 'Lainnya' ? value('other_applicant_job') : value('applicant_job')
    const rows: [string, string][] = [
      ['Nama', value('customer_name')],
      ['Nomor KTP', value('identity_number')],
      ['Tanggal lahir', dateLong(value('birth_date'))],
      ['Telepon', value('phone_number')],
      ['Pekerjaan', pekerjaan],
      ['Jumlah penghuni', `${value('number_residents')} orang`],
      ['Alamat pemasangan', addressPreview()],
      ['Status bangunan', value('ownership_status')],
    ]
    form!.querySelector('[data-review]')?.replaceChildren(...rows.map(([label, text]) => el('div', label === 'Alamat pemasangan' ? 'sm:col-span-2' : '', el('dt', 'text-sm text-redup', label), el('dd', 'font-semibold break-words', text || '–'))))
  }

  async function go (step: number): Promise<void> {
    if (state.moving || step === state.step) {
      return
    }
    const from = fieldsets[state.step]
    const direction = step > state.step ? 1 : -1
    state.step = step
    state.moving = true
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
      next.dataset.idle = step === STEP_TITLES.length - 1 ? 'Kirim permohonan' : 'Lanjut'
      const label = next.querySelector('[data-label]')
      if (label) {
        label.textContent = next.dataset.idle
      }
    }
    if (step === 3) {
      renderReview()
    }
    showError(error, '')
    bringIntoView(form!)
    try {
      await swapPanels(form!, from, fieldsets[step]!, direction)
    } finally {
      state.moving = false
    }
    fieldsets[step]?.querySelector<HTMLElement>('input:not([type=hidden]), select')?.focus({ preventScroll: true })
  }

  async function submit (): Promise<string> {
    if (!state.signatureFile) {
      const blob = await signature.toBlob()
      if (!blob) {
        throw new Error('Tanda tangan belum tersimpan. Silakan ulangi tanda tangan.')
      }
      state.signatureFile = await uploadFile(blob)
    }

    const pribadi = value('ownership_status') !== 'Sewa'
    const result = await ip<{ data?: { nomor_registrasi?: string | null, nomor_pengajuan?: string | null }[] }>('/new-customer/v2/insert', {
      method: 'POST',
      body: {
        customer_name: value('customer_name'),
        identity_number: value('identity_number'),
        birth_date: value('birth_date'),
        gender: value('gender'),
        phone_number: value('phone_number').replace(/[\s-]/g, ''),
        email: value('email') || null,
        applicant_job: value('applicant_job'),
        other_applicant_job: value('applicant_job') === 'Lainnya' ? value('other_applicant_job') : null,
        number_residents: Number(value('number_residents')),
        customer_type: 1,
        district: Number(value('district')),
        subdistrict: Number(value('subdistrict')),
        address: value('address'),
        block: value('block') || null,
        no: value('no') || null,
        rt: value('rt') || null,
        rw: value('rw') || null,
        postal_code: value('postal_code') || null,
        address_preview: addressPreview(),
        address_detail: value('address_detail') || null,
        latitude: value('latitude'),
        longitude: value('longitude'),
        ownership_status: value('ownership_status'),
        filename_identity: files.get('filename_identity'),
        filename_family: files.get('filename_family') ?? null,
        filename_description_letter: pribadi ? null : files.get('filename_description_letter') ?? null,
        filename_signature: state.signatureFile,
      },
    })
    // nomor registrasi baru diberikan saat verifikasi; pemohon menerima nomor pengajuan
    return String(result?.data?.[0]?.nomor_pengajuan ?? '')
  }

  prev?.addEventListener('click', () => void go(Math.max(0, state.step - 1)))

  form.addEventListener('submit', async event => {
    event.preventDefault()
    showError(error, '')
    try {
      validate(state.step)
    } catch (caught) {
      showError(error, caught instanceof Error ? caught.message : '')
      return
    }
    if (state.step < STEP_TITLES.length - 1) {
      void go(state.step + 1)
      return
    }

    setBusy(next, true, 'Mengirim…')
    try {
      const nomor = await submit()
      form.hidden = true
      document.querySelector<HTMLElement>('[data-stepper]')!.hidden = true
      if (done) {
        const number = done.querySelector<HTMLElement>('[data-done-number]')
        if (number) {
          number.hidden = !nomor
          number.replaceChildren(el('span', 'text-sm text-redup', 'Nomor pengajuan'), ticketDisplay(nomor))
        }
        enter(done)
        done.focus({ preventScroll: true })
        bringIntoView(done)
      }
    } catch (caught) {
      // tanda tangan diunggah ulang pada percobaan berikutnya bila berkas sementara hilang
      state.signatureFile = ''
      showError(error, caught instanceof ApiError ? errorMessage(caught) : caught instanceof Error && caught.message ? caught.message : errorMessage(caught))
    } finally {
      setBusy(next, false)
    }
  })
}

type Tracking = {
  submission?: { steps?: boolean }
  survey?: { steps?: boolean, survey_date?: string, cost?: { total?: number } }
  payment?: { steps?: boolean, payment_date?: string | null }
  installation?: { steps?: boolean, installation_date?: string | null }
  activation?: { steps?: boolean, activation_date?: string | null }
}

function statusActions (): HTMLElement {
  const back = el('a', 'btn btn-quiet', 'Kembali ke formulir')
  back.href = '/pelanggan/pendaftaran'
  return el('div', 'mt-10 flex flex-wrap gap-3', back)
}

export async function showRegistrationStatus (nomor: string): Promise<void> {
  const container = document.querySelector<HTMLElement>('[data-status]')
  const formArea = document.querySelector<HTMLElement>('[data-form-area]')
  if (!container) {
    return
  }
  if (formArea) {
    formArea.hidden = true
  }
  container.hidden = false
  container.replaceChildren(el('p', 'text-redup', `Memuat status permohonan ${nomor}…`))

  try {
    const data = await ip<Tracking>(`/new-customer/tracking?number=${encodeURIComponent(nomor)}`)
    const biaya = data?.survey?.cost?.total
    const stages = [
      { label: 'Permohonan diterima', done: Boolean(data?.submission?.steps), date: '' },
      { label: 'Survei lokasi', done: Boolean(data?.survey?.steps), date: data?.survey?.survey_date ?? '' },
      { label: 'Pembayaran biaya pemasangan', done: Boolean(data?.payment?.steps), date: data?.payment?.payment_date ?? '', note: !data?.payment?.steps && data?.survey?.steps && biaya ? `Biaya pemasangan ${rupiah(biaya)}` : '' },
      { label: 'Pemasangan meter', done: Boolean(data?.installation?.steps), date: data?.installation?.installation_date ?? '' },
      { label: 'Sambungan aktif', done: Boolean(data?.activation?.steps), date: data?.activation?.activation_date ?? '' },
    ]
    const current = stages.find(stage => !stage.done)

    container.replaceChildren(
      el('div', 'flex flex-wrap items-center gap-4', el('h2', 'text-2xl font-extrabold', 'Status permohonan'), ticketDisplay(nomor)),
      el('p', `notice mt-6 ${current ? '' : 'notice-ok'}`, el('span', '', el('strong', '', 'Saat ini: '), current ? `menunggu ${current.label.toLowerCase()}` : 'sambungan Anda telah aktif')),
      el('ol', 'mt-8 grid', ...stages.map((stage, index) => el('li', 'relative grid grid-cols-[2rem_1fr] gap-3 pb-6 last:pb-0',
        el('span', `relative z-10 mt-0.5 grid size-8 place-items-center rounded-full border-2 text-sm font-bold ${stage.done ? 'border-patriot bg-patriot text-white' : 'border-garis bg-white text-redup'}`, String(index + 1)),
        el('div', '',
          el('p', 'font-bold', stage.label, el('span', `ml-2 text-sm font-semibold ${stage.done ? 'text-lunas' : 'text-redup'}`, stage.done ? 'Selesai' : 'Menunggu')),
          stage.done && stage.date ? el('p', 'text-sm text-redup', dateLong(stage.date)) : null,
          stage.note ? el('p', 'text-sm', stage.note) : null,
        ),
        index < stages.length - 1 ? el('span', `absolute top-9 bottom-1 left-[0.95rem] w-0.5 ${stages[index + 1]!.done ? 'bg-patriot' : 'bg-garis'}`) : null,
      ))),
      statusActions(),
    )
  } catch (caught) {
    const notFound = caught instanceof ApiError && caught.status === 404
    // nomor pengajuan (SB…) diberikan saat mendaftar; pelacakan API baru mengenal nomor registrasi hasil verifikasi
    if (notFound && /^SB\d+$/i.test(nomor)) {
      const wa = el('a', 'link', 'WhatsApp Contact Center')
      wa.href = WHATSAPP_CC
      wa.rel = 'noopener'
      wa.target = '_blank'
      container.replaceChildren(
        el('div', 'flex flex-wrap items-center gap-4', el('h2', 'text-2xl font-extrabold', 'Status permohonan'), ticketDisplay(nomor.toUpperCase())),
        el('div', 'notice mt-6', el('p', '',
          `${nomor.toUpperCase()} adalah nomor pengajuan. Status permohonan dapat dicek di halaman ini setelah berkas diverifikasi, `,
          'menggunakan nomor registrasi 10 digit yang Anda terima saat itu. ',
          'Untuk menanyakan permohonan sebelum itu, hubungi ', wa, ' dengan menyebutkan nomor pengajuan Anda.',
        )),
        statusActions(),
      )
      container.focus()
      return
    }
    container.replaceChildren(
      el('h2', 'text-2xl font-extrabold', 'Status permohonan'),
      el('p', 'notice notice-error mt-6', notFound
        ? `Nomor registrasi ${nomor} tidak ditemukan. Periksa kembali nomor Anda. Permohonan dapat dilacak setelah diverifikasi petugas.`
        : 'Status permohonan belum dapat dimuat. Silakan coba lagi dalam beberapa saat.'),
      statusActions(),
    )
  }
  container.focus()
}
