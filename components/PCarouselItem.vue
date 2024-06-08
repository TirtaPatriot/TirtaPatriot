<script setup lang="ts">
const props = withDefaults(
  defineProps<{ height?: number, width?: number, src: string, provider?: string }>(),
  {
    src: '/bg_slide-1.jpg',
    provider: 'directus',
  },
)
const img = useImage()
const _srcset = computed(() => {
  return img.getSizes(props.src, {
    sizes: 'xs:100vw sm:100vw md:100vw lg:100vw xl:100vw',
    provider: props.provider,
    modifiers: {
      format: 'webp',
      quality: 70,
      height: props.height ? Number(props.height) : undefined,
      width: props.width ? Number(props.width) : undefined,
    },
  })
})
</script>

<template>
  <VCarouselItem
    v-bind="$attrs"
    :lazy-src="img(src, { quality: 50, height: 18 }, { provider })"
    :src="img(src, { height, width, quality: 70, format: 'webp' }, { provider })"
    :srcset="_srcset.srcset"
    :height="height"
    :width="width"
    :sizes="_srcset.sizes"
  >
    <slot />
  </VCarouselItem>
</template>
