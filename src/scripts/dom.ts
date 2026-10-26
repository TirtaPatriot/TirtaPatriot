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
  box.hidden = !message
  const text = box.querySelector('[data-error-text]')
  if (text) {
    text.textContent = message
  }
  if (message) {
    box.focus()
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
