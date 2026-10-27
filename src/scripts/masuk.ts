/**
 * Halaman masuk: masuk (nomor HP + PIN), daftar akun, dan atur ulang PIN dengan OTP WhatsApp.
 *  - POST /auth                         { phone_number, pin }                       → { token, user }
 *  - POST /auth/register                { name, phone_number, pin, email?, customer_number?, last_amount_payment? } → OTP
 *  - POST /auth/verify-otp              { phone_number, otp_code }                  → { token, user }
 *  - POST /auth/forgot-pin              { phone_number, new_pin, confirm_new_pin }  → OTP
 *  - POST /auth/verify-otp-forgot-pin   { phone_number, otp_code }                  → { token, user }
 *  - POST /auth/resend-otp              { phone_number, type }
 */
import { apiMessage, getSession, ip, isPhone, normalizePhone, safeNext, setSession, type Session } from './akun'
import { setBusy, showError } from './dom'
import { reveal, swapPanels } from './motion'

type View = 'masuk' | 'daftar' | 'lupa' | 'otp'
const RESEND_SECONDS = 60

const value = (form: HTMLFormElement, name: string) => (form.elements.namedItem(name) as HTMLInputElement).value.trim()
const pinOk = (pin: string) => /^\d{6}$/.test(pin)

async function submit (form: HTMLFormElement, run: () => Promise<void>): Promise<void> {
  const error = form.querySelector<HTMLElement>('[data-error]')
  const button = form.querySelector<HTMLButtonElement>('button[type=submit]')
  showError(error, '')
  setBusy(button, true)
  try {
    await run()
  } catch (caught) {
    showError(error, caught instanceof Error && !('status' in caught) ? caught.message : apiMessage(caught, 'Permintaan belum berhasil. Silakan coba lagi.'))
  } finally {
    setBusy(button, false)
  }
}

export function initMasuk (): void {
  const container = document.querySelector<HTMLElement>('[data-views]')
  if (!container) {
    return
  }
  const params = new URLSearchParams(location.search)
  const next = safeNext(params.get('lanjut'))
  if (getSession()) {
    location.replace(next)
    return
  }
  if (params.get('habis')) {
    document.querySelector<HTMLElement>('[data-expired]')!.hidden = false
  }

  const views = Object.fromEntries([...container.querySelectorAll<HTMLFormElement>('[data-view]')].map(form => [form.dataset.view, form])) as Record<View, HTMLFormElement>
  const state = { view: 'masuk' as View, otpFor: 'daftar' as 'daftar' | 'lupa', phone: '', timer: 0 }


  async function go (view: View): Promise<void> {
    const from = views[state.view]
    state.view = view
    await swapPanels(container!, from, views[view], view === 'masuk' ? -1 : 1)
    views[view].querySelector<HTMLInputElement>('input:not([type=hidden])')?.focus({ preventScroll: true })
  }

  for (const button of container.querySelectorAll<HTMLButtonElement>('[data-go]')) {
    button.addEventListener('click', () => void go(button.dataset.go as View))
  }

  // jumlah pembayaran terakhir hanya diminta bila nomor pelanggan diisi
  const customer = views.daftar.elements.namedItem('customer') as HTMLInputElement
  customer.addEventListener('input', () => reveal(views.daftar.querySelector<HTMLElement>('[data-last-payment]')!, customer.value.trim() !== ''))

  const done = (session: Session) => {
    setSession(session)
    location.replace(next)
  }

  // kirim ulang kode setelah jeda
  const resend = views.otp.querySelector<HTMLButtonElement>('[data-resend]')!
  function startCooldown (): void {
    let left = RESEND_SECONDS
    resend.disabled = true
    window.clearInterval(state.timer)
    const tick = () => {
      resend.textContent = left > 0 ? `Kirim ulang kode (${left})` : 'Kirim ulang kode'
      resend.disabled = left > 0
      left -= 1
      if (left < -1) {
        window.clearInterval(state.timer)
      }
    }
    tick()
    state.timer = window.setInterval(tick, 1000)
  }
  resend.addEventListener('click', () => void submit(views.otp, async () => {
    await ip('/auth/resend-otp', { method: 'POST', body: { phone_number: state.phone, type: state.otpFor === 'lupa' ? 'forgot_pin' : 'register' } })
    startCooldown()
  }))

  async function toOtp (phone: string, purpose: 'daftar' | 'lupa'): Promise<void> {
    state.phone = phone
    state.otpFor = purpose
    views.otp.querySelector('[data-otp-phone]')!.textContent = `+${phone}`
    ;(views.otp.elements.namedItem('otp') as HTMLInputElement).value = ''
    startCooldown()
    await go('otp')
  }

  views.masuk.addEventListener('submit', event => {
    event.preventDefault()
    void submit(views.masuk, async () => {
      const phone = value(views.masuk, 'phone')
      const pin = value(views.masuk, 'pin')
      if (!isPhone(phone)) {
        throw new Error('Tulis nomor HP yang terdaftar, contoh 0812xxxxxxxx.')
      }
      if (!pinOk(pin)) {
        throw new Error('PIN terdiri dari 6 digit angka.')
      }
      done(await ip<Session>('/auth', { method: 'POST', body: { phone_number: normalizePhone(phone), pin } }))
    })
  })

  views.daftar.addEventListener('submit', event => {
    event.preventDefault()
    void submit(views.daftar, async () => {
      const form = views.daftar
      const phone = value(form, 'phone')
      const pin = value(form, 'pin')
      const nopel = value(form, 'customer').replace(/\D/g, '')
      const lastPayment = value(form, 'lastPayment').replace(/\D/g, '')
      if (!value(form, 'name')) {
        throw new Error('Tulis nama lengkap Anda.')
      }
      if (!isPhone(phone)) {
        throw new Error('Tulis nomor HP seluler yang aktif di WhatsApp, contoh 0812xxxxxxxx.')
      }
      if (value(form, 'email') && !(form.elements.namedItem('email') as HTMLInputElement).checkValidity()) {
        throw new Error('Alamat email belum sesuai.')
      }
      if (!pinOk(pin)) {
        throw new Error('PIN harus 6 digit angka.')
      }
      if (pin !== value(form, 'pin2')) {
        throw new Error('Kedua PIN belum sama.')
      }
      if (nopel && (nopel.length < 10 || !lastPayment)) {
        throw new Error(nopel.length < 10 ? 'Nomor pelanggan terdiri dari 10 sampai 12 digit.' : 'Isi jumlah pembayaran rekening terakhir untuk nomor pelanggan tersebut.')
      }
      await ip('/auth/register', {
        method: 'POST',
        body: {
          name: value(form, 'name'),
          phone_number: normalizePhone(phone),
          pin,
          email: value(form, 'email') || null,
          customer_number: nopel || null,
          last_amount_payment: nopel ? Number(lastPayment) : null,
        },
      })
      await toOtp(normalizePhone(phone), 'daftar')
    })
  })

  views.lupa.addEventListener('submit', event => {
    event.preventDefault()
    void submit(views.lupa, async () => {
      const form = views.lupa
      const phone = value(form, 'phone')
      const pin = value(form, 'pin')
      if (!isPhone(phone)) {
        throw new Error('Tulis nomor HP yang terdaftar, contoh 0812xxxxxxxx.')
      }
      if (!pinOk(pin)) {
        throw new Error('PIN baru harus 6 digit angka.')
      }
      if (pin !== value(form, 'pin2')) {
        throw new Error('Kedua PIN belum sama.')
      }
      await ip('/auth/forgot-pin', { method: 'POST', body: { phone_number: normalizePhone(phone), new_pin: pin, confirm_new_pin: pin } })
      await toOtp(normalizePhone(phone), 'lupa')
    })
  })

  views.otp.addEventListener('submit', event => {
    event.preventDefault()
    void submit(views.otp, async () => {
      const code = value(views.otp, 'otp')
      if (!/^\d{6}$/.test(code)) {
        throw new Error('Kode verifikasi terdiri dari 6 digit angka.')
      }
      const path = state.otpFor === 'lupa' ? '/auth/verify-otp-forgot-pin' : '/auth/verify-otp'
      done(await ip<Session>(path, { method: 'POST', body: { phone_number: state.phone, otp_code: code } }))
    })
  })

  // isian angka saja untuk PIN dan kode
  for (const input of container.querySelectorAll<HTMLInputElement>('input[inputmode=numeric]')) {
    input.addEventListener('input', () => {
      const digits = input.value.replace(/\D/g, '')
      if (digits !== input.value) {
        input.value = digits
      }
    })
  }
}
