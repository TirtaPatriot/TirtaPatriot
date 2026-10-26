<script lang="ts" setup>
  const props = defineProps<{ title: string }>()

  const url = useRequestURL()
  const copied = ref(false)

  const link = computed(() => url.href)
  const text = computed(() => encodeURIComponent(`${props.title} ${link.value}`))

  const targets = computed(() => [
    { label: 'WhatsApp', icon: 'i-mdi:whatsapp', color: 'green', href: `https://wa.me/?text=${text.value}` },
    { label: 'Facebook', icon: 'i-mdi:facebook', color: '#1877f2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link.value)}` },
    { label: 'X', icon: 'i-mdi:twitter', color: 'black', href: `https://twitter.com/intent/tweet?text=${text.value}` },
  ])

  async function copy () {
    try {
      await navigator.clipboard.writeText(link.value)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch {
      copied.value = false
    }
  }
</script>

<template>
  <div class="d-flex flex-wrap align-center ga-2">
    <span class="text-body-medium text-medium-emphasis mr-1">Bagikan:</span>

    <v-btn
      v-for="t in targets"
      :key="t.label"
      :aria-label="`Bagikan ke ${t.label}`"
      :color="t.color"
      :href="t.href"
      icon
      rel="noopener noreferrer"
      size="small"
      target="_blank"
      variant="tonal"
    >
      <v-icon :icon="t.icon" />
    </v-btn>

    <v-btn
      class="text-none"
      :prepend-icon="copied ? 'i-mdi:check' : 'i-mdi:link-variant'"
      size="small"
      variant="tonal"
      @click="copy"
    >
      {{ copied ? 'Tautan disalin' : 'Salin tautan' }}
    </v-btn>
  </div>
</template>
