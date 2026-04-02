import presetIcons from '@unocss/preset-icons'
import { defineConfig } from 'unocss'
import { presetVuetify } from 'unocss-preset-vuetify'

export default defineConfig({
  presets: [
    presetIcons({
      prefix: 'i-',
    }),
    presetVuetify({
      font: {
        heading: 'Roboto, sans-serif',
        body: 'Roboto, sans-serif',
        mono: '"Roboto Mono", sans-serif',
      },
      typography: 'md3',
      elevation: 'md3',
    }),
  ],
  safelist: [
    'font-heading',
    'font-body',
    'font-mono',
    'i-logos:whatsapp-icon',
    'i-mdi:chevron-down',
    'i-mdi:launch',
    'i-mdi:home-outline',
    'i-mdi:office-building-outline',
    'i-mdi:people-outline',
    'i-mdi:information-outline',
    'i-mdi:court-hammer',
    ...Array.from({ length: 25 }, (_, i) => `elevation-${i}`),
    ...['', '-0', '-sm', '-lg', '-xl', '-pill', '-circle', '-shaped'].map(suffix => `rounded${suffix}`),
  ],
  outputToCssLayers: {
    cssLayerName: layer => layer === 'properties' ? null : `uno-${layer}`,
  },
})
