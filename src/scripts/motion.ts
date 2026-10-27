/**
 * Gerak halus untuk formulir bertahap: pergantian langkah, kolom yang muncul/hilang, dan gulir.
 * Memakai Web Animations API; seluruhnya dilewati bila pengguna memilih mengurangi animasi.
 */

const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)' // sama dengan --ease-out-soft
const HEADER_OFFSET = 88 // tinggi header lengket + jarak napas

export function reducedMotion (): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof Element.prototype.animate !== 'function'
}

/**
 * Ganti panel `from` dengan `to` di dalam `container`: panel lama memudar, tinggi wadah menyesuaikan
 * tanpa melompat, panel baru masuk dengan geser pendek searah langkah (maju dari kanan, mundur dari kiri).
 */
export async function swapPanels (container: HTMLElement, from: HTMLElement | undefined, to: HTMLElement, direction: 1 | -1): Promise<void> {
  if (!from || from === to || reducedMotion()) {
    if (from && from !== to) {
      from.hidden = true
    }
    to.hidden = false
    return
  }

  await from.animate(
    [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-12 * direction}px)` }],
    { duration: 140, easing: 'ease-in' },
  ).finished.catch(() => {})

  const start = container.offsetHeight
  from.hidden = true
  to.hidden = false
  const end = container.offsetHeight

  if (start !== end) {
    container.style.overflow = 'clip'
    container.animate([{ height: `${start}px` }, { height: `${end}px` }], { duration: 320, easing: EASE })
      .finished.catch(() => {}).finally(() => {
        container.style.overflow = ''
      })
  }

  await to.animate(
    [{ opacity: 0, transform: `translateX(${20 * direction}px)` }, { opacity: 1, transform: 'none' }],
    { duration: 360, easing: EASE },
  ).finished.catch(() => {})
}

/** Tampilkan atau sembunyikan elemen dengan tinggi dan pudar yang beranimasi, bukan muncul mendadak. */
export function reveal (element: HTMLElement, show: boolean): void {
  if (element.hidden === !show) {
    return
  }
  if (reducedMotion()) {
    element.hidden = !show
    return
  }

  element.getAnimations().forEach(animation => animation.cancel())
  element.hidden = false
  const height = element.offsetHeight
  const frames: Keyframe[] = [
    { height: '0px', opacity: 0, overflow: 'clip' },
    { height: `${height}px`, opacity: 1, overflow: 'clip' },
  ]
  const animation = element.animate(show ? frames : frames.toReversed(), { duration: show ? 280 : 200, easing: EASE })
  if (!show) {
    animation.finished.then(() => {
      element.hidden = true
    }).catch(() => {})
  }
}

/** Gulir agar bagian atas elemen terlihat, hanya bila saat ini berada di luar layar. */
export function bringIntoView (element: HTMLElement): void {
  const top = element.getBoundingClientRect().top
  if (top >= HEADER_OFFSET - 8 && top < window.innerHeight * 0.4) {
    return
  }
  window.scrollTo({ top: window.scrollY + top - HEADER_OFFSET, behavior: reducedMotion() ? 'auto' : 'smooth' })
}

/** Munculkan panel hasil (mis. "permohonan terkirim") dengan naik-pudar. */
export function enter (element: HTMLElement): void {
  element.hidden = false
  if (!reducedMotion()) {
    element.animate(
      [{ opacity: 0, transform: 'translateY(12px) scale(0.99)' }, { opacity: 1, transform: 'none' }],
      { duration: 480, easing: EASE },
    )
  }
}
