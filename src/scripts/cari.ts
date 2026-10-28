/**
 * Pencarian global: saran langsung di bawah kolom cari header, dan daftar lengkap di /cari.
 * Indeks (/cari.json) dimuat sekali saat kolom pertama kali dipakai. Tanpa JavaScript, formulir tetap membuka /cari.
 */
import { cari, type Entri } from '../lib/cari'
import { dateShort } from '../lib/format'
import { el } from './dom'

const LABEL: Record<Entri['jenis'], string> = { menu: 'Menu', berita: 'Berita', edukasi: 'Edukasi' }

let index: Promise<Entri[]> | null = null

function loadIndex (): Promise<Entri[]> {
  index ??= fetch('/cari.json').then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json() as Promise<Entri[]>
  }).catch(error => {
    index = null
    throw error
  })
  return index
}

function external (url: string): boolean {
  return /^https?:/.test(url)
}

/** Satu baris hasil: label jenis, judul, dan ringkasan atau tanggal. */
function resultLink (entry: Entri, compact: boolean): HTMLAnchorElement {
  const meta = entry.tanggal ? `${LABEL[entry.jenis]} · ${dateShort(entry.tanggal)}` : LABEL[entry.jenis]
  const link = el('a', compact ? 'block rounded-lg px-3 py-2.5 outline-none hover:bg-kabut focus-visible:bg-air' : 'group block py-4',
    el('span', 'block text-xs font-bold tracking-wide text-patriot uppercase', meta),
    el('span', compact ? 'mt-0.5 line-clamp-2 block font-semibold' : 'mt-1 block text-lg font-bold group-hover:text-patriot group-hover:underline', entry.judul),
    !compact && entry.ringkasan && el('span', 'mt-1 line-clamp-2 block text-redup', entry.ringkasan),
  )
  link.href = entry.url
  if (external(entry.url)) {
    link.rel = 'noopener'
    link.target = '_blank'
  }
  return link
}

/** Kolom cari di header: hingga 6 saran, panah atas/bawah untuk berpindah, Escape untuk menutup. */
function bindHeaderForm (form: HTMLFormElement): void {
  const input = form.querySelector<HTMLInputElement>('input[name="q"]')
  const panel = form.querySelector<HTMLElement>('[data-cari-saran]')
  if (!input || !panel) {
    return
  }

  const close = (): void => {
    panel.hidden = true
  }
  const links = (): HTMLElement[] => [...panel.querySelectorAll<HTMLElement>('a')]

  let token = 0
  const update = async (): Promise<void> => {
    const query = input.value.trim()
    const current = ++token
    if (!query) {
      close()
      return
    }
    let entries: Entri[]
    try {
      entries = await loadIndex()
    } catch {
      return
    }
    if (current !== token) {
      return
    }
    const found = cari(entries, query, 6)
    const all = el('a', 'mt-1 block rounded-lg border-t border-garis px-3 py-2.5 text-sm font-semibold text-patriot outline-none hover:bg-kabut focus-visible:bg-air', `Lihat semua hasil untuk “${query}”`)
    all.href = `/cari?q=${encodeURIComponent(query)}`
    panel.replaceChildren(
      ...(found.length ? found.map(entry => el('li', '', resultLink(entry, true))) : [el('li', 'px-3 py-2.5 text-redup', 'Tidak ada yang cocok.')]),
      el('li', '', all),
    )
    panel.hidden = false
  }

  input.addEventListener('focus', () => void loadIndex().catch(() => {}), { once: true })
  input.addEventListener('input', () => void update())
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' && !panel.hidden) {
      event.preventDefault()
      links()[0]?.focus()
    } else if (event.key === 'Escape') {
      close()
    }
  })
  panel.addEventListener('keydown', event => {
    const items = links()
    const position = items.indexOf(document.activeElement as HTMLElement)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      items[Math.min(position + 1, items.length - 1)]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (position <= 0) {
        input.focus()
      } else {
        items[position - 1]?.focus()
      }
    } else if (event.key === 'Escape') {
      close()
      input.focus()
    }
  })
  form.addEventListener('focusout', event => {
    if (!form.contains(event.relatedTarget as Node | null)) {
      close()
    }
  })
}

/** Halaman /cari: hasil lengkap untuk ?q=, diperbarui saat mengetik tanpa memuat ulang halaman. */
async function bindResultsPage (root: HTMLElement): Promise<void> {
  const input = root.querySelector<HTMLInputElement>('input[name="q"]')
  const list = root.querySelector<HTMLElement>('[data-cari-hasil]')
  const status = root.querySelector<HTMLElement>('[data-cari-status]')
  if (!input || !list || !status) {
    return
  }

  input.value = new URLSearchParams(location.search).get('q') ?? ''
  let entries: Entri[]
  try {
    entries = await loadIndex()
  } catch {
    status.textContent = 'Pencarian sedang tidak dapat dimuat. Silakan coba lagi nanti.'
    return
  }

  const render = (): void => {
    const query = input.value.trim()
    const found = cari(entries, query)
    const url = new URL(location.href)
    if (query) {
      url.searchParams.set('q', query)
    } else {
      url.searchParams.delete('q')
    }
    history.replaceState(null, '', url)
    status.textContent = !query ? 'Ketik kata kunci, misalnya “tagihan”, “pasang baru”, atau judul berita.' : found.length ? `${found.length} hasil untuk “${query}”` : `Tidak ada hasil untuk “${query}”. Coba kata lain yang lebih umum.`
    list.replaceChildren(...found.map(entry => el('li', 'border-b border-garis', resultLink(entry, false))))
  }

  root.querySelector('form')?.addEventListener('submit', event => {
    event.preventDefault()
    render()
  })
  input.addEventListener('input', render)
  render()
}

for (const form of document.querySelectorAll<HTMLFormElement>('[data-cari-form]')) {
  bindHeaderForm(form)
}

const page = document.querySelector<HTMLElement>('[data-cari-page]')
if (page) {
  void bindResultsPage(page)
}
