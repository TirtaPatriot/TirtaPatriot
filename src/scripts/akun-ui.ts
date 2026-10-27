/** Bagian antarmuka bersama untuk halaman yang memerlukan akun: bilah akun dan pemilih nomor pelanggan. */
import { addCustomer, apiMessage, clearSession, customerList, type Pelanggan, type Session } from './akun'
import { el, setBusy, showError } from './dom'

export function renderAccountBar (session: Session): void {
  const bar = document.querySelector<HTMLElement>('[data-account]')
  if (!bar) {
    return
  }
  const logout = el('button', 'link text-sm font-semibold', 'Keluar')
  logout.type = 'button'
  logout.addEventListener('click', () => {
    clearSession()
    location.href = '/pelanggan/masuk'
  })
  bar.replaceChildren(
    el('p', 'text-sm text-redup', 'Masuk sebagai ', el('strong', 'text-pipa', session.user.name || `+${session.user.phone_number}`)),
    logout,
  )
  bar.hidden = false
}

const format = (nomor: string) => nomor.replace(/^(\d{2})(\d{2})(\d{2})(\d+)$/, '$1.$2.$3.$4')

/**
 * Daftar nomor pelanggan milik akun sebagai pilihan radio, ditambah formulir tambah nomor.
 * Mengembalikan fungsi pembaca nomor yang sedang dipilih.
 */
export async function mountCustomerPicker (root: HTMLElement, name: string): Promise<() => string> {
  const list = el('div', 'grid gap-2')
  list.setAttribute('role', 'radiogroup')
  list.setAttribute('aria-label', 'Nomor pelanggan')
  const empty = el('p', 'notice', 'Belum ada nomor pelanggan pada akun ini. Tambahkan nomor pelanggan Anda di bawah.')
  empty.hidden = true

  const input = el('input', 'input num')
  input.id = `${name}-tambah`
  input.inputMode = 'numeric'
  input.maxLength = 12
  input.autocomplete = 'off'
  const addButton = el('button', 'btn btn-quiet shrink-0', el('span', '', 'Tambahkan'))
  addButton.type = 'button'
  addButton.querySelector('span')!.dataset.label = ''
  addButton.dataset.idle = 'Tambahkan'
  const addError = el('div', 'notice notice-error', el('p', '', ''))
  addError.hidden = true
  addError.tabIndex = -1
  addError.dataset.addError = ''
  addError.querySelector('p')!.dataset.errorText = ''
  const label = el('label', 'font-semibold', 'Tambah nomor pelanggan')
  label.htmlFor = input.id
  const addForm = el('div', 'field mt-2', label, el('div', 'flex gap-2', input, addButton), addError)

  root.replaceChildren(empty, list, addForm)

  const render = (items: Pelanggan[], selected?: string) => {
    list.replaceChildren(...items.map((item, index) => {
      const radio = el('input', 'mt-1 size-4 shrink-0 accent-patriot')
      radio.type = 'radio'
      radio.name = name
      radio.value = item.customer_number
      radio.checked = selected ? item.customer_number === selected : index === 0
      return el('label', 'flex cursor-pointer items-start gap-3 rounded-lg border border-garis bg-white p-4 transition-colors has-[:checked]:border-patriot has-[:checked]:bg-air',
        radio,
        el('span', '', el('span', 'num block font-bold', format(item.customer_number)), item.name ? el('span', 'block text-sm text-redup', item.name) : null),
      )
    }))
    empty.hidden = items.length > 0
  }

  list.replaceChildren(el('p', 'text-redup', 'Memuat nomor pelanggan…'))
  render(await customerList())

  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '')
  })
  addButton.addEventListener('click', async () => {
    const nomor = input.value.trim()
    if (nomor.length < 10) {
      showError(addError, 'Nomor pelanggan terdiri dari 10 sampai 12 digit.')
      return
    }
    showError(addError, '')
    setBusy(addButton, true, 'Menambahkan…')
    try {
      await addCustomer(nomor)
      input.value = ''
      render(await customerList(), nomor)
    } catch (caught) {
      showError(addError, apiMessage(caught, 'Nomor pelanggan belum dapat ditambahkan. Silakan coba lagi.'))
    } finally {
      setBusy(addButton, false)
    }
  })

  return () => list.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? ''
}
