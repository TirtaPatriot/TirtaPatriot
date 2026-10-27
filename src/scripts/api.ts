/** Pemanggil API layanan pelanggan (tagihan, pengaduan) dan Info Pelanggan (pendaftaran), beserta token reCAPTCHA v3. */

// API layanan pelanggan (Fastify, repo TirtaPatriot/Open); sama dengan yang dipakai situs lama
export const API_URL = (import.meta.env.PUBLIC_API_URL || 'https://papi.tirtapatriot.id/web').replace(/\/+$/, '')
const SITE_KEY = import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY as string | undefined

type Grecaptcha = {
  ready: (callback: () => void) => void
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha
  }
}

let loader: Promise<Grecaptcha | null> | undefined

function loadRecaptcha (): Promise<Grecaptcha | null> {
  if (!SITE_KEY) {
    return Promise.resolve(null)
  }

  loader ??= new Promise(resolve => {
    const script = document.createElement('script')
    script.src = `https://www.recaptcha.net/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}&hl=id`
    script.async = true
    script.addEventListener('load', () => window.grecaptcha?.ready(() => resolve(window.grecaptcha ?? null)))
    script.addEventListener('error', () => resolve(null))
    document.head.append(script)
  })

  return loader
}

/** Muat skrip reCAPTCHA lebih awal (mis. saat kolom pertama difokuskan). */
export function warmRecaptcha (): void {
  void loadRecaptcha()
}

export async function recaptchaToken (action: string): Promise<string> {
  if (!SITE_KEY) {
    console.error('PUBLIC_RECAPTCHA_SITE_KEY kosong saat build; API akan menolak permintaan (HM403).')
  }
  const grecaptcha = await loadRecaptcha()
  return grecaptcha ? grecaptcha.execute(SITE_KEY!, { action }) : ''
}

export class ApiError extends Error {
  constructor (message: string, readonly status: number, readonly data: Record<string, unknown> | null) {
    super(message)
  }

  get code (): string | undefined {
    return typeof this.data?.code === 'string' ? this.data.code : undefined
  }
}

type ApiInit = {
  method?: 'GET' | 'POST'
  /** objek dikirim sebagai JSON; Blob dikirim apa adanya (unggah berkas) */
  body?: Record<string, unknown> | Blob
  /** alamat API lain, mis. Info Pelanggan; bawaan API layanan pelanggan */
  base?: string
  /** token layanan mandiri API Open, dikirim sebagai `Authorization: Bearer` */
  bearer?: string
}

export async function api<T> (path: string, init: ApiInit = {}): Promise<T> {
  const { body } = init
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (init.bearer) {
    headers.Authorization = `Bearer ${init.bearer}`
  }
  if (body) {
    headers['Content-Type'] = body instanceof Blob ? body.type || 'application/octet-stream' : 'application/json'
  }

  let response: Response
  try {
    response = await fetch(`${init.base ?? API_URL}${path}`, {
      method: init.method ?? 'GET',
      headers,
      body: body instanceof Blob ? body : body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.', 0, null)
  }

  const text = await response.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    const payload = data && typeof data === 'object' ? data as Record<string, unknown> : null
    if (payload?.code === 'HM403') {
      throw new ApiError('Verifikasi keamanan belum berhasil. Muat ulang halaman ini, lalu coba lagi.', response.status, payload)
    }
    throw new ApiError(typeof payload?.message === 'string' ? payload.message : '', response.status, payload)
  }

  return data as T
}
