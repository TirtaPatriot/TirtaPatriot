/**
 * Akses baca ke CMS Directus (cms.tirtapatriot.net). Dipakai saat build oleh loader
 * content collection, dan oleh skrip klien untuk data yang harus selalu terbaru.
 */

export const DIRECTUS_URL = (import.meta.env.PUBLIC_DIRECTUS_URL || 'https://cms.tirtapatriot.net').replace(/\/+$/, '')

/** Gambar pengganti bila konten tidak punya sampul (foto kantor pusat). */
export const DEFAULT_COVER = 'C74BDC20-E6AE-423E-BE27-68F220D0F119'

type Query = Record<string, string | number | undefined>

/** Gangguan yang masih berlangsung (dipakai saat build dan oleh browser). */
export const GANGGUAN_QUERY: Query = {
  'fields': 'id,title,subtitle,image,content,waktu_mulai,estimasi_selesai',
  'filter[status][_eq]': 'published',
  'filter[selesai][_null]': 'true',
  'sort': '-waktu_mulai',
}

export async function directusItems<T> (collection: string, query: Query = {}): Promise<T> {
  const url = new URL(`${DIRECTUS_URL}/items/${collection}`)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  // build statis: CMS yang sesaat lambat tidak boleh langsung menggagalkan deploy
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Directus ${collection}: HTTP ${response.status}`)
      }

      const body = await response.json() as { data: T }
      return body.data
    } catch (error) {
      lastError = error
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }

  throw lastError
}

type AssetOptions = {
  width?: number
  height?: number
  quality?: number
  fit?: 'cover' | 'contain' | 'inside' | 'outside'
  format?: 'webp' | 'jpg' | 'png' | 'auto'
}

/**
 * Ubah id aset (atau URL /assets/ penuh) menjadi URL transformasi gambar Directus.
 * Gambar diperkecil oleh CMS, bukan diunduh saat build.
 */
export function assetUrl (source: string | null | undefined, options: AssetOptions = {}): string {
  const raw = String(source || DEFAULT_COVER).trim()
  if (/^(?:https?:)?\/\//.test(raw) && !raw.includes('/assets/')) {
    return raw
  }

  const id = raw.slice(raw.lastIndexOf('/assets/') + 1).replace(/^assets\//, '').split('?')[0]
  const url = new URL(`${DIRECTUS_URL}/assets/${id}`)
  const { format = 'webp', quality = 72, ...rest } = options
  url.searchParams.set('format', format)
  url.searchParams.set('quality', String(quality))
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

/** `srcset` lebar-berbasis untuk gambar Directus. */
export function assetSrcset (source: string | null | undefined, widths: number[], options: Omit<AssetOptions, 'width'> = {}): string {
  return widths.map(width => `${assetUrl(source, { ...options, width })} ${width}w`).join(', ')
}
