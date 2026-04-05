<script setup lang="ts">
  const props = withDefaults(
    defineProps<{ height?: number | string, width?: number | string, src?: string, provider?: string }>(),
    {
      src: 'C74BDC20-E6AE-423E-BE27-68F220D0F119',
      provider: 'directus',
    },
  )

  const normalizedSrc = computed(() => {
    const src = String(props.src ?? '').trim()

    if (props.provider !== 'directus') {
      return src
    }

    if (src.startsWith('/assets/')) {
      return src.replace('/assets/', '')
    }

    if (src.startsWith('assets/')) {
      return src.replace('assets/', '')
    }

    if (!src.startsWith('http://') && !src.startsWith('https://')) {
      return src
    }

    try {
      const url = new URL(src)
      const assetPrefix = '/assets/'

      if (!url.pathname.includes(assetPrefix)) {
        return src
      }

      const pathWithoutPrefix = url.pathname.slice(url.pathname.indexOf(assetPrefix) + assetPrefix.length)

      return `${pathWithoutPrefix}${url.search}`
    } catch {
      return src
    }
  })

  const img = useImage()
  const _srcset = computed(() => {
    return img.getSizes(normalizedSrc.value, {
      sizes: 'xs:100vw sm:100vw md:100vw lg:100vw xl:100vw',
      provider: props.provider,
      modifiers: {
        format: 'webp',
        quality: 70,
        height: props.height,
        width: props.width,
      },
    })
  })
</script>

<template>
  <VImg
    v-bind="$attrs"
    :height="height"
    :lazy-src="img(normalizedSrc, { quality: 50, height: 18 }, { provider })"
    :sizes="_srcset.sizes"
    :src="img(normalizedSrc, { height, width, quality: 70, format: 'webp' }, { provider })"
    :srcset="_srcset.srcset"
    :width="width"
  >
    <slot />
  </VImg>
</template>
