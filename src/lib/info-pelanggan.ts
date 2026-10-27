/**
 * Pengumuman dari sistem Informasi Pelanggan (back-office aplikasi Tirta Patriot Mobile),
 * dibaca lewat API publik pelanggan.api.tirtapatriot.co (GET /news, CORS terbuka).
 * Humas menerbitkan "Informasi Gangguan Layanan" di sana; entri hanya tampil selama
 * periode tayangnya (info_pelanggan.vw_berita_v2), sehingga yang muncul = yang sedang berlaku.
 */
export const INFO_PELANGGAN_API = (import.meta.env.PUBLIC_INFO_PELANGGAN_API || 'https://pelanggan.api.tirtapatriot.co').replace(/\/+$/, '')

export type Pengumuman = {
  id: string
  title: string
  description: string
  image: string | null
  cover_image: string | null
  date: string
  status: string | null
  type: string
}

export function isGangguan (item: Pengumuman): boolean {
  return /gangguan|pemadaman|perbaikan pipa/i.test(item.title) || Boolean(item.status)
}

export async function fetchPengumuman (): Promise<Pengumuman[]> {
  const response = await fetch(`${INFO_PELANGGAN_API}/news?type=all&limit=50`, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Informasi Pelanggan: HTTP ${response.status}`)
  }
  const body = await response.json() as { announcement?: Pengumuman[], news?: Pengumuman[] }
  // pengumuman utama juga muncul di daftar berita; satukan berdasarkan id
  const all = [...(body.announcement ?? []), ...(body.news ?? [])]
  return [...new Map(all.map(item => [item.id, item])).values()]
}

export async function fetchGangguan (): Promise<Pengumuman[]> {
  return (await fetchPengumuman()).filter(item => isGangguan(item))
}
