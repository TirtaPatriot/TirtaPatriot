/**
 * Kolom unggah foto ([data-upload] berisi input file): foto diperkecil, diunggah sebagai tamu ke API Info Pelanggan,
 * dan nama berkas hasilnya disimpan di `files` dengan kunci data-upload.
 */
import { ApiError } from './api'
import { uploadFile } from './akun'
import { compress } from './kamera'

export function bindUploads (form: HTMLElement, files: Map<string, string>): void {
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
        const filename = await uploadFile(blob)
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
