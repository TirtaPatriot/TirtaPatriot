/**
 * Pencarian global: modal cari (src/components/CariDialog.astro) dan daftar lengkap di /cari.
 * Indeks (/cari.json) dimuat sekali saat pencarian pertama kali dibuka. Tanpa JavaScript, formulir tetap membuka /cari.
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
  const link = el('a', compact ? 'block rounded-lg px-3 py-2.5 hover:bg-kabut aria-selected:bg-air aria-selected:shadow-[inset_3px_0_0_var(--color-patriot)]' : 'group block py-4',
    el('span', 'block text-xs font-bold tracking-wide text-patriot uppercase', meta),
    el('span', compact ? 'mt-0.5 line-clamp-1 font-semibold' : 'mt-1 block text-lg font-bold group-hover:text-patriot group-hover:underline', entry.judul),
    entry.ringkasan && el('span', compact ? 'mt-0.5 line-clamp-1 text-sm text-redup' : 'mt-1 line-clamp-2 text-redup', entry.ringkasan),
  )
  link.href = entry.url
  if (external(entry.url)) {
    link.rel = 'noopener'
    link.target = '_blank'
  }
  return link
}

/**
 * Modal cari: kombobox dengan daftar hasil (maks. 8 + "lihat semua"), panah atas/bawah memilih, Enter membuka.
 * Dibuka tombol [data-cari-buka], Ctrl/⌘+K, atau "/" di luar kolom isian.
 */
function bindDialog (dialog: HTMLDialogElement): void {
  const form = dialog.querySelector('form')
  const input = dialog.querySelector<HTMLInputElement>('input[name="q"]')
  const list = dialog.querySelector<HTMLElement>('[data-cari-hasil-dialog]')
  const examples = dialog.querySelector<HTMLElement>('[data-cari-contoh]')
  const status = dialog.querySelector<HTMLElement>('[data-cari-dialog-status]')
  if (!form || !input || !list || !examples || !status) {
    return
  }

  if (/Mac|iPhone|iPad/.test(navigator.platform)) {
    for (const node of document.querySelectorAll('[data-cari-pintasan]')) {
      node.textContent = '⌘'
    }
    for (const node of document.querySelectorAll('[data-cari-buka] kbd')) {
      node.textContent = '⌘K'
    }
  }

  let active = -1
  const options = (): HTMLAnchorElement[] => [...list.querySelectorAll<HTMLAnchorElement>('[role="option"]')]
  const select = (next: number): void => {
    const all = options()
    active = all.length ? (next + all.length) % all.length : -1
    all.forEach((option, position) => option.setAttribute('aria-selected', String(position === active)))
    const current = all[active]
    if (current) {
      input.setAttribute('aria-activedescendant', current.id)
      current.scrollIntoView({ block: 'nearest' })
    } else {
      input.removeAttribute('aria-activedescendant')
    }
  }

  let token = 0
  const update = async (): Promise<void> => {
    const query = input.value.trim()
    const current = ++token
    examples.hidden = Boolean(query)
    if (!query) {
      list.hidden = true
      list.replaceChildren()
      status.textContent = ''
      input.setAttribute('aria-expanded', 'false')
      select(-1)
      return
    }
    let entries: Entri[]
    try {
      entries = await loadIndex()
    } catch {
      status.textContent = 'Pencarian sedang tidak dapat dimuat. Tekan Enter untuk mencoba di halaman pencarian.'
      return
    }
    if (current !== token) {
      return
    }

    const found = cari(entries, query, 8)
    const all = el('a', 'mt-1 flex items-center gap-2 rounded-lg border-t border-garis px-3 py-2.5 text-sm font-semibold text-patriot hover:bg-kabut aria-selected:bg-air', `Lihat semua hasil untuk “${query}”`)
    all.href = `/cari?q=${encodeURIComponent(query)}`
    const rows = [...found.map(entry => resultLink(entry, true)), all]
    rows.forEach((row, position) => {
      row.id = `cari-opsi-${position}`
      row.setAttribute('role', 'option')
      row.tabIndex = -1
    })
    list.replaceChildren(...rows.map(row => {
      const item = el('li', '', row)
      item.setAttribute('role', 'presentation')
      return item
    }))
    list.hidden = false
    input.setAttribute('aria-expanded', 'true')
    status.textContent = found.length ? '' : `Tidak ada yang cocok dengan “${query}”. Coba kata lain yang lebih umum.`
    select(found.length ? 0 : -1)
  }

  const open = (): void => {
    if (dialog.open) {
      return
    }
    dialog.showModal()
    input.focus()
    input.select()
    void loadIndex().catch(() => {})
  }

  input.addEventListener('input', () => void update())
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      select(active + (event.key === 'ArrowDown' ? 1 : -1))
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault()
      options()[active]?.click()
    }
  })
  // pilihan mengikuti kursor, tanpa mencuri fokus dari kolom isian
  list.addEventListener('pointermove', event => {
    const option = (event.target as Element).closest<HTMLAnchorElement>('[role="option"]')
    const position = option ? options().indexOf(option) : -1
    if (position >= 0 && position !== active) {
      select(position)
    }
  })
  list.addEventListener('click', event => {
    if ((event.target as Element).closest('[role="option"]')) {
      dialog.close()
    }
  })
  for (const chip of dialog.querySelectorAll<HTMLButtonElement>('[data-cari-isi]')) {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.cariIsi ?? ''
      input.focus()
      void update()
    })
  }
  // klik di luar kotak menutup modal
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      dialog.close()
    }
  })

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-cari-buka]')) {
    button.addEventListener('click', open)
  }
  document.addEventListener('keydown', event => {
    const target = event.target as HTMLElement | null
    const typing = target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? '')
    if ((event.key === 'k' || event.key === 'K') && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      open()
    } else if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      open()
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

const dialog = document.querySelector<HTMLDialogElement>('[data-cari-dialog]')
if (dialog) {
  bindDialog(dialog)
}

const page = document.querySelector<HTMLElement>('[data-cari-page]')
if (page) {
  void bindResultsPage(page)
}
