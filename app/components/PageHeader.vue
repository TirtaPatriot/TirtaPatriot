<script lang="ts" setup>
  const props = defineProps({
    title: String,
    img: String,
  })

  useHead({
    title: props.title,
  })
</script>

<template>
  <p-img cover :height="160" :src="$props.img || 'C74BDC20-E6AE-423E-BE27-68F220D0F119'">
    <div class="page-header-overlay d-flex align-end">
      <v-container class="pb-5" max-width="1080">
        <h1 class="page-header-title text-headline-medium text-sm-headline-large font-weight-bold text-white">
          {{ title }}
        </h1>
      </v-container>
    </div>
  </p-img>
</template>

<style scoped>
  .page-header-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgb(4 38 109 / 15%) 0%, rgb(4 38 109 / 78%) 100%);
  }

  .page-header-title {
    text-shadow: 0 2px 8px rgb(0 0 0 / 35%);
  }
</style>
