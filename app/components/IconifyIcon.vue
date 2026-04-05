<template>
  <i :class="iconClass" :style="iconStyle" />
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps({
    icon: {
      type: String,
      required: true,
    },
    size: {
      type: [String, Number],
      default: undefined,
    },
    color: {
      type: String,
      default: undefined,
    },
  })

  const iconClass = computed(() => {
    // Format: mdi:home, mdi-home, i-mdi:home, atau prefix:name
    let icon = props.icon

    // Jika sudah punya prefix i-, langsung pakai
    if (icon.startsWith('i-')) {
      return icon
    }

    // Jika format mdi-name, convert ke i-mdi:name
    if (icon.startsWith('mdi-')) {
      return `i-mdi:${icon.slice(4)}`
    }

    // Jika format prefix:name (e.g., mdi:home, logos:whatsapp-icon)
    if (icon.includes(':')) {
      return `i-${icon}`
    }

    // Default fallback: assume it's mdi
    return `i-mdi:${icon}`
  })

  const iconStyle = computed(() => {
    const styles: Record<string, string> = {}

    if (props.size > 0) {
      const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size
      styles.width = sizeValue
      styles.height = sizeValue
      styles.fontSize = sizeValue
    }

    if (props.color) {
      styles.color = props.color
    }

    return styles
  })
</script>

<style scoped>
i {
  display: inline-block;
  vertical-align: middle;
}
</style>
