<script lang="ts" setup>
  defineProps<{
    title: string
    subtitle: string
    badge?: string
    effective: string
    partyLabel: string
    party: string
    links?: { title: string, to: string }[]
  }>()
</script>

<template>
  <div class="d-flex flex-wrap justify-space-between align-center mb-4">
    <div>
      <h1 class="text-headline-medium font-weight-bold text-primary mb-2">
        {{ title }}
      </h1>

      <p class="text-title-medium text-medium-emphasis">
        {{ subtitle }}
      </p>
    </div>

    <v-chip v-if="badge" color="primary" variant="tonal">
      {{ badge }}
    </v-chip>
  </div>

  <v-card class="mb-6 pa-4 bg-grey-lighten-4" flat rounded="lg">
    <p class="text-body-medium mb-1">
      <strong>Tanggal Efektif:</strong> {{ effective }}
    </p>

    <p class="text-body-medium" :class="links?.length ? 'mb-1' : 'mb-0'">
      <strong>{{ partyLabel }}:</strong> {{ party }}
    </p>

    <p v-if="links?.length" class="text-body-medium mb-0">
      <strong>Tautan Terkait:</strong>

      <template v-for="(link, i) in links" :key="link.to">
        <span v-if="i" class="mx-2">•</span>

        <NuxtLink class="text-primary text-decoration-none font-weight-medium" :class="{ 'ml-1': !i }" :to="link.to">
          {{ link.title }}
        </NuxtLink>
      </template>
    </p>
  </v-card>
</template>
