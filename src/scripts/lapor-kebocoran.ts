/**
 * Lapor kebocoran oleh masyarakat (tanpa nomor pelanggan) lewat API Open:
 *  - GET  /pelaporan → { jenis: string[] }
 *  - POST /pelaporan { jenis, pelapor, telepon, alamat, keterangan, latitude, longitude, foto: dataURL[], g-recaptcha-response } → { nomor }
 * Status dilacak di halaman pengaduan (?tiket=nomor). Foto dari kamera (bercap waktu) atau galeri, 1–3 foto.
 */
import { api, recaptchaToken, warmRecaptcha } from './api'
import { el, setBusy, showError } from './dom'
import { cameraSupported, compress, takePhoto } from './kamera'
import { blobToDataUrl, pesanGalat } from './layanan'
import { bringIntoView, enter } from './motion'
import { ticketDisplay } from './pengaduan'
import { mountLocationPicker } from './pilih-lokasi'
import { createWizard } from './wizard'

const TITLES = ['Lokasi', 'Foto', 'Pelapor']
const MAKS_FOTO = 3

type Foto = { blob: Blob, url: string }

export function initLaporKebocoran (): void {
  const form = document.querySelector<HTMLFormElement>('[data-lapor-form]')
  if (!form) {
    return
  }

  const error = form.querySelector<HTMLElement>(':scope > [data-error]')
  const next = form.querySelector<HTMLButtonElement>('[data-next]')
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  const value = (name: string) => field(name).value.trim()
  const list = form.querySelector<HTMLElement>('[data-photos]')!
  const actions = form.querySelector<HTMLElement>('[data-photo-actions]')!
  const cameraButton = form.querySelector<HTMLButtonElement>('[data-camera]')!
  const gallery = form.querySelector<HTMLInputElement>('[data-gallery]')!
  const photos: Foto[] = []

  const wizard = createWizard(form, TITLES, { lastLabel: 'Kirim laporan' })
  const { picker, inside } = mountLocationPicker(form)

  // jenis laporan dari ERP (saat ini hanya pipa bocor); pilihan bawaan tetap dipakai bila API tidak terjangkau
  void api<{ jenis?: string[] }>('/pelaporan').then(data => {
    const jenis = field('jenis') as HTMLSelectElement
    if (data?.jenis?.length && data.jenis.join() !== [...jenis.options].map(option => option.value).join()) {
      jenis.replaceChildren(...data.jenis.map(label => new Option(label === 'Pipa Distri Bocor' ? 'Pipa bocor' : label, label)))
    }
  }).catch(() => {})

  if (!cameraSupported()) {
    cameraButton.hidden = true
  }

  const renderPhotos = () => {
    list.replaceChildren(...photos.map((photo, index) => {
      const image = el('img', 'aspect-[4/3] w-full rounded-lg object-cover ring-1 ring-garis')
      image.src = photo.url
      image.alt = `Foto ${index + 1}`
      const remove = el('button', 'link text-sm', 'Hapus')
      remove.type = 'button'
      remove.setAttribute('aria-label', `Hapus foto ${index + 1}`)
      remove.addEventListener('click', () => {
        URL.revokeObjectURL(photo.url)
        photos.splice(index, 1)
        renderPhotos()
      })
      return el('li', 'grid gap-1.5', image, remove)
    }))
    actions.hidden = photos.length >= MAKS_FOTO
    if (photos.length) {
      list.removeAttribute('aria-invalid')
      showError(error, '')
    }
  }

  cameraButton.addEventListener('click', async () => {
    const capture = await takePhoto('Foto kebocoran', 'Perlihatkan titik kebocoran dan patokan di sekitarnya.', ['Lapor kebocoran'])
    if (capture) {
      photos.push({ blob: capture.blob, url: capture.url })
      renderPhotos()
    }
  })
  gallery.addEventListener('change', async () => {
    const file = gallery.files?.[0]
    gallery.value = ''
    if (!file) {
      return
    }
    try {
      const blob = await compress(file)
      photos.push({ blob, url: URL.createObjectURL(blob) })
      renderPhotos()
    } catch (caught) {
      showError(error, pesanGalat(caught, 'Foto belum dapat dibaca. Silakan pilih foto lain.'))
    }
  })

  field('pelapor').addEventListener('focus', warmRecaptcha, { once: true })

  function validate (step: number): void {
    if (step === 0) {
      if (!value('latitude')) {
        picker.setAttribute('aria-invalid', 'true')
        throw new Error('Tentukan titik kebocoran pada peta.')
      }
      if (!inside()) {
        throw new Error('Titik berada di luar Kota Bekasi. Geser penanda ke letak kebocoran.')
      }
      if (!value('alamat')) {
        throw new Error('Tulis alamat atau patokan lokasi kebocoran.')
      }
    } else if (step === 1) {
      if (!photos.length) {
        list.setAttribute('aria-invalid', 'true')
        throw new Error('Lampirkan sedikitnya satu foto kebocoran.')
      }
    } else {
      if (!value('pelapor')) {
        throw new Error('Tulis nama Anda sebagai pelapor.')
      }
      if (!/^(62|0)\d{8,13}$/.test(telepon())) {
        throw new Error('Nomor telepon tidak valid. Contoh: 0812 3456 7890.')
      }
    }
  }

  // nomor telepon dikirim sebagai angka saja, sama dengan yang diperiksa
  const telepon = () => value('telepon').replace(/\D+/g, '')

  async function send (): Promise<string> {
    const foto = await Promise.all(photos.map(photo => blobToDataUrl(photo.blob)))
    const result = await api<{ nomor: string }>('/pelaporan', {
      method: 'POST',
      body: {
        'jenis': value('jenis'),
        'pelapor': value('pelapor'),
        'telepon': telepon(),
        'alamat': value('alamat'),
        'keterangan': value('keterangan'),
        'latitude': Number(value('latitude')),
        'longitude': Number(value('longitude')),
        foto,
        'g-recaptcha-response': await recaptchaToken('pelaporan'),
      },
    })
    return result.nomor
  }

  form.addEventListener('submit', async event => {
    event.preventDefault()
    if (wizard.busy) {
      return
    }
    showError(error, '')
    const last = wizard.step === TITLES.length - 1
    setBusy(next, true, last ? 'Mengirim…' : 'Memeriksa…')
    try {
      validate(wizard.step)
      if (!last) {
        void wizard.go(wizard.step + 1)
        return
      }
      const nomor = await send()
      form.hidden = true
      document.querySelector<HTMLElement>('[data-stepper]')!.hidden = true
      const done = document.querySelector<HTMLElement>('[data-done]')!
      done.querySelector('[data-done-ticket]')!.replaceChildren(ticketDisplay(nomor))
      done.querySelector<HTMLAnchorElement>('[data-done-link]')!.href = `/pelanggan/pengaduan?tiket=${encodeURIComponent(nomor)}`
      enter(done)
      done.focus({ preventScroll: true })
      bringIntoView(done)
    } catch (caught) {
      showError(error, pesanGalat(caught, 'Laporan belum berhasil dikirim. Silakan coba lagi dalam beberapa saat.'))
    } finally {
      setBusy(next, false)
    }
  })
}
