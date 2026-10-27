/**
 * Informasi gangguan berubah lebih cepat daripada jadwal build, jadi halaman memuat ulang
 * daftarnya langsung dari CMS di browser. HTML hasil build tetap tampil bila CMS tidak terjangkau.
 */
import { assetUrl, directusItems, GANGGUAN_QUERY } from '../lib/directus'
import { dateTimeShort } from '../lib/format'

export type Gangguan = {
  id: string
  title: string
  subtitle: string | null
  image: string | null
  content: string | null
  waktu_mulai: string | null
  estimasi_selesai: string | null
}

export async function fetchGangguan (): Promise<Gangguan[] | null> {
  try {
    return await directusItems<Gangguan[]>('gangguan_layanan', GANGGUAN_QUERY)
  } catch {
    return null
  }
}

/** Teks polos dari HTML CMS tanpa menjalankan atau menyisipkan markup apa pun. */
function textOf (html: string | null): string {
  if (!html) {
    return ''
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function el<K extends keyof HTMLElementTagNameMap> (tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  node.className = className
  if (text !== undefined) {
    node.textContent = text
  }
  return node
}

/** Panel ringkas di beranda. */
export async function refreshStatusPanel (): Promise<void> {
  const panel = document.querySelector<HTMLElement>('[data-status-panel]')
  const live = panel ? await fetchGangguan() : null
  if (!panel || !live) {
    return
  }

  // tidak ada perubahan sejak build: biarkan HTML apa adanya
  if (live.map(item => item.id).join(',') === panel.dataset.statusIds) {
    return
  }

  const heading = el('p', `flex items-center gap-2.5 font-bold ${live.length ? 'text-meter' : 'text-lunas'}`)
  const dot = el('span', 'live-dot')
  dot.setAttribute('aria-hidden', 'true')
  heading.append(dot, el('span', '', live.length ? `${live.length} gangguan sedang ditangani` : 'Tidak ada gangguan tercatat'))
  const list = el('ul', 'mt-2 grid gap-1.5 text-sm')
  for (const item of live.slice(0, 2)) {
    const row = el('li', '')
    row.append(el('span', 'font-semibold', item.title))
    if (item.waktu_mulai) {
      row.append(el('span', 'block text-redup', `Sejak ${dateTimeShort(item.waktu_mulai)}`))
    }
    list.append(row)
  }

  const link = panel.querySelector('a')
  panel.replaceChildren(heading, ...(live.length ? [list] : []), ...(link ? [link] : []))
}

/**
 * Halaman gangguan: entri yang sudah ada di HTML build dipertahankan (isinya sudah disaring),
 * entri baru ditambahkan sebagai teks polos, dan entri yang sudah selesai disembunyikan.
 */
export async function refreshGangguanPage (): Promise<void> {
  const list = document.querySelector<HTMLElement>('[data-gangguan-list]')
  const empty = document.querySelector<HTMLElement>('[data-gangguan-empty]')
  const live = list ? await fetchGangguan() : null
  if (!list || !live) {
    return
  }

  const existing = new Map([...list.querySelectorAll<HTMLElement>('[data-gangguan-id]')].map(node => [node.dataset.gangguanId ?? '', node]))
  const liveIds = new Set(live.map(item => item.id))

  for (const [id, node] of existing) {
    node.hidden = !liveIds.has(id)
  }

  for (const item of live) {
    if (existing.has(item.id)) {
      continue
    }

    const card = el('article', 'overflow-hidden rounded-lg border border-garis')
    card.dataset.gangguanId = item.id
    if (item.image) {
      const image = el('img', 'aspect-[2/1] w-full object-cover')
      image.src = assetUrl(item.image, { width: 960, height: 480, fit: 'cover' })
      image.alt = ''
      card.append(image)
    }

    const body = el('div', 'p-5 sm:p-6')
    body.append(el('p', 'text-sm font-bold text-meter', 'Sedang ditangani'))
    body.append(el('h2', 'mt-1 text-xl font-bold', item.title))
    if (item.subtitle) {
      body.append(el('p', 'mt-1 text-redup', item.subtitle))
    }
    const text = textOf(item.content)
    if (text) {
      body.append(el('p', 'mt-3 max-w-[68ch]', text))
    }
    const times = el('dl', 'mt-4 grid gap-1 text-sm sm:grid-cols-2')
    times.append(el('dt', 'font-semibold', 'Mulai'), el('dd', 'text-redup', dateTimeShort(item.waktu_mulai) || 'Belum tercatat'))
    times.append(el('dt', 'font-semibold', 'Perkiraan selesai'), el('dd', 'text-redup', item.estimasi_selesai ? dateTimeShort(item.estimasi_selesai) : 'Belum ditentukan'))
    body.append(times)
    card.append(body)
    list.prepend(card)
  }

  if (empty) {
    empty.hidden = live.length > 0
  }
  list.hidden = live.length === 0
}
