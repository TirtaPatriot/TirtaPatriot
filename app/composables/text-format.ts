const ALWAYS_UPPER = /\b(Rt|Rw|Dki|Pt|Ii|Iii|Iv)\b/g

/**
 * Data alamat dari CMS sering seluruhnya HURUF KAPITAL. Ubah jadi Title Case
 * hanya jika memang kapital semua, agar teks yang sudah rapi tidak dirusak.
 */
export function useTitleCase (text?: string | null) {
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

export function useDateOnly (date?: string | Date | null) {
  if (!date) {
    return ''
  }

  try {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(date))
  } catch {
    return ''
  }
}

export function useDateTimeShort (date?: string | Date | null) {
  if (!date) {
    return ''
  }

  try {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(date))
  } catch {
    return ''
  }
}
