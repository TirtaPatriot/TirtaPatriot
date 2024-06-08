export function monetize(number: string | number, del = '.') {
  return String(number).replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${del}`)
}

export function humanPeriode(periode: string, type: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' = 'long') {
  const year = periode.slice(0, 4)
  const month = periode.slice(4, 6)
  const mos = new Date(`${year}-${month}-15`).toLocaleDateString('id', { month: type })
  return `${mos} ${year}`
}

export function sqlDate(date?: Date | null, time = false) {
  const cdate = date || new Date()
  // const tzo = -date.getTimezoneOffset();
  // const dif = tzo >= 0 ? '+' : '-';
  const pad = (num: number) => {
    const norm = Math.abs(Math.floor(num))
    return (norm < 10 ? '0' : '') + norm
  }
  let result = `${cdate.getFullYear()}-${pad(cdate.getMonth() + 1)}-${pad(cdate.getDate())}`
  if (time)
    result += ` ${pad(cdate.getHours())}:${pad(cdate.getMinutes())}:${pad(cdate.getSeconds())}`

  // const zone = `${dif}${pad(tzo / 60)}:${pad(tzo % 60)}`
  return result
}

export function toTitleCase(text: string) {
  return text.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  )
}

export function sanitizePhone(phone: string, prefix = '62') {
  let contact = phone.replace(/\D+/g, '')

  if (!contact)
    return contact

  if (contact.startsWith(prefix))
    contact = contact.replace(prefix, '0')

  return contact.startsWith('0') ? prefix + contact.slice(1) : contact
}

export function masa(now?: string | number | Date) {
  const clock = (now ? new Date(now) : new Date()).getHours()
  if (clock < 12)
    return 'pagi'
  if (clock < 15)
    return 'siang'
  if (clock < 18)
    return 'sore'

  return 'malam'
}

export function createHumanPeriode(tagihan: any[], col = 'periode', type: any = 'long') {
  const periode = tagihan[0][col]
  let hperiode = humanPeriode(periode, type)
  let lastPeriode = periode
  if (tagihan.length > 1) {
    lastPeriode = tagihan[tagihan.length - 1][col]
    hperiode += ` - ${humanPeriode(lastPeriode, type)}`
    hperiode += ` (${tagihan.length} bulan)`
  }
  return hperiode
}

export const sumBy = (x: string, o: any[]) => o.reduce((total, obj) => obj[x] + total, 0)

export function firstValueOf(obj: Record<string, any>, key: string) {
  const val = obj
    && obj[key]
    && Array.isArray(obj[key])
    && obj[key].length > 0
    && obj[key][0].value

  return val || null
}

export function maskName(name: string) {
  return name.trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => {
      const half = n.length / 2
      return n.slice(0, half) + '＊'.repeat(half) + n[n.length - 1]
    })
    .join(' ')
}
