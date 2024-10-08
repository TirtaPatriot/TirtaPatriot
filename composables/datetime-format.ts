export function useDatetimeFormat(params?: string | Date) {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'long',
      timeZone: 'Asia/Jakarta',
    }).format(params ? new Date(params) : new Date())
  }
  catch {
    return null
  }
}
