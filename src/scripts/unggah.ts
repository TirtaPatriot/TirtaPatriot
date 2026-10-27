/**
 * Kolom unggah foto ([data-upload] berisi input file): foto diperkecil lalu disimpan lewat `simpan`, dan hasilnya
 * (nama berkas atau data URL) dicatat di `files` dengan kunci data-upload.
 * Bawaan `simpan`: unggah sebagai tamu ke API Info Pelanggan (pendaftaran sambungan baru).
 */
import { INFO_PELANGGAN_API } from '../lib/info-pelanggan'
import { api, ApiError } from './api'
import { compress } from './kamera'

/** Unggah ke API Info Pelanggan sebagai tamu; hasilnya nama berkas sementara untuk dikirim bersama formulir. */
export async function uploadFile (blob: Blob): Promise<string> {
  const result = await api<{ filename?: string }>('/files/upload', { method: 'POST', body: blob, base: INFO_PELANGGAN_API })
  if (!result?.filename) {
    throw new Error('Foto belum tersimpan. Silakan coba lagi.')
  }
  return result.filename
}

export function bindUploads (form: HTMLElement, files: Map<string, string>, simpan: (blob: Blob) => Promise<string> = uploadFile): void {
  for (const box of form.querySelectorAll<HTMLElement>('[data-upload]')) {
    const input = box.querySelector<HTMLInputElement>('input[type=file]')!
    const text = box.querySelector<HTMLElement>('[data-upload-text]')!
    const key = box.dataset.upload!

    // unggahan yang sudah diganti pemohon tidak boleh menimpa hasil unggahan terbaru
    let attempt = 0
    input.addEventListener('change', async () => {
      const current = ++attempt
      const file = input.files?.[0]
      files.delete(key)
      const old = box.querySelector('img')
      if (old) {
        URL.revokeObjectURL(old.src)
        old.remove()
      }
      if (!file) {
        box.dataset.state = ''
        text.textContent = 'Pilih atau ambil foto'
        return
      }
      box.dataset.state = 'busy'
      box.removeAttribute('aria-invalid')
      text.textContent = 'Mengunggah…'
      try {
        const blob = await compress(file)
        const filename = await simpan(blob)
        if (current !== attempt) {
          return
        }
        files.set(key, filename)
        const preview = document.createElement('img')
        preview.alt = ''
        preview.src = URL.createObjectURL(blob)
        box.querySelector('svg')?.after(preview)
        box.dataset.state = 'done'
        text.textContent = `${file.name} terunggah. Ketuk untuk mengganti.`
      } catch (caught) {
        if (current !== attempt) {
          return
        }
        box.dataset.state = ''
        box.setAttribute('aria-invalid', 'true')
        text.textContent = caught instanceof Error && !(caught instanceof ApiError) ? caught.message : 'Unggahan gagal. Ketuk untuk mencoba lagi.'
      }
    })
  }
}
