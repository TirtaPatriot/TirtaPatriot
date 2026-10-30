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
    const digit = value[index] ?? ''
    if (cell.textContent !== digit) {
      // angka baru "berputar" masuk seperti roda register
      const roll = document.createElement('span')
      roll.className = 'roll'
      roll.textContent = digit
      cell.replaceChildren(...(digit ? [roll] : []))
    }
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
    // tombol Reset berada di baris hint (.meter-foot), sejajar dengan input di dalam .field
    const reset = field.parentElement?.querySelector<HTMLButtonElement>('[data-reset]')
    const sync = () => {
      const clean = digitsOnly(input.value)
      if (clean !== input.value) {
        input.value = clean
      }
      renderRegister(field, clean)
      if (reset) {
        reset.hidden = !clean
      }
    }

    reset?.addEventListener('click', () => {
      input.value = ''
      sync()
      input.focus()
    })

    input.addEventListener('input', sync)

    // tempel (paste) mengganti seluruh isi dengan angka yang ditempel, bukan menyisipkan di tengah
    input.addEventListener('paste', event => {
      event.preventDefault()
      input.value = digitsOnly(event.clipboardData?.getData('text') ?? '')
      sync()
      input.setSelectionRange(input.value.length, input.value.length)
    })

    // Esc mengosongkan isian tanpa menghilangkan fokus
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape' && input.value) {
        event.preventDefault()
        input.value = ''
        sync()
      }
    })

    sync()
  }
}
