/**
 * Catat meter mandiri lewat API Open (token layanan dari langkah verifikasi):
 *  - GET  /catat-meter  → { boleh, pesan, periode, stand_awal }
 *  - POST /catat-meter  { stand, latitude, longitude, keterangan, foto_meter, foto_rumah (data URL) }
 * Foto hanya dari kamera langsung (kamera.ts), lokasi GPS wajib. Aturan jadwal dan stand diperiksa ulang di server.
 */
import { angka } from '../lib/viz'
import { el, setBusy, showError } from './dom'
import { cameraSupported, currentPosition, takePhoto, type Capture } from './kamera'
import { blobToDataUrl, layanan, mountVerifikasi, pesanGalat, SesiBerakhir } from './layanan'
import { bringIntoView, enter } from './motion'
import { createWizard } from './wizard'

const TITLES = ['Verifikasi', 'Foto meter', 'Rumah dan lokasi']
/** pemakaian di atas angka ini diminta dipastikan ulang (kemungkinan salah ketik) */
const WAJAR = 150

type Kelayakan = {
  boleh: boolean
  pesan: string
  periode: number
  stand_awal: number
  ideal: boolean
  hari_catat: number | null
  toleransi_hari: number
  dicatat_petugas: boolean
  tanggal_petugas: string | null
}

const TANGGAL = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', timeZone: 'Asia/Jakarta' })

/** Pemberitahuan jadwal: tanggal ideal (anjuran, bukan syarat) dan angka petugas yang didahulukan. */
function jadwalNotices (cek: Kelayakan): HTMLElement[] {
  const notices: HTMLElement[] = []
  if (cek.dicatat_petugas) {
    const tanggal = cek.tanggal_petugas ? ` pada ${TANGGAL.format(new Date(cek.tanggal_petugas))}` : ''
    notices.push(el('p', 'notice', `Petugas telah mencatat meter Anda bulan ini${tanggal}. Anda tetap dapat melapor; rekening bulan ini memakai angka petugas.`))
  }
  if (cek.hari_catat) {
    // bulan berjalan menurut WIB, bukan zona waktu perangkat
    const wib = new Date(Date.now() + 7 * 3600_000)
    const akhirBulan = new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth() + 1, 0)).getUTCDate()
    const dari = Math.max(1, cek.hari_catat - cek.toleransi_hari)
    const sampai = Math.min(akhirBulan, cek.hari_catat + cek.toleransi_hari)
    notices.push(cek.ideal
      ? el('p', 'notice notice-ok', `Hari ini sesuai jadwal pencatatan Anda (tanggal ${dari}–${sampai}).`)
      : el('p', 'notice notice-warn', `Idealnya meter dicatat pada tanggal ${dari}–${sampai}, sesuai pencatatan bulan lalu. Bila dicatat di luar tanggal tersebut, pemakaian bulan ini dapat tercatat lebih rendah dan bulan berikutnya lebih tinggi, atau sebaliknya. Laporan tetap dapat dikirim.`))
  }
  return notices
}

export function initCatatMeter (): void {
  const form = document.querySelector<HTMLFormElement>('[data-catat-form]')
  if (!form) {
    return
  }

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
    dicatatPetugas: false,
  }

  const wizard = createWizard(form, TITLES, { lastLabel: 'Kirim laporan' })
  const verifikasi = mountVerifikasi(form.querySelector<HTMLElement>('[data-verifikasi]')!)

  if (!cameraSupported()) {
    showError(error, 'Browser ini tidak dapat membuka kamera. Gunakan Chrome atau Safari terbaru di ponsel.')
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
    const sesi = await verifikasi.lanjut()
    const cek = await layanan<Kelayakan>('/catat-meter')
    if (!cek.boleh) {
      throw new Error(cek.pesan)
    }
    state.dicatatPetugas = cek.dicatat_petugas
    form!.querySelector('[data-jadwal]')!.replaceChildren(...jadwalNotices(cek))
    if (sesi.nomor !== state.customer) {
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
    state.customer = sesi.nomor
    state.firstMeter = Number(cek.stand_awal) || 0
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
    const [fotoMeter, fotoRumah] = await Promise.all([blobToDataUrl(state.photos.meter!.blob), blobToDataUrl(state.photos.rumah.blob)])
    await layanan('/catat-meter', {
      method: 'POST',
      body: {
        stand: Number(standInput.value),
        latitude: state.position!.coords.latitude,
        longitude: state.position!.coords.longitude,
        keterangan: (form!.elements.namedItem('keterangan') as HTMLTextAreaElement).value.trim(),
        foto_meter: fotoMeter,
        foto_rumah: fotoRumah,
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
        done.querySelector('[data-done-catatan]')!.textContent = state.dicatatPetugas
          ? 'Petugas telah mencatat meter Anda bulan ini, sehingga rekening memakai angka petugas. Laporan Anda kami simpan sebagai pembanding.'
          : 'Angka ini dipakai untuk rekening bulan ini bila petugas tidak mencatat meter Anda.'
        done.querySelector('[data-done-stand]')!.textContent = angka(Number(standInput.value))
        enter(done)
        done.focus({ preventScroll: true })
        bringIntoView(done)
      }
    } catch (caught) {
      if (caught instanceof SesiBerakhir) {
        verifikasi.reset()
        void wizard.go(0)
      }
      showError(error, pesanGalat(caught, 'Laporan belum berhasil dikirim. Silakan coba lagi dalam beberapa saat.'))
    } finally {
      setBusy(next, false)
    }
  })
}
