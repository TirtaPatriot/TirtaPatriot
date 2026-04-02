<script setup lang="ts">
  type RawNavItem = {
    [key: string]: unknown
    title?: string
    to?: string
    icon?: string
    props?: {
      prependIcon?: string | null
      to?: string | null
      href?: string | null
    }
    children?: RawNavItem[]
  }

  type NormalizedNavItem = {
    [key: string]: unknown
    title?: string
    children?: NormalizedNavItem[]
    props: {
      prependIcon?: string
      to?: string
      href?: string
    }
  }

  const { mdAndUp } = useDisplay()

  function normalizeCmsIcon (icon?: string | null): string | undefined {
    if (!icon)
      return undefined

    if (icon.startsWith('i-'))
      return icon

    // Backward compatibility for legacy CMS values.
    if (icon.startsWith('mdi-'))
      return `i-mdi:${icon.slice('mdi-'.length)}`

    if (/^[a-z0-9-]+:.+/i.test(icon))
      return `i-${icon}`

    return undefined
  }

  const img = useImage()
  const logo = img('8318BFD1-5D44-47B0-9953-9ED0215E26C5', { height: 42, transforms: [] }, { provider: 'directus' })

  const { getItems } = useDirectusItems()

  const mainNavigation = await getItems({
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

  function rn (nav: RawNavItem): NormalizedNavItem {
    const { to, icon, props: rawProps, children: _child, ...rest } = nav
    const sourceProps = rawProps ?? {}

    const toFromTopLevel = typeof to === 'string' ? to : undefined
    const toFromProps = typeof sourceProps.to === 'string' ? sourceProps.to : undefined
    const hrefFromProps = typeof sourceProps.href === 'string' ? sourceProps.href : undefined
    const rawTo = toFromTopLevel ?? toFromProps
    const href = hrefFromProps ?? (rawTo?.startsWith('http') ? rawTo : undefined)
    const normalizedTo = href ? undefined : rawTo

    const children = Array.isArray(_child) && _child.length > 0
      ? _child.map(child => rn(child)).filter(child => isVisibleNavItem(child))
      : undefined

    return {
      ...rest,
      children,
      props: {
        prependIcon: normalizeCmsIcon(icon ?? sourceProps.prependIcon ?? undefined),
        to: normalizedTo,
        href,
      },
    }
  }

  function isVisibleNavItem (item: NormalizedNavItem): boolean {
    const hasTitle = typeof item?.title === 'string' && item.title.trim().length > 0
    const hasIcon = typeof item?.props?.prependIcon === 'string' && item.props.prependIcon.trim().length > 0
    const hasLink = Boolean(item?.props?.to || item?.props?.href)
    return hasTitle || hasIcon || hasLink
  }

  const navigation = computed(() => {
    return (mainNavigation as RawNavItem[])
      .map(item => rn(item))
      .filter(item => isVisibleNavItem(item))
  })

  const drawer = ref(false)
  const route = useRoute()

  function normalizePathForMenu (path?: string): string {
    if (!path)
      return ''
    return path.replace(/^\/informasi/, '')
  }

  const currentMenu = computed(() => {
    const currentPath = normalizePathForMenu(route.path)
    return navigation.value.findIndex(m => m.children?.some(c => {
      const menuPath = normalizePathForMenu(c?.props?.to)
      return Boolean(menuPath) && currentPath.startsWith(menuPath)
    }))
  })
</script>

<template>
  <v-layout>
    <v-app-bar>
      <template #prepend>
        <NuxtLink aria-label="Beranda Tirta Patriot" title="Beranda Tirta Patriot" to="/">
          <img
            alt="Perumda Tirta Patriot"
            class="cursor-pointer mt-1"
            :src="logo"
          >
        </NuxtLink>
      </template>
      <template #append>
        <template v-if="mdAndUp">
          <template v-for="(m, x) of navigation" :key="m.id">
            <v-btn
              v-if="!m.children?.length"
              v-bind="m.props"
              class="text-capitalize"
              rounded="xl"
              variant="text"
            >
              {{ m.title }}
            </v-btn>
            <v-btn
              v-else
              :active="x === currentMenu"
              append-icon="i-mdi:chevron-down"
              class="text-capitalize"
              v-bind="m.props"
              rounded="xl"
              variant="text"
            >
              {{ m.title }}

              <ClientOnly>
                <v-menu activator="parent">
                  <v-list>
                    <v-list-item
                      v-for="(item, index) in m.children"
                      :key="String(item.id ?? index)"
                      :prepend-icon="item.props.prependIcon"
                      :title="item.title"
                      :to="item.props.to"
                      :href="item.props.href"
                      :value="index"
                    />
                  </v-list>
                </v-menu>
              </ClientOnly>
            </v-btn>
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
        disable-resize-watcher
        location="right"
        temporary
      >
        <v-list :items="navigation" />
      </v-navigation-drawer>
    </client-only>

    <slot />

  </v-layout>
</template>
