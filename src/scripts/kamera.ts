/**
 * Ambil foto langsung dari kamera (getUserMedia). Tidak ada pilihan galeri: foto lama atau hasil suntingan
 * tidak dapat dipakai. Setiap foto diberi cap waktu dan keterangan (mis. nomor pelanggan) di pojok bawah.
 */
import { el } from './dom'

export type Capture = { blob: Blob, url: string, takenAt: Date }

const MAX_SIDE = 1600

export function cameraSupported (): boolean {
  return Boolean(navigator.mediaDevices?.getUserMedia) && window.isSecureContext
}

function stamp (context: CanvasRenderingContext2D, width: number, height: number, lines: string[]): void {
  const size = Math.max(14, Math.round(width / 42))
  context.font = `600 ${size}px system-ui, sans-serif`
  const padding = Math.round(size * 0.6)
  const lineHeight = Math.round(size * 1.35)
  const boxWidth = Math.max(...lines.map(line => context.measureText(line).width)) + padding * 2
  const boxHeight = lines.length * lineHeight + padding
  context.fillStyle = 'rgb(6 29 69 / 0.72)'
  context.fillRect(0, height - boxHeight, Math.min(boxWidth, width), boxHeight)
  context.fillStyle = '#ffffff'
  lines.forEach((line, index) => {
    context.fillText(line, padding, height - boxHeight + padding / 2 + lineHeight * (index + 0.8))
  })
}

/**
 * Buka kamera dalam dialog layar penuh dan kembalikan foto yang dipilih pengguna, atau null bila dibatalkan.
 * `title` tampil sebagai panduan (mis. "Foto angka meter"), `caption` ikut tercetak pada foto.
 */
export function takePhoto (title: string, hint: string, caption: string[]): Promise<Capture | null> {
  return new Promise(resolve => {
    // object-contain: yang terlihat saat membidik sama dengan yang tersimpan
    const video = el('video', 'absolute inset-0 h-full w-full bg-black object-contain')
    video.playsInline = true
    video.muted = true
    video.autoplay = true
    const preview = el('img', 'absolute inset-0 hidden h-full w-full object-contain bg-black')
    preview.alt = ''
    const status = el('p', 'absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-white', 'Membuka kamera…')
    status.setAttribute('role', 'status')
    const guide = el('div', 'pointer-events-none absolute inset-x-[12%] top-[28%] bottom-[34%] rounded-2xl border-2 border-dashed border-white/70')
    guide.setAttribute('aria-hidden', 'true')

    const close = el('button', 'btn btn-quiet bg-white/90', 'Batal')
    close.type = 'button'
    const shutter = el('button', 'grid size-18 place-items-center rounded-full border-4 border-white bg-white/25 transition-transform active:scale-95 disabled:opacity-40')
    shutter.type = 'button'
    shutter.disabled = true
    shutter.setAttribute('aria-label', 'Ambil foto')
    shutter.append(el('span', 'block size-13 rounded-full bg-white'))
    const retake = el('button', 'btn btn-quiet bg-white/90', 'Ulangi')
    retake.type = 'button'
    retake.hidden = true
    const use = el('button', 'btn btn-primary', 'Gunakan foto')
    use.type = 'button'
    use.hidden = true

    const dialog = el('dialog', 'm-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black',
      el('div', 'relative h-full w-full overflow-hidden',
        video, preview, guide, status,
        el('div', 'absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-5 pt-[max(1.25rem,env(safe-area-inset-top))]',
          el('p', 'text-lg font-bold', title),
          el('p', 'text-sm text-white/85', hint),
        ),
        el('div', 'absolute inset-x-0 bottom-0 grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-gradient-to-t from-black/75 to-transparent p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]',
          el('div', 'justify-self-start', close, retake),
          el('div', 'grid size-18 place-items-center', shutter),
          el('div', 'justify-self-end', use),
        ),
      ),
    )
    dialog.setAttribute('aria-label', title)
    document.body.append(dialog)

    let stream: MediaStream | null = null
    let result: Capture | null = null

    const finish = (value: Capture | null) => {
      stream?.getTracks().forEach(track => track.stop())
      dialog.close()
      dialog.remove()
      if (result && result !== value) {
        URL.revokeObjectURL(result.url)
      }
      resolve(value)
    }

    const showLive = () => {
      if (result) {
        URL.revokeObjectURL(result.url)
        result = null
      }
      preview.classList.add('hidden')
      video.classList.remove('hidden')
      guide.hidden = false
      shutter.hidden = false
      close.hidden = false
      retake.hidden = true
      use.hidden = true
    }

    close.addEventListener('click', () => finish(null))
    dialog.addEventListener('cancel', event => {
      event.preventDefault()
      finish(null)
    })
    retake.addEventListener('click', showLive)
    use.addEventListener('click', () => finish(result))

    shutter.addEventListener('click', () => {
      const width = video.videoWidth
      const height = video.videoHeight
      if (!width || !height) {
        return
      }
      const ratio = Math.min(1, MAX_SIDE / Math.max(width, height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      const context = canvas.getContext('2d')!
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const takenAt = new Date()
      const when = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(takenAt)
      stamp(context, canvas.width, canvas.height, [...caption, `${when} WIB`])
      canvas.toBlob(blob => {
        if (!blob) {
          return
        }
        result = { blob, url: URL.createObjectURL(blob), takenAt }
        preview.src = result.url
        preview.classList.remove('hidden')
        video.classList.add('hidden')
        guide.hidden = true
        shutter.hidden = true
        close.hidden = true
        retake.hidden = false
        use.hidden = false
        use.focus()
      }, 'image/jpeg', 0.85)
    })

    dialog.showModal()

    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then(media => {
        stream = media
        video.srcObject = media
        return video.play()
      })
      .then(() => {
        status.remove()
        shutter.disabled = false
        shutter.focus()
      })
      .catch((caught: unknown) => {
        const denied = caught instanceof DOMException && (caught.name === 'NotAllowedError' || caught.name === 'SecurityError')
        status.textContent = denied
          ? 'Akses kamera ditolak. Izinkan kamera untuk situs ini di pengaturan browser, lalu coba lagi.'
          : 'Kamera tidak dapat dibuka. Pastikan perangkat memiliki kamera dan tidak sedang dipakai aplikasi lain.'
        guide.hidden = true
      })
  })
}

/** Lokasi perangkat saat ini (akurasi tinggi), atau galat yang dapat ditampilkan. */
export function currentPosition (): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Perangkat ini tidak mendukung penentuan lokasi.'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, error => {
      reject(new Error(error.code === error.PERMISSION_DENIED
        ? 'Akses lokasi ditolak. Izinkan lokasi untuk situs ini, lalu coba lagi.'
        : 'Lokasi belum dapat ditentukan. Pastikan GPS aktif, lalu coba lagi.'))
    }, { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 })
  })
}

/** Perkecil foto dari galeri/berkas sebelum diunggah (JPG/PNG → JPEG, sisi terpanjang 1600 px). */
export async function compress (file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png)$/.test(file.type)) {
    throw new Error('Gunakan foto berformat JPG atau PNG.')
  }
  try {
    const bitmap = await createImageBitmap(file)
    const ratio = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * ratio)
    canvas.height = Math.round(bitmap.height * ratio)
    const context = canvas.getContext('2d')!
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}
