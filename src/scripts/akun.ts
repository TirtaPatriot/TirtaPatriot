/**
 * Akun Tirta Patriot Mobile di situs: masuk dengan nomor HP + PIN, daftar dan lupa PIN lewat OTP WhatsApp
 * (API Info Pelanggan /auth/*). Token JWT disimpan di sessionStorage, sehingga sesi berakhir saat tab ditutup.
 * Berkas foto diunggah sebagai tamu (tanpa token) karena API mencari berkas di folder tamu.
 */
import { INFO_PELANGGAN_API } from '../lib/info-pelanggan'
import { api, ApiError } from './api'

const KEY = 'tirtapatriot.sesi'
export const LOGIN_PATH = '/pelanggan/masuk'

export type Pelanggan = { customer_number: string, name?: string | null, label?: string }
export type User = { id: number, name: string, phone_number: string, customer_number?: string | null, customer_list?: Pelanggan[] }
export type Session = { token: string, user: User }

export function getSession (): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) as Session : null
  } catch {
    return null
  }
}

export function setSession (session: Session): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    // mode privat tanpa penyimpanan: sesi hanya hidup selama halaman terbuka
  }
}

export function clearSession (): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // diabaikan
  }
}

/** Alamat tujuan setelah masuk; hanya halaman layanan pelanggan di situs ini. */
export function safeNext (value: string | null | undefined): string {
  return value && /^\/pelanggan\/[\w/-]*$/.test(value) && !value.startsWith(LOGIN_PATH) ? value : '/pelanggan/catat-meter'
}

/** Arahkan ke halaman masuk bila belum ada sesi; kembalikan sesi bila ada. */
export function requireSession (): Session | null {
  const session = getSession()
  if (!session) {
    location.replace(`${LOGIN_PATH}?lanjut=${encodeURIComponent(location.pathname)}`)
  }
  return session
}

type Init = Parameters<typeof api>[1]

/** Panggil API Info Pelanggan; dengan `auth` token sesi ikut dikirim dan 401 mengakhiri sesi. */
export async function ip<T> (path: string, init: Init & { auth?: boolean } = {}): Promise<T> {
  const { auth, ...rest } = init
  const session = auth ? getSession() : null
  try {
    return await api<T>(path, { ...rest, base: INFO_PELANGGAN_API, token: session?.token })
  } catch (caught) {
    if (auth && caught instanceof ApiError && caught.status === 401) {
      clearSession()
      location.replace(`${LOGIN_PATH}?lanjut=${encodeURIComponent(location.pathname)}&habis=1`)
    }
    throw caught
  }
}

/** Unggah foto sebagai tamu; hasilnya nama berkas sementara untuk dikirim bersama formulir. */
export async function uploadFile (blob: Blob): Promise<string> {
  const result = await ip<{ filename?: string }>('/files/upload', { method: 'POST', body: blob })
  if (!result?.filename) {
    throw new Error('Foto belum tersimpan. Silakan coba lagi.')
  }
  return result.filename
}

/** Nomor HP ke format 62… seperti yang diterima API. */
export function normalizePhone (value: string): string {
  const digits = value.replace(/[\s-]/g, '')
  if (digits.startsWith('+62')) {
    return `62${digits.slice(3)}`
  }
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`
  }
  return digits.startsWith('8') ? `62${digits}` : digits
}

export function isPhone (value: string): boolean {
  return /^628\d{7,12}$/.test(normalizePhone(value))
}

/** Pesan galat dari API yang aman ditampilkan (sudah berbahasa Indonesia), atau pesan umum. */
export function apiMessage (caught: unknown, fallback: string): string {
  if (caught instanceof ApiError) {
    if (caught.status === 0) {
      return caught.message
    }
    const description = typeof caught.data?.description === 'string' ? caught.data.description : ''
    const message = description || caught.message
    // pesan validasi bawaan kerangka API berbahasa Inggris; jangan ditampilkan apa adanya
    if (message && !/\b(must|optional|invalid|required|exception|error)\b/i.test(message)) {
      return message.replace(/!+$/, '.')
    }
  }
  return fallback
}

/** Daftar nomor pelanggan milik akun (dari sesi; diperbarui dari API bila memungkinkan). */
export async function customerList (): Promise<Pelanggan[]> {
  const session = getSession()
  try {
    const list = await ip<Pelanggan[]>('/auth/customer-list', { auth: true })
    if (Array.isArray(list)) {
      return list
    }
  } catch {
    // pakai daftar dari sesi
  }
  return session?.user.customer_list ?? []
}

export async function addCustomer (customerNumber: string): Promise<void> {
  const result = await ip<{ token?: string, user?: User }>('/auth/add-customer', {
    method: 'POST',
    auth: true,
    body: { customer_number: customerNumber.replace(/\D/g, '') },
  })
  if (result?.token && result.user) {
    setSession({ token: result.token, user: result.user })
  }
}
