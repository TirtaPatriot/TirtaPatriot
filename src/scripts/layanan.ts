/**
 * Layanan mandiri lewat API Open (/web): verifikasi kepemilikan nomor pelanggan, lalu catat meter dan pengajuan
 * perubahan data dengan token `Authorization: Bearer` yang berlaku 30 menit untuk satu nomor pelanggan.
 *  - POST /akses { nomor, nama, bayar, g-recaptcha-response } → { token, exp, nomor, nama }
 * Token disimpan di sessionStorage (hilang saat tab ditutup).
 */
import { api, ApiError, recaptchaToken, warmRecaptcha } from './api'
import { el } from './dom'
import { reveal } from './motion'

const KEY = 'tirtapatriot.layanan'

export type Sesi = { token: string, exp: number, nomor: string, nama: string }

export function getSesi (): Sesi | null {
  try {
    const sesi = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Sesi | null
    // sisakan satu menit agar token tidak kedaluwarsa di tengah pengiriman
    return sesi && sesi.exp * 1000 > Date.now() + 60_000 ? sesi : null
  } catch {
    return null
  }
}

function setSesi (sesi: Sesi | null): void {
  try {
    if (sesi) {
      sessionStorage.setItem(KEY, JSON.stringify(sesi))
    } else {
      sessionStorage.removeItem(KEY)
    }
  } catch {
    // mode privat tanpa penyimpanan: verifikasi diulang bila halaman dimuat ulang
  }
}

export class SesiBerakhir extends Error {}

/** Panggil API Open dengan token layanan; token kedaluwarsa mengakhiri sesi. */
export async function layanan<T> (path: string, init: Parameters<typeof api>[1] = {}): Promise<T> {
  const sesi = getSesi()
  if (!sesi) {
    throw new SesiBerakhir('Sesi layanan berakhir. Silakan verifikasi ulang nomor pelanggan Anda.')
  }
  try {
    return await api<T>(path, { ...init, bearer: sesi.token })
  } catch (caught) {
    if (caught instanceof ApiError && caught.status === 401) {
      setSesi(null)
      throw new SesiBerakhir(caught.message || 'Sesi layanan berakhir. Silakan verifikasi ulang nomor pelanggan Anda.', { cause: caught })
    }
    throw caught
  }
}

/** Pesan galat yang aman ditampilkan: pesan API Open (berbahasa Indonesia) atau pesan cadangan. */
export function pesanGalat (caught: unknown, fallback: string): string {
  if (caught instanceof ApiError) {
    return caught.message || fallback
  }
  return caught instanceof Error && caught.message ? caught.message : fallback
}

export function blobToDataUrl (blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)))
    reader.addEventListener('error', () => reject(new Error('Foto belum dapat dibaca. Silakan ambil ulang.')))
    reader.readAsDataURL(blob)
  })
}


/**
 * Langkah verifikasi di dalam formulir bertahap ([data-verifikasi]). Bila sesi masih berlaku, isian disembunyikan dan
 * nomor yang terverifikasi ditampilkan. Mengembalikan fungsi yang dijalankan saat pengguna menekan Lanjut.
 */
export function mountVerifikasi (root: HTMLElement): { lanjut: () => Promise<Sesi>, reset: () => void } {
  const fields = root.querySelector<HTMLElement>('[data-verifikasi-isian]')!
  const done = root.querySelector<HTMLElement>('[data-verifikasi-ok]')!
  const input = (name: string) => root.querySelector<HTMLInputElement>(`[name="${name}"]`)!

  const tampil = () => {
    const sesi = getSesi()
    fields.hidden = Boolean(sesi)
    done.hidden = !sesi
    if (sesi) {
      // nama tidak ditampilkan lagi: pengguna baru saja mengetiknya sendiri
      done.querySelector('[data-verifikasi-nomor]')!.textContent = sesi.nomor
    }
  }
  tampil()

  root.querySelector('[data-verifikasi-ganti]')?.addEventListener('click', () => {
    setSesi(null)
    reveal(done, false)
    reveal(fields, true)
    input('nomor').focus()
    // halaman membersihkan data pelanggan sebelumnya (riwayat, pengajuan)
    root.dispatchEvent(new CustomEvent('verifikasi:ganti', { bubbles: true }))
  })
  for (const name of ['nomor', 'bayar']) {
    input(name).addEventListener('input', event => {
      const target = event.target as HTMLInputElement
      target.value = target.value.replace(/\D/g, '')
    })
  }
  input('nomor').addEventListener('focus', warmRecaptcha, { once: true })

  return {
    reset: () => {
      setSesi(null)
      tampil()
    },
    lanjut: async () => {
      const sesi = getSesi()
      if (sesi) {
        return sesi
      }
      // sesi berakhir selagi isian tersembunyi: tampilkan lagi isiannya, jangan membaca isian kosong
      if (fields.hidden) {
        tampil()
        throw new SesiBerakhir('Sesi layanan berakhir. Silakan verifikasi ulang nomor pelanggan Anda.')
      }
      const nomor = input('nomor').value.trim()
      const nama = input('nama').value.trim()
      const bayar = input('bayar').value.trim()
      if (nomor.length < 10) {
        throw new Error('Nomor pelanggan terdiri dari 10 sampai 12 digit, sesuai rekening air.')
      }
      if (!nama) {
        throw new Error('Tulis nama lengkap pelanggan sesuai rekening air.')
      }
      if (!bayar) {
        throw new Error('Tulis jumlah pembayaran rekening terakhir Anda.')
      }
      const result = await api<Sesi>('/akses', {
        method: 'POST',
        body: { nomor, nama, bayar, 'g-recaptcha-response': await recaptchaToken('layanan') },
      })
      setSesi(result)
      tampil()
      return result
    },
  }
}

/** Kotak pesan kecil (mis. kelayakan catat meter) sebagai elemen DOM. */
export function notice (kind: 'ok' | 'warn' | 'error', text: string): HTMLElement {
  return el('p', `notice ${kind === 'ok' ? 'notice-ok' : kind === 'warn' ? 'notice-warn' : 'notice-error'}`, text)
}

