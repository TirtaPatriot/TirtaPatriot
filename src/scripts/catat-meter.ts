/**
 * Catat meter mandiri (API Info Pelanggan, akun wajib):
 *  - GET  /self-meter-report/validation?customer_number=  → { history: { first_meter } } atau 400 dengan alasan
 *  - POST /files/upload (tamu)                             → nama berkas foto meter dan foto rumah
 *  - POST /self-meter-report/insert { customer_number, last_meter, latitude, longitude, description, file_meter_photo, file_house_photo }
 * Foto hanya dari kamera langsung (kamera.ts), lokasi GPS wajib.
 */
import { angka } from '../lib/viz'
import { apiMessage, ip, requireSession, uploadFile } from './akun'
import { mountCustomerPicker, renderAccountBar } from './akun-ui'
import { setBusy, showError } from './dom'
import { cameraSupported, currentPosition, takePhoto, type Capture } from './kamera'
import { bringIntoView, enter } from './motion'
import { createWizard } from './wizard'

const TITLES = ['Pelanggan', 'Foto meter', 'Rumah dan lokasi']
/** pemakaian di atas angka ini diminta dipastikan ulang (kemungkinan salah ketik) */
const WAJAR = 150

type Validasi = { history?: { first_meter?: number | string | null } }

export async function initCatatMeter (): Promise<void> {
  const session = requireSession()
  const form = document.querySelector<HTMLFormElement>('[data-catat-form]')
  if (!session || !form) {
    return
  }
  renderAccountBar(session)

  const error = form.querySelector<HTMLElement>(':scope > [data-error]')
  const next = form.querySelector<HTMLButtonElement>('[data-next]')
  const standInput = form.elements.namedItem('stand') as HTMLInputElement
  const firstMeterOut = form.querySelector<HTMLElement>('[data-first-meter]')!
  const usageOut = form.querySelector<HTMLElement>('[data-usage]')!
  const locationOut = form.querySelector<HTMLElement>('[data-location]')!

  const state = {
    customer: '',
    firstMeter: 0,
    photos: {} as Record<'meter' | 'rumah', Capture | undefined>,
    position: null as GeolocationPosition | null,
    confirmedHighUsage: '',
  }

  const wizard = createWizard(form, TITLES, { lastLabel: 'Kirim laporan' })
  const selected = await mountCustomerPicker(form.querySelector<HTMLElement>('[data-picker]')!, 'nopel-catat')

  if (!cameraSupported()) {
    showError(error, 'Browser ini tidak dapat membuka kamera. Gunakan Chrome atau Safari terbaru di ponsel, atau aplikasi Tirta Patriot Mobile.')
  }

  // pemakaian dihitung saat angka diketik
  const updateUsage = () => {
    standInput.value = standInput.value.replace(/\D/g, '')
    const stand = Number(standInput.value)
    usageOut.textContent = standInput.value ? `${angka(Math.max(0, stand - state.firstMeter))} m³` : '–'
    usageOut.classList.toggle('text-meter', Boolean(standInput.value) && stand < state.firstMeter)
  }
  standInput.addEventListener('input', updateUsage)

  // kamera
  for (const box of form.querySelectorAll<HTMLElement>('[data-shot]')) {
    const kind = box.dataset.shot as 'meter' | 'rumah'
    const preview = box.querySelector<HTMLImageElement>('[data-shot-preview]')!
    const label = box.querySelector<HTMLElement>('[data-shot-label]')!
    box.querySelector<HTMLButtonElement>('[data-shot-open]')!.addEventListener('click', async () => {
      const capture = await takePhoto(
        kind === 'meter' ? 'Foto angka meter' : 'Foto tampak depan rumah',
        kind === 'meter' ? 'Pastikan seluruh angka meter terbaca jelas di dalam bingkai.' : 'Usahakan nomor rumah ikut terlihat.',
        [`No. pelanggan ${state.customer}`],
      )
      if (!capture) {
        return
      }
      const old = state.photos[kind]
      if (old) {
        URL.revokeObjectURL(old.url)
      }
      state.photos[kind] = capture
      preview.src = capture.url
      preview.classList.remove('hidden')
      label.textContent = 'Ambil ulang foto'
      box.removeAttribute('aria-invalid')
    })
  }

  // lokasi
  const locate = async () => {
    locationOut.textContent = 'Mengambil lokasi…'
    try {
      const position = await currentPosition()
      state.position = position
      locationOut.textContent = `Lokasi tercatat (akurasi ±${Math.round(position.coords.accuracy)} m).`
    } catch (caught) {
      state.position = null
      locationOut.textContent = caught instanceof Error ? caught.message : 'Lokasi belum dapat ditentukan.'
    }
  }
  form.querySelector<HTMLButtonElement>('[data-locate]')!.addEventListener('click', () => void locate())

  async function validateCustomer (): Promise<void> {
    const customer = selected()
    if (!customer) {
      throw new Error('Pilih atau tambahkan nomor pelanggan terlebih dahulu.')
    }
    const result = await ip<Validasi>(`/self-meter-report/validation?customer_number=${encodeURIComponent(customer)}`, { auth: true })
    if (customer !== state.customer) {
      // foto lama memuat cap nomor pelanggan sebelumnya
      for (const capture of Object.values(state.photos)) {
        if (capture) {
          URL.revokeObjectURL(capture.url)
        }
      }
      state.photos = { meter: undefined, rumah: undefined }
      for (const box of form!.querySelectorAll<HTMLElement>('[data-shot]')) {
        box.querySelector('[data-shot-preview]')!.classList.add('hidden')
        box.querySelector('[data-shot-label]')!.textContent = 'Buka kamera'
      }
    }
    state.customer = customer
    state.firstMeter = Number(result?.history?.first_meter ?? 0) || 0
    firstMeterOut.textContent = `${angka(state.firstMeter)} m³`
    updateUsage()
  }

  function validateMeter (): void {
    if (!state.photos.meter) {
      form!.querySelector('[data-shot="meter"]')!.setAttribute('aria-invalid', 'true')
      throw new Error('Ambil foto angka meter terlebih dahulu.')
    }
    if (!standInput.value) {
      throw new Error('Tulis angka meter saat ini.')
    }
    const stand = Number(standInput.value)
    if (stand < state.firstMeter) {
      throw new Error(`Angka meter tidak boleh lebih kecil dari stand bulan lalu (${angka(state.firstMeter)} m³). Periksa kembali angka pada meter.`)
    }
    const usage = stand - state.firstMeter
    if (usage > WAJAR && state.confirmedHighUsage !== standInput.value) {
      state.confirmedHighUsage = standInput.value
      throw new Error(`Pemakaian ${angka(usage)} m³ lebih tinggi dari biasanya. Bila angka sudah benar, tekan Lanjut sekali lagi.`)
    }
  }

  async function send (): Promise<void> {
    if (!state.photos.rumah) {
      form!.querySelector('[data-shot="rumah"]')!.setAttribute('aria-invalid', 'true')
      throw new Error('Ambil foto tampak depan rumah terlebih dahulu.')
    }
    if (!state.position) {
      await locate()
      if (!state.position) {
        throw new Error('Lokasi diperlukan untuk laporan ini. Izinkan akses lokasi, lalu tekan Ambil lokasi.')
      }
    }
    const [meterFile, houseFile] = await Promise.all([uploadFile(state.photos.meter!.blob), uploadFile(state.photos.rumah.blob)])
    await ip('/self-meter-report/insert', {
      method: 'POST',
      auth: true,
      body: {
        customer_number: state.customer,
        last_meter: standInput.value,
        latitude: String(state.position!.coords.latitude),
        longitude: String(state.position!.coords.longitude),
        description: (form!.elements.namedItem('keterangan') as HTMLTextAreaElement).value.trim(),
        file_meter_photo: meterFile,
        file_house_photo: houseFile,
      },
    })
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
        await validateCustomer()
        void wizard.go(1)
      } else if (wizard.step === 1) {
        validateMeter()
        void wizard.go(2)
        if (!state.position) {
          void locate()
        }
      } else {
        await send()
        form.hidden = true
        document.querySelector<HTMLElement>('[data-stepper]')!.hidden = true
        const done = document.querySelector<HTMLElement>('[data-done]')!
        done.querySelector('[data-done-stand]')!.textContent = angka(Number(standInput.value))
        enter(done)
        done.focus({ preventScroll: true })
        bringIntoView(done)
      }
    } catch (caught) {
      showError(error, caught instanceof Error && !('status' in caught) ? caught.message : apiMessage(caught, 'Laporan belum berhasil dikirim. Silakan coba lagi dalam beberapa saat.'))
    } finally {
      setBusy(next, false)
    }
  })
}
