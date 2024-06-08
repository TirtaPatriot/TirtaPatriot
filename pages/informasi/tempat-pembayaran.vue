<script lang="ts" setup>
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
      <v-slide-group show-arrows class="my-4">
        <v-slide-group-item
          v-for="p of data[0]"
          :key="p.url"
        >
          <v-sheet elevation="2" class="ma-2" height="200" width="200">
            <nuxt-link :to="p.url" rel="external nofollow">
              <p-img aspect-ratio="1" :alt="p.name" :src="p.logo" class="ma-2" />
            </nuxt-link>
          </v-sheet>
        </v-slide-group-item>
      </v-slide-group>

      <h2 class="text-h4 font-weight-light mt-8 mb-2">
        Unit Pelayanan Langsung
      </h2>
      <v-list class="px-2 bg-transparent" variant="text" density="compact">
        <v-list-item
          v-for="o of data[1]"
          :key="o.id"
          :subtitle="o.address"
          :title="o.name"
          lines="three"
          :href="`https://www.google.com/maps?saddr=My+Location&daddr=${o.latitude},${o.longitude}`"
          rounded="shaped" prepend-icon="i-mdi:office-building"
          append-icon="i-mdi:directions"
          rel="external nofollow"
        />
      </v-list>
    </v-container>
  </v-main>
</template>
