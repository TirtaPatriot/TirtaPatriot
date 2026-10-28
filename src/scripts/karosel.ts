/**
 * Karosel beranda (src/components/Karosel.astro): geser dengan sentuh/gulir (scroll-snap), tombol, titik penanda,
 * dan putar otomatis yang berhenti saat disentuh, difokus, atau bila pengguna memilih mengurangi animasi.
 * Isinya dimuat ulang dari API Informasi Pelanggan agar sama dengan aplikasi Tirta Patriot Mobile.
 */
import { fetchPengumuman, isGangguan, type Pengumuman } from '../lib/info-pelanggan'
import { el } from './dom'
import { paragraphs } from './gangguan'
import { reducedMotion } from './motion'

const INTERVAL = 6000

function slideFor (item: Pengumuman, index: number, total: number): HTMLLIElement {
  const image = item.cover_image || item.image || ''
  const gangguan = isGangguan(item)

  const cover = el('span', 'block aspect-video overflow-hidden rounded-xl bg-air')
  if (image) {
    const img = el('img', 'h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]')
    img.src = image
    img.alt = ''
    img.width = 1280
    img.height = 720
    img.loading = index < 2 ? 'eager' : 'lazy'
    cover.append(img)
  }

  const dot = el('span', 'inline-block size-2 rounded-full bg-current')
  dot.setAttribute('aria-hidden', 'true')
  const open = el('button', 'group block w-full cursor-pointer text-left',
    cover,
    gangguan && el('span', 'mt-4 inline-flex items-center gap-2 text-sm font-bold text-meter', dot, 'Gangguan layanan'),
    el('span', `block text-lg font-bold group-hover:text-patriot ${gangguan ? 'mt-1' : 'mt-4'}`, item.title),
    el('span', 'mt-1 block text-sm text-redup', item.date),
  )
  open.type = 'button'
  open.dataset.karoselOpen = ''
  open.dataset.title = item.title
  open.dataset.tanggal = item.date
  open.dataset.image = image
  open.toggleAttribute('data-gangguan', gangguan)

  // isi API ditampilkan sebagai teks polos, tidak pernah sebagai HTML
  const detail = el('template')
  detail.dataset.karoselDetail = ''
  detail.content.append(el('div', 'grid gap-3', ...paragraphs(item.description).map(text => el('p', '', text))))

  const slide = el('li', 'w-full shrink-0 snap-start md:w-[calc((100%-1.25rem)/2)]', open, detail)
  slide.setAttribute('aria-roledescription', 'slide')
  slide.setAttribute('aria-label', `${index + 1} dari ${total}`)
  slide.dataset.karoselSlide = item.id
  return slide
}

async function refresh (root: HTMLElement, track: HTMLElement): Promise<boolean> {
  let items: Pengumuman[]
  try {
    items = await fetchPengumuman()
  } catch {
    return false
  }
  const ids = items.map(item => item.id).join(',')
  if (ids === root.dataset.karoselIds) {
    return false
  }
  root.dataset.karoselIds = ids
  track.replaceChildren(...items.map((item, index) => slideFor(item, index, items.length)))
  track.scrollLeft = 0
  root.hidden = items.length === 0
  return true
}

function openDetail (root: HTMLElement, trigger: HTMLElement): void {
  const dialog = root.querySelector<HTMLDialogElement>('[data-karosel-dialog]')
  const template = trigger.closest('li')?.querySelector<HTMLTemplateElement>('[data-karosel-detail]')
  if (!dialog || !template) {
    return
  }
  const { title = '', tanggal = '', image = '' } = trigger.dataset
  const gangguan = trigger.hasAttribute('data-gangguan')

  const img = dialog.querySelector<HTMLImageElement>('[data-karosel-dialog-image]')
  if (img) {
    img.hidden = !image
    img.src = image
  }
  dialog.querySelector<HTMLElement>('[data-karosel-dialog-title]')!.textContent = title
  dialog.querySelector<HTMLElement>('[data-karosel-dialog-tanggal]')!.textContent = tanggal
  dialog.querySelector<HTMLElement>('[data-karosel-dialog-body]')!.replaceChildren(template.content.cloneNode(true))
  for (const node of dialog.querySelectorAll<HTMLElement>('[data-karosel-dialog-gangguan], [data-karosel-dialog-link]')) {
    node.hidden = !gangguan
  }
  dialog.showModal()
  dialog.scrollTop = 0
}

export function initKarosel (): void {
  const root = document.querySelector<HTMLElement>('[data-karosel]')
  const track = root?.querySelector<HTMLElement>('[data-karosel-track]')
  if (!root || !track) {
    return
  }
  const controls = root.querySelector<HTMLElement>('[data-karosel-controls]')
  const dots = root.querySelector<HTMLElement>('[data-karosel-dots]')
  const play = root.querySelector<HTMLButtonElement>('[data-karosel-play]')
  const dialog = root.querySelector<HTMLDialogElement>('[data-karosel-dialog]')

  const slides = (): HTMLElement[] => [...track.querySelectorAll<HTMLElement>('[data-karosel-slide]')]
  // jumlah posisi berhenti: slide terakhir yang masih bisa menjadi slide pertama yang terlihat
  const stops = (): number => {
    const all = slides()
    const width = all[0]?.offsetWidth ?? 0
    const perView = width ? Math.max(1, Math.round(track.clientWidth / width)) : 1
    return Math.max(1, all.length - perView + 1)
  }
  const current = (): number => {
    const all = slides()
    const left = track.scrollLeft
    let best = 0
    all.forEach((slide, index) => {
      if (Math.abs(slide.offsetLeft - left) < Math.abs((all[best]?.offsetLeft ?? 0) - left)) {
        best = index
      }
    })
    return Math.min(best, stops() - 1)
  }
  const go = (index: number): void => {
    const count = stops()
    const target = slides()[((index % count) + count) % count]
    if (target) {
      track.scrollTo({ left: target.offsetLeft, behavior: reducedMotion() ? 'auto' : 'smooth' })
    }
  }

  const renderDots = (): void => {
    const count = stops()
    if (controls) {
      controls.hidden = count < 2
    }
    if (!dots) {
      return
    }
    const active = current()
    dots.replaceChildren(...(count < 2 ? [] : Array.from({ length: count }, (_, index) => {
      const dot = el('button', `h-2.5 cursor-pointer rounded-full transition-all duration-300 ${index === active ? 'w-7 bg-patriot' : 'w-2.5 bg-garis hover:bg-patriot/50'}`)
      dot.type = 'button'
      dot.setAttribute('aria-label', `Tampilkan slide ${index + 1}`)
      dot.toggleAttribute('aria-current', index === active)
      dot.addEventListener('click', () => go(index))
      return dot
    })))
  }

  let frame = 0
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(renderDots)
  }, { passive: true })
  new ResizeObserver(renderDots).observe(track)

  root.querySelector('[data-karosel-prev]')?.addEventListener('click', () => go(current() - 1))
  root.querySelector('[data-karosel-next]')?.addEventListener('click', () => go(current() + 1))
  track.addEventListener('click', event => {
    const trigger = (event.target as Element | null)?.closest<HTMLElement>('[data-karosel-open]')
    if (trigger) {
      openDetail(root, trigger)
    }
  })
  // klik di luar isi dialog menutupnya
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) {
      dialog.close()
    }
  })

  // putar otomatis: berhenti selama disentuh/difokus/dialog terbuka; tombol jeda menghentikannya sepenuhnya
  let paused = reducedMotion()
  let hovering = false
  let focused = false
  const setPaused = (value: boolean): void => {
    paused = value
    play?.toggleAttribute('data-paused', value)
    play?.setAttribute('aria-label', value ? 'Putar otomatis' : 'Hentikan putar otomatis')
  }
  setPaused(paused)
  play?.addEventListener('click', () => setPaused(!paused))
  root.addEventListener('pointerenter', () => { hovering = true })
  root.addEventListener('pointerleave', () => { hovering = false })
  root.addEventListener('focusin', () => { focused = true })
  root.addEventListener('focusout', event => { focused = root.contains(event.relatedTarget as Node | null) })
  track.addEventListener('touchstart', () => setPaused(true), { passive: true })
  window.setInterval(() => {
    if (!paused && !hovering && !focused && !document.hidden && !dialog?.open && stops() > 1) {
      go(current() + 1)
    }
  }, INTERVAL)

  renderDots()
  void refresh(root, track).then(changed => {
    if (changed) {
      renderDots()
    }
  })
}
