<script lang="ts" setup>
  definePageMeta({
    alias: [
      '/tempat-pembayaran',
    ],
  })
  const { getItems } = useDirectusItems()

  const { data } = await useAsyncData<any[]>(
    'tempat.pembayaran',
    () => Promise.all([
      getItems({ collection: 'tempat_pembayaran' }),
      getItems({ collection: 'kantor' }),
    ]),
  )
</script>

<template>
  <v-main>
    <PageHeader title="Tempat Pembayaran" />

    <v-container v-if="data?.length">
      <h2 class="text-h4 my-4 font-weight-light">
        Mitra Pembayaran
      </h2>
      <v-slide-group class="my-4" show-arrows>
        <v-slide-group-item
          v-for="p of data[0]"
          :key="p.url"
        >
          <v-sheet class="ma-2" elevation="2" height="200" width="200">
            <nuxt-link rel="external nofollow" :to="p.url">
              <p-img :alt="p.name" aspect-ratio="1" class="ma-2" :src="p.logo" />
            </nuxt-link>
          </v-sheet>
        </v-slide-group-item>
      </v-slide-group>

      <h2 class="text-h4 font-weight-light mt-8 mb-2">
        Unit Pelayanan Langsung
      </h2>
      <v-list class="px-2 bg-transparent" density="compact" variant="text">
        <v-list-item
          v-for="o of data[1]"
          :key="o.id"
          append-icon="i-mdi:directions"
          :href="`https://www.google.com/maps?saddr=My+Location&daddr=${o.latitude},${o.longitude}`"
          lines="three"
          prepend-icon="i-mdi:office-building"
          rel="external nofollow"
          rounded="shaped"
          :subtitle="o.address"
          :title="o.name"
        />
      </v-list>
    </v-container>
  </v-main>
</template>
