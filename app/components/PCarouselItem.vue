<script setup lang="ts">
  const props = withDefaults(
    defineProps<{ height?: number, width?: number, src?: string, provider?: string }>(),
    {
      src: '/bg_slide-1.jpg',
      provider: 'directus',
    },
  )
  const img = useImage()

  const imageModifiers = computed(() => ({
    format: 'webp',
    quality: 70,
    fit: 'cover',
    height: props.height ? Number(props.height) : undefined,
    width: props.width ? Number(props.width) : undefined,
  }))

  const _srcset = computed(() => {
    return img.getSizes(props.src, {
      sizes: 'xs:100vw sm:100vw md:100vw lg:100vw xl:100vw',
      provider: props.provider,
      modifiers: imageModifiers.value,
    })
  })
</script>

<template>
  <VCarouselItem
    v-bind="$attrs"
    :height="height"
    :lazy-src="img(src, { quality: 40, fit: 'cover', height: 24 }, { provider })"
    :sizes="_srcset.sizes"
    :src="img(src, imageModifiers, { provider })"
    :srcset="_srcset.srcset"
  >
    <slot />
  </VCarouselItem>
</template>
