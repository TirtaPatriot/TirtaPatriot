import type { IconProps } from 'vuetify'
import { h } from 'vue'

// Custom Iconify icon set untuk Vuetify
const iconify = {
  component: (props: IconProps) => {
    let iconClass = String(props.icon || '')

    // Normalize icon format ke UnoCSS Iconify format (i-prefix:name)
    if (!iconClass.startsWith('i-')) {
      if (iconClass.startsWith('mdi-')) {
        iconClass = `i-mdi:${iconClass.slice(4)}`
      } else if (iconClass.includes(':')) {
        iconClass = `i-${iconClass}`
      } else if (iconClass.startsWith('$')) {
        // Vuetify aliases (e.g., $warning, $success)
        iconClass = `i-mdi:${iconClass.slice(1)}`
      } else {
        iconClass = `i-mdi:${iconClass}`
      }
    }

    return h('i', {
      class: iconClass,
      style: {
        fontSize: props.size > 0 ? (typeof props.size === 'number' ? `${props.size}px` : props.size) : undefined,
        color: props.color,
      },
    })
  },
}

export default {
  icons: {
    defaultSet: 'iconify',
    sets: {
      iconify,
    },
    aliases: {
      // Vuetify default aliases
      complete: 'mdi:check',
      cancel: 'mdi:close-circle',
      close: 'mdi:close',
      delete: 'mdi:close-circle',
      clear: 'mdi:close-circle',
      success: 'mdi:check-circle',
      info: 'mdi:information',
      warning: 'mdi:alert',
      error: 'mdi:close-circle',
      prev: 'mdi:chevron-left',
      next: 'mdi:chevron-right',
      checkboxOn: 'mdi:checkbox-marked',
      checkboxOff: 'mdi:checkbox-blank-outline',
      checkboxIndeterminate: 'mdi:minus-box',
      delimiter: 'mdi:circle',
      sort: 'mdi:arrow-up',
      expand: 'mdi:chevron-down',
      menu: 'mdi:menu',
      subgroup: 'mdi:menu-down',
      dropdown: 'mdi:menu-down',
      radioOn: 'mdi:radiobox-marked',
      radioOff: 'mdi:radiobox-blank',
      edit: 'mdi:pencil',
      ratingEmpty: 'mdi:star-outline',
      ratingFull: 'mdi:star',
      ratingHalf: 'mdi:star-half-full',
      loading: 'mdi:cached',
      first: 'mdi:page-first',
      last: 'mdi:page-last',
      unfold: 'mdi:unfold-more-horizontal',
      file: 'mdi:paperclip',
      plus: 'mdi:plus',
      minus: 'mdi:minus',
      sortAsc: 'mdi:arrow-up',
      sortDesc: 'mdi:arrow-down',
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        // Keep empty to follow Vuetify default light palette.
      },
      dark: {
        colors: {
          background: '#011B4A',
          surface: '#04266D',
          primary: '#4790FF',
          secondary: '#B1D4FF',
          accent: '#5AB8FF',
          error: '#FF6B6B',
          info: '#71C9F8',
          success: '#47B88E',
          warning: '#FFB74D',
        },
      },
    },
  },
}
