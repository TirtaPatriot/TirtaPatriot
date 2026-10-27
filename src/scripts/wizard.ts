/**
 * Formulir bertahap: fieldset [data-step], penanda [data-stepper] > li, tombol [data-prev]/[data-next],
 * pengumuman [data-step-announce] untuk pembaca layar. Pergantian langkah beranimasi (motion.ts).
 */
import { showError } from './dom'
import { bringIntoView, swapPanels } from './motion'

export type Wizard = {
  readonly step: number
  readonly busy: boolean
  go: (step: number) => Promise<void>
}

export function createWizard (form: HTMLFormElement, titles: string[], options: { lastLabel: string, onEnter?: (step: number) => void }): Wizard {
  const fieldsets = [...form.querySelectorAll<HTMLFieldSetElement>('[data-step]')]
  const stepper = [...document.querySelectorAll<HTMLElement>('[data-stepper] > li')]
  const announce = document.querySelector<HTMLElement>('[data-step-announce]')
  const prev = form.querySelector<HTMLButtonElement>('[data-prev]')
  const next = form.querySelector<HTMLButtonElement>('[data-next]')
  const error = form.querySelector<HTMLElement>(':scope > [data-error]')
  const state = { step: 0, moving: false }

  async function go (step: number): Promise<void> {
    if (state.moving || step === state.step || step < 0 || step >= fieldsets.length) {
      return
    }
    const from = fieldsets[state.step]
    const direction = step > state.step ? 1 : -1
    state.step = step
    state.moving = true
    stepper.forEach((item, index) => {
      item.dataset.state = index < step ? 'done' : index === step ? 'current' : 'todo'
      item.toggleAttribute('aria-current', index === step)
    })
    if (announce) {
      announce.textContent = `Langkah ${step + 1} dari ${titles.length}: ${titles[step]}`
    }
    if (prev) {
      prev.hidden = step === 0
    }
    if (next) {
      next.dataset.idle = step === titles.length - 1 ? options.lastLabel : 'Lanjut'
      const label = next.querySelector('[data-label]')
      if (label) {
        label.textContent = next.dataset.idle
      }
    }
    options.onEnter?.(step)
    showError(error, '')
    bringIntoView(form)
    try {
      await swapPanels(form, from, fieldsets[step]!, direction)
    } finally {
      state.moving = false
    }
    fieldsets[step]?.querySelector<HTMLElement>('input:not([type=hidden]):not([type=radio]), select, textarea, input[type=radio]:checked')?.focus({ preventScroll: true })
  }

  prev?.addEventListener('click', () => void go(state.step - 1))

  return {
    get step () {
      return state.step
    },
    get busy () {
      return state.moving
    },
    go,
  }
}
