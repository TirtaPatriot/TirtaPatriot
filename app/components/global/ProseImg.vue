<script lang="ts" setup>
  // Gambar markdown sering berada di dalam <p>, jadi hanya elemen inline yang dipakai
  // (figure di dalam p adalah HTML tidak valid dan memicu hydration mismatch).
  const props = defineProps<{
    src?: string
    alt?: string
    title?: string
  }>()

  const zoom = ref(false)
  const label = computed(() => (props.alt ? `Perbesar gambar: ${props.alt}` : 'Perbesar gambar'))
</script>

<template>
  <span class="content-figure">
    <button
      :aria-label="label"
      class="content-figure-btn"
      type="button"
      @click="zoom = true"
    >
      <img
        :alt="alt || ''"
        decoding="async"
        loading="lazy"
        :src="src"
      >
    </button>

    <span v-if="title" class="content-figcaption">{{ title }}</span>

    <v-dialog v-model="zoom" max-width="1280">
      <v-card class="no-glass content-zoom" rounded="xl">
        <v-btn
          aria-label="Tutup"
          class="content-zoom-close"
          icon="i-mdi:close"
          size="small"
          variant="flat"
          @click="zoom = false"
        />

        <img
          :alt="alt || ''"
          class="content-zoom-img"
          :src="src"
        >
      </v-card>
    </v-dialog>
  </span>
</template>

<style scoped>
  .content-figure {
    display: block;
    margin: 1.5em 0;
    text-align: center;
  }

  .content-figure-btn {
    display: inline-block;
    max-width: 100%;
    padding: 0;
    border: 0;
    background: none;
    cursor: zoom-in;
  }

  .content-figure-btn img {
    display: block;
    max-width: 100%;
    height: auto !important;
    border-radius: 12px;
  }

  .content-figcaption {
    display: block;
    margin-top: 0.5em;
    font-size: 0.875em;
    opacity: 0.75;
  }

  .content-zoom {
    position: relative;
    background: transparent;
    box-shadow: none;
  }

  .content-zoom-img {
    display: block;
    max-width: 100%;
    max-height: 90vh;
    margin: 0 auto;
    border-radius: 12px;
  }

  .content-zoom-close {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;
  }
</style>
