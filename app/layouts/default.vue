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

  useHead({
    htmlAttrs: {
      lang: 'id',
    },
  })

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

  function normalizeCmsIcon (icon?: string | null): string | undefined {
    if (!icon)
      return undefined

    if (icon.startsWith('i-'))
      return icon

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
      sort: ['sort', 'id'],
      filter: {
        navigasi: {
          pid: {
            _eq: 'main',
          },
        },
      },
      deep: {
        children: {
          _sort: ['sort', 'id'],
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

  function getNavKey (item: NormalizedNavItem, fallback: number): string {
    return String(item.id ?? item.title ?? fallback)
  }
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
        <div class="desktop-nav">
          <template v-for="(m, x) of navigation" :key="String(m.id ?? m.title ?? x)">
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
              class="text-capitalize"
              v-bind="m.props"
              rounded="xl"
              variant="text"
            >
              <template #append>
                <v-icon class="i-mdi:chevron-down" />
              </template>

              {{ m.title }}

              <ClientOnly>
                <v-menu activator="parent">
                  <v-list>
                    <v-list-item
                      v-for="(item, index) in m.children"
                      :key="String(item.id ?? index)"
                      :href="item.props.href"
                      :title="item.title"
                      :to="item.props.to"
                      :value="index"
                    >
                      <template v-if="item.props.prependIcon" #prepend>
                        <v-icon :class="item.props.prependIcon" />
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </ClientOnly>
            </v-btn>
          </template>
        </div>

        <div class="mobile-nav">
          <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" />
        </div>
      </template>
    </v-app-bar>

    <client-only>
      <v-navigation-drawer
        v-model="drawer"
        disable-resize-watcher
        location="right"
        temporary
      >
        <v-list>
          <template v-for="(item, index) in navigation" :key="getNavKey(item, index)">
            <v-list-item
              v-if="!item.children?.length"
              :href="item.props.href"
              :title="item.title"
              :to="item.props.to"
            >
              <template v-if="item.props.prependIcon" #prepend>
                <v-icon :class="item.props.prependIcon" />
              </template>
            </v-list-item>

            <v-list-group v-else>
              <template #activator="{ props }">
                <v-list-item v-bind="props" :title="item.title">
                  <template v-if="item.props.prependIcon" #prepend>
                    <v-icon :class="item.props.prependIcon" />
                  </template>
                </v-list-item>
              </template>

              <v-list-item
                v-for="(child, childIndex) in item.children"
                :key="getNavKey(child, childIndex)
                "
                :href="child.props.href"
                :title="child.title"
                :to="child.props.to"
              >
                <template v-if="child.props.prependIcon" #prepend>
                  <v-icon :class="child.props.prependIcon" />
                </template>
              </v-list-item>
            </v-list-group>
          </template>
        </v-list>
      </v-navigation-drawer>
    </client-only>

    <slot />

  </v-layout>
</template>

<style scoped>
  .desktop-nav {
    display: none;
    align-items: center;
    gap: 4px;
  }

  .mobile-nav {
    display: flex;
    align-items: center;
  }

  @media (width >= 840px) {
    .desktop-nav {
      display: flex;
    }

    .mobile-nav {
      display: none;
    }
  }
</style>
