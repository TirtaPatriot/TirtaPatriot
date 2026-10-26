/**
 * Menghubungkan input nomor pelanggan dengan tampilan register meter (`.meter-field`).
 * Hanya angka yang diterima; tiga sel terakhir tampil merah seperti roda desimal meter.
 */
const MIN_CELLS = 12
const MAX_DIGITS = 14

export function digitsOnly (value: string): string {
  return value.replace(/\D+/g, '').slice(0, MAX_DIGITS)
}

export function renderRegister (field: HTMLElement, value: string): void {
  const count = Math.max(MIN_CELLS, value.length)
  field.style.setProperty('--cells', String(count))

  const cells = [...field.querySelectorAll<HTMLElement>('.cell')]
  while (cells.length < count) {
    const cell = document.createElement('span')
    cell.className = 'cell'
    cell.setAttribute('aria-hidden', 'true')
    field.insertBefore(cell, field.querySelector('input'))
    cells.push(cell)
  }

  cells.forEach((cell, index) => {
    cell.hidden = index >= count
    cell.textContent = value[index] ?? ''
    cell.classList.toggle('dec', index >= count - 3)
    cell.classList.toggle('next', index === Math.min(value.length, count - 1))
  })
}

export function bindMeterFields (root: ParentNode = document): void {
  for (const field of root.querySelectorAll<HTMLElement>('.meter-field')) {
    const input = field.querySelector('input')
    if (!input || field.dataset.bound) {
      continue
    }

    field.dataset.bound = 'true'
    const sync = () => {
      const clean = digitsOnly(input.value)
      if (clean !== input.value) {
        input.value = clean
      }
      renderRegister(field, clean)
    }

    input.addEventListener('input', sync)
    sync()
  }
}
