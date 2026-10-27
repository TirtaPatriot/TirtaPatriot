/**
 * Gangguan layanan berubah lebih cepat daripada jadwal build, jadi halaman memuat ulang daftarnya
 * dari API Informasi Pelanggan di browser. HTML hasil build tetap tampil bila API tidak terjangkau.
 */
import { fetchGangguan, type Pengumuman } from '../lib/info-pelanggan'
import { el } from './dom'

async function load (): Promise<Pengumuman[] | null> {
  try {
    return await fetchGangguan()
  } catch {
    return null
  }
}

/** Paragraf teks polos dari HTML pengumuman, tanpa menjalankan atau menyisipkan markup. */
function paragraphs (html: string): string[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const blocks = [...doc.body.querySelectorAll('p, li')].map(node => (node.textContent ?? '').replace(/\s+/g, ' ').trim())
  const text = blocks.length ? blocks : [(doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()]
  return text.filter(Boolean)
}

/** Panel ringkas di beranda. */
export async function refreshStatusPanel (): Promise<void> {
  const panel = document.querySelector<HTMLElement>('[data-status-panel]')
  const live = panel ? await load() : null
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
  const list = el('ul', 'mt-2 grid gap-1.5 text-sm', ...live.slice(0, 2).map(item => el('li', '',
    el('span', 'font-semibold', item.title),
    el('span', 'block text-redup', `Diumumkan ${item.date}`),
  )))

  const link = panel.querySelector('a')
  panel.dataset.statusIds = live.map(item => item.id).join(',')
  panel.replaceChildren(heading, ...(live.length ? [list] : []), ...(link ? [link] : []))
}

/**
 * Halaman gangguan: entri yang sudah ada di HTML build dipertahankan (isinya sudah disaring),
 * entri baru ditambahkan sebagai teks polos, dan entri yang sudah tidak tayang disembunyikan.
 */
export async function refreshGangguanPage (): Promise<void> {
  const list = document.querySelector<HTMLElement>('[data-gangguan-list]')
  const empty = document.querySelector<HTMLElement>('[data-gangguan-empty]')
  const live = list ? await load() : null
  if (!list || !live) {
    return
  }

  const existing = new Map([...list.querySelectorAll<HTMLElement>('[data-gangguan-id]')].map(node => [node.dataset.gangguanId ?? '', node]))
  const liveIds = new Set(live.map(item => item.id))

  for (const [id, node] of existing) {
    node.hidden = !liveIds.has(id)
  }

  for (const item of live.toReversed()) {
    if (existing.has(item.id)) {
      continue
    }

    const card = el('article', 'overflow-hidden rounded-2xl border border-garis')
    card.dataset.gangguanId = item.id
    const cover = item.cover_image || item.image
    if (cover) {
      const image = el('img', 'aspect-[2/1] w-full object-cover')
      image.src = cover
      image.alt = ''
      image.loading = 'lazy'
      card.append(image)
    }
    card.append(el('div', 'p-5 sm:p-6',
      el('p', 'flex items-center gap-2 text-sm font-bold text-meter', el('span', 'live-dot'), 'Sedang berlangsung'),
      el('h2', 'mt-1 text-xl font-bold', item.title),
      el('p', 'mt-1 text-sm text-redup', `Diumumkan ${item.date}`),
      el('div', 'mt-4 grid max-w-[68ch] gap-3', ...paragraphs(item.description).map(text => el('p', '', text))),
    ))
    list.prepend(card)
  }

  if (empty) {
    empty.hidden = live.length > 0
  }
  list.hidden = live.length === 0
}
