const TIME_ZONE = 'Asia/Jakarta'

const ALWAYS_UPPER = /\b(Rt|Rw|Dki|Pt|Ii|Iii|Iv)\b/g

/**
 * Data alamat dari CMS sering seluruhnya HURUF KAPITAL. Ubah jadi Title Case
 * hanya jika memang kapital semua, agar teks yang sudah rapi tidak dirusak.
 */
export function titleCase (text?: string | null): string {
  if (!text) {
    return ''
  }

  if (text !== text.toUpperCase()) {
    return text
  }

  return text
    .toLowerCase()
    .replace(/(^|[\s./(-])([a-z])/g, (_match, prefix: string, char: string) => prefix + char.toUpperCase())
    .replace(ALWAYS_UPPER, match => match.toUpperCase())
}

function format (date: string | Date | null | undefined, options: Intl.DateTimeFormatOptions): string {
  if (!date) {
    return ''
  }

  try {
    return new Intl.DateTimeFormat('id-ID', { timeZone: TIME_ZONE, ...options }).format(new Date(date))
  } catch {
    return ''
  }
}

export function dateLong (date?: string | Date | null): string {
  return format(date, { dateStyle: 'long' })
}

export function dateShort (date?: string | Date | null): string {
  return format(date, { dateStyle: 'medium' })
}

export function dateTimeShort (date?: string | Date | null): string {
  return format(date, { dateStyle: 'long', timeStyle: 'short' })
}

export function numberId (value?: number | string | null): string {
  const numeric = typeof value === 'string' ? Number(value) : value
  if (typeof numeric !== 'number' || Number.isNaN(numeric)) {
    return String(value ?? '')
  }

  return new Intl.NumberFormat('id-ID').format(numeric)
}
