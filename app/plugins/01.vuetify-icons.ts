import type { IconProps } from 'vuetify'
import { h } from 'vue'

export default defineNuxtPlugin({
  name: 'vuetify-icons',
  parallel: true,
  setup (nuxtApp) {
    // Custom Iconify icon component untuk Vuetify
    const iconifyComponent = (props: IconProps) => {
      let iconClass = String(props.icon || '')

      // Normalize icon format ke UnoCSS Iconify format (i-prefix:name)
      if (!iconClass.startsWith('i-')) {
        if (iconClass.startsWith('mdi-')) {
          iconClass = `i-mdi:${iconClass.slice(4)}`
        } else if (iconClass.includes(':')) {
          iconClass = `i-${iconClass}`
        } else if (iconClass.startsWith('$')) {
          // Vuetify aliases akan di-resolve dari aliases config
          iconClass = `i-mdi:${iconClass.slice(1)}`
        } else {
          iconClass = `i-mdi:${iconClass}`
        }
      }

      const style: Record<string, string> = {}
      if (props.size > 0 && props.size > 0) {
        const sizeValue = typeof props.size === 'number' ? `${props.size}px` : String(props.size)
        style.fontSize = sizeValue
        style.width = sizeValue
        style.height = sizeValue
      }
      if (props.color) {
        style.color = String(props.color)
      }

      return h('i', {
        class: iconClass,
        style,
      })
    }

    // Hook into Vue app to configure Vuetify icons after it's mounted
    nuxtApp.hook('app:created', vueApp => {
      // Access Vuetify from Vue app's global properties
      const vuetify = vueApp.config.globalProperties.$vuetify

      if (vuetify?.icons) {
        // Configure Vuetify icons
        vuetify.icons.defaultSet = 'iconify'
        vuetify.icons.sets = vuetify.icons.sets || {}
        vuetify.icons.sets.iconify = { component: iconifyComponent }

        // Set aliases untuk Vuetify internal icons
        vuetify.icons.aliases = {
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
        }
      }
    })
  },
})
