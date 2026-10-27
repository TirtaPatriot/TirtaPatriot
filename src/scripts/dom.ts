import { reducedMotion, reveal } from './motion'

/** Pembuat elemen kecil untuk hasil API: teks selalu lewat textContent, tidak pernah innerHTML. */
export function el<K extends keyof HTMLElementTagNameMap> (
  tag: K,
  className = '',
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) {
    node.className = className
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) {
      continue
    }
    node.append(child)
  }
  return node
}

/** Tampilkan atau sembunyikan kotak pesan galat di dalam formulir. */
export function showError (box: HTMLElement | null, message: string): void {
  if (!box) {
    return
  }
  const text = box.querySelector('[data-error-text]')
  if (text && message) {
    text.textContent = message
  }
  reveal(box, Boolean(message))
  if (message) {
    // fokus untuk pembaca layar tanpa lompatan gulir; geser seperlunya bila kotak di luar layar
    box.focus({ preventScroll: true })
    box.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' })
  }
}

export function setBusy (button: HTMLButtonElement | null, busy: boolean, busyLabel = 'Memproses…'): void {
  if (!button) {
    return
  }
  const label = button.querySelector('[data-label]')
  button.disabled = busy
  button.setAttribute('aria-busy', String(busy))
  if (label) {
    label.textContent = busy ? busyLabel : (button.dataset.idle ?? label.textContent)
  }
}
