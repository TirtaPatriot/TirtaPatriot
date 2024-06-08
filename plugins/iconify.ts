// @unocss-include
import { aliases } from 'vuetify/iconsets/mdi'
import type { IconProps, IconSet } from 'vuetify'
import { Icon } from '#components'

const iconifyMdi: IconSet = {
  component: (props: IconProps) => h(
    'i',
    {},
    [
      h(Icon, {
        name: props.icon!.toString().replace('mdi-', 'mdi:'),
        disabled: props.disabled,
      }),
    ],
  ),
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vuetify:configuration', ({ vuetifyOptions }) => {
    vuetifyOptions.icons = {
      defaultSet: 'iconifyMdi',
      sets: { iconifyMdi },
      aliases,
    }
  })
})
