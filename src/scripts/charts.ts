/**
 * Tooltip grafik kolom (hover & fokus keyboard) dan animasi tumbuh sekali saat terlihat.
 * Isi tooltip dibangun dengan textContent; nilai yang sama selalu tersedia di tabel data.
 */
import { el } from './dom'

type Row = { name: string, color: string, value: string }
type Group = { label: string, rows: Row[] }

/** Pasang tooltip pada satu grafik (markup ColumnChart.astro atau buatan riwayat.ts). */
export function bindChart (figure: HTMLElement): void {
  const data = JSON.parse(figure.dataset.chart ?? '[]') as Group[]
  const tip = figure.querySelector<HTMLElement>('.chart-tip')
  const groups = [...figure.querySelectorAll<SVGGElement>('.chart-group')]
  if (!tip) {
    return
  }

  const show = (group: SVGGElement) => {
    const index = Number(group.dataset.i)
    const item = data[index]
    if (!item) {
      return
    }
    for (const other of groups) {
      other.classList.toggle('is-dim', other !== group)
    }
    tip.replaceChildren(
      el('p', 'mb-1 text-redup', item.label),
      ...item.rows.map(row => el('p', 'flex items-center gap-2',
        el('span', 'inline-block h-0.5 w-3 rounded-full', ''),
        el('strong', 'num', row.value),
        item.rows.length > 1 ? el('span', 'text-redup', row.name) : null,
      )),
    )
    item.rows.forEach((row, i) => {
      const key = tip.children[i + 1]?.firstElementChild as HTMLElement | undefined
      if (key) {
        key.style.background = row.color
      }
    })

    const box = figure.getBoundingClientRect()
    const mark = group.getBoundingClientRect()
    tip.classList.remove('hidden')
    const left = Math.min(Math.max(mark.left - box.left + mark.width / 2 - tip.offsetWidth / 2, 0), box.width - tip.offsetWidth)
    tip.style.left = `${left}px`
    tip.style.top = `${mark.top - box.top - tip.offsetHeight + 24}px`
  }

  const hide = () => {
    tip.classList.add('hidden')
    for (const group of groups) {
      group.classList.remove('is-dim')
    }
  }

  for (const group of groups) {
    group.addEventListener('pointerenter', () => show(group))
    group.addEventListener('focusin', () => show(group))
    group.addEventListener('focusout', hide)
  }
  figure.querySelector('svg')?.addEventListener('pointerleave', hide)
}

for (const figure of document.querySelectorAll<HTMLElement>('[data-chart]')) {
  bindChart(figure)
}

// batang dan kolom tumbuh dari garis dasar saat pertama kali terlihat
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!reduce && 'IntersectionObserver' in window) {
  const targets = document.querySelectorAll<HTMLElement>('[data-chart], [data-bars]')
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-on')
        observer.unobserve(entry.target)
      }
    }
  }, { threshold: 0.35 })
  for (const target of targets) {
    target.classList.add('is-armed')
    requestAnimationFrame(() => observer.observe(target))
  }
}
