/** Pemanggil API layanan pelanggan (tagihan, pengaduan) beserta token reCAPTCHA v3. */

// API layanan pelanggan (Fastify, repo TirtaPatriot/Open); sama dengan yang dipakai situs lama
export const API_URL = (import.meta.env.PUBLIC_API_URL || 'https://open.tirtapatriot.net/web').replace(/\/+$/, '')
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

export async function api<T> (path: string, init: { method?: 'GET' | 'POST', body?: Record<string, unknown> } = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: init.method ?? 'GET',
      headers: init.body ? { 'Content-Type': 'application/json', 'Accept': 'application/json' } : { Accept: 'application/json' },
      body: init.body ? JSON.stringify(init.body) : undefined,
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
    const body = data && typeof data === 'object' ? data as Record<string, unknown> : null
    throw new ApiError(typeof body?.message === 'string' ? body.message : '', response.status, body)
  }

  return data as T
}
