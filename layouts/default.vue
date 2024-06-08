<script lang="ts" setup>
// import { ssrClientHintsConfiguration } from 'virtual:vuetify-ssr-client-hints-configuration'

// const theme = useTheme()

// const enableToogleTheme = computed(() => {
//   if (ssrClientHintsConfiguration.prefersColorScheme && ssrClientHintsConfiguration.prefersColorSchemeOptions)
//     return !ssrClientHintsConfiguration.prefersColorSchemeOptions.useBrowserThemeOnly

//   return false
// })

// function toogleTheme() {
//   theme.global.name.value = theme.global.name.value === 'light' ? 'dark' : 'light'
// }

const { mdAndUp } = useDisplay()

const img = useImage()
const logo = img('8318BFD1-5D44-47B0-9953-9ED0215E26C5', { height: 42, quality: 100 }, { provider: 'directus' })

const { getItems } = useDirectusItems()

const mainNavigation = await getItems<any>({
  collection: 'butir_navigasi',
  params: {
    filter: {
      navigasi: {
        pid: {
          _eq: 'main',
        },
      },
    },
    fields: [
      '*',
      'children.*',
    ],
  },
})

function rn(nav: any) {
  const { to, icon, children: _child, ...rest } = nav
  const href = to?.startsWith('http') ? to : undefined

  let children
  if (_child.length)
    children = _child.map(rn)
  else
    children = undefined

  return {
    ...rest,
    children,
    props: {
      prependIcon: icon,
      to: href ? undefined : to,
      href,
    },
  }
}

const navigation = computed(() => {
  return mainNavigation.map(rn)
})

const drawer = ref<null | boolean>(null)
const route = useRoute()
const currentMenu = computed(() => {
  const parts = route.path.split('/').slice(1)
  if (parts.length < 2)
    return -1
  return navigation.value.findIndex(m => m.children?.some((c: any) => c?.props?.to.startsWith(`/${parts[0]}`)))
})
</script>

<template>
  <v-layout>
    <v-app-bar :elevation="2">
      <template #prepend>
        <NuxtLink to="/">
          <img
            class="cursor-pointer mt-1"
            alt="Perumda Tirta Patriot"
            :src="logo"
          >
        </NuxtLink>
      </template>

      <template #append>
        <template v-if="mdAndUp">
          <template v-for="(m, x) of navigation" :key="m.id">
            <v-btn v-if="!m.children?.length" variant="text" v-bind="m.props" class="text-capitalize">
              {{ m.title }}
            </v-btn>
            <v-menu v-else>
              <template #activator="{ props }">
                <v-btn
                  :active="x === currentMenu"
                  class="text-capitalize"
                  append-icon="i-mdi:chevron-down"
                  variant="text"
                  v-bind="{ ...m.props, ...props }"
                >
                  {{ m.title }}
                </v-btn>
              </template>
              <!-- {{ m.children }} -->

              <v-list :items="m.children" />
              <!-- <v-list>
                <v-list-item
                  v-for="(item, index) in m.children"
                  :key="index"
                  v-bind="item"
                  :value="index"
                />
              </v-list> -->
            </v-menu>
          </template>
          <!-- <v-btn variant="text" href="https://e-proc.perumdatirtapatriot.co.id/announcement" rel="external no-follow" class="text-capitalize">
            Pelelangan
          </v-btn> -->
        </template>
        <template v-else>
          <!-- <v-divider vertical /> -->
          <!-- <v-btn v-if="enableToogleTheme" icon="i-mdi:theme-light-dark" @click="toogleTheme" /> -->
          <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" />
        </template>
      </template>
    </v-app-bar>

    <client-only>
      <v-navigation-drawer
        v-model="drawer"

        temporary disable-resize-watcher mobile
        location="right"
      >
        <v-list :items="navigation" />
      </v-navigation-drawer>
    </client-only>
    <slot />
  </v-layout>
</template>
