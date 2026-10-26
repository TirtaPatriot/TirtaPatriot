<script lang="ts" setup>
  defineProps<{
    title: string
    subtitle?: string
    icon?: string
  }>()
</script>

<template>
  <div class="text-center mb-8">
    <v-avatar
      v-if="icon"
      class="mb-3"
      color="primary"
      size="56"
      variant="tonal"
    >
      <v-icon :icon="icon" size="32" />
    </v-avatar>

    <h2 class="text-headline-small text-sm-headline-medium font-weight-bold text-primary mb-2">
      {{ title }}
    </h2>

    <p v-if="subtitle" class="text-body-large text-medium-emphasis mx-auto page-intro-subtitle">
      {{ subtitle }}
    </p>
  </div>
</template>

<style scoped>
  .page-intro-subtitle {
    max-width: 680px;
  }
</style>
