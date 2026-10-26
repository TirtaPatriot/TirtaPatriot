<script lang="ts" setup>
  type Office = {
    id: number | string
    name: string
    address: string
    latitude?: number | string | null
    longitude?: number | string | null
  }

  const props = withDefaults(defineProps<{
    offices: Office[]
    searchable?: boolean
  }>(), {
    searchable: false,
  })

  const query = ref('')

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) {
      return props.offices
    }

    return props.offices.filter(o => `${o.name} ${o.address}`.toLowerCase().includes(q))
  })

  function directions (o: Office) {
    return `https://www.google.com/maps/dir/?api=1&destination=${o.latitude},${o.longitude}`
  }
</script>

<template>
  <div>
    <v-text-field
      v-if="searchable"
      v-model="query"
      class="mb-4"
      clearable
      hide-details
      label="Cari unit pelayanan"
      prepend-inner-icon="i-mdi:magnify"
      variant="outlined"
    />

    <v-row v-if="filtered.length > 0">
      <v-col
        v-for="o in filtered"
        :key="o.id"
        cols="1/1"
        md="1/3"
        sm="1/2"
      >
        <v-card class="h-100 d-flex flex-column" rounded="xl" variant="outlined">
          <v-card-item>
            <template #prepend>
              <v-avatar color="primary" size="44" variant="tonal">
                <v-icon icon="i-mdi:office-building-outline" size="24" />
              </v-avatar>
            </template>

            <v-card-title class="text-wrap text-title-medium font-weight-bold">
              {{ useTitleCase(o.name) }}
            </v-card-title>
          </v-card-item>

          <v-card-text class="text-body-medium text-medium-emphasis flex-grow-1 pt-0">
            {{ useTitleCase(o.address) }}
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn
              block
              class="text-none"
              color="primary"
              :disabled="!o.latitude || !o.longitude"
              :href="directions(o)"
              prepend-icon="i-mdi:directions"
              rel="noopener noreferrer"
              target="_blank"
              variant="tonal"
            >
              Petunjuk Arah
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div v-else class="text-center text-medium-emphasis py-8">
      Tidak ada unit pelayanan yang cocok dengan pencarian Anda.
    </div>
  </div>
</template>
