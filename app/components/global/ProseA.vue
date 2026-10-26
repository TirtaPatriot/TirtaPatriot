<script lang="ts" setup>
  const props = defineProps<{
    href?: string
    target?: string
  }>()

  const site = useRequestURL()

  const external = computed(() => {
    try {
      const url = new URL(props.href ?? '', site.href)
      return /^https?:$/.test(url.protocol) && url.host !== site.host
    } catch {
      return false
    }
  })
</script>

<template>
  <NuxtLink
    :href="href"
    :rel="external ? 'noopener noreferrer' : undefined"
    :target="external ? '_blank' : target"
  >
    <slot />

    <span v-if="external" class="visually-hidden"> (tautan eksternal, terbuka di tab baru)</span>
  </NuxtLink>
</template>

<style scoped>
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
