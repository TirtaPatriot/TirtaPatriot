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
    // Navigation icons (from CMS)
    'i-mdi:home-outline',
    'i-mdi:office-building-outline',
    'i-mdi:people-outline',
    'i-mdi:information-outline',
    'i-mdi:court-hammer',
    // Social media icons
    'i-logos:whatsapp-icon',
    'i-mdi:whatsapp',
    'i-mdi:telegram',
    'i-mdi:instagram',
    'i-mdi:facebook',
    'i-mdi:twitter',
    // UI icons
    'i-mdi:chevron-down',
    'i-mdi:launch',
    'i-mdi:open-in-new',
    'i-mdi:directions',
    'i-mdi:magnify',
    // Communication icons
    'i-mdi:email',
    'i-mdi:phone',
    'i-mdi:message-fast-outline',
    // Building/Office icons
    'i-mdi:office-building',
    // Status/Action icons
    'i-mdi:check',
    'i-mdi:clock-outline',
    'i-mdi:ticket-confirmation-outline',
    'i-mdi:warning-outline',
    // Service/Utility icons
    'i-mdi:water',
    'i-mdi:water-pump',
    'i-mdi:wallet-outline',
    'i-mdi:book-variant',
    'i-mdi:magnify-expand',
    'i-mdi:palette-swatch-outline',
    // Elevation utilities (Vuetify 4: 0-5 levels max)
    ...Array.from({ length: 6 }, (_, i) => `elevation-${i}`),
    // Rounded utilities
    ...['', '-0', '-sm', '-lg', '-xl', '-pill', '-circle', '-shaped'].map(suffix => `rounded${suffix}`),
  ],
})
