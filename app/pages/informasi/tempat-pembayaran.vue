<script lang="ts" setup>
  definePageMeta({
    alias: [
      '/tempat-pembayaran',
    ],
  })

  useSeoMeta({
    title: 'Tempat Pembayaran - Perumda Tirta Patriot',
    description: 'Daftar mitra pembayaran dan unit pelayanan resmi untuk membayar rekening air Perumda Tirta Patriot Kota Bekasi.',
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

    <v-container v-if="data?.length" class="py-8" max-width="1080">
      <PageIntro
        icon="i-mdi:wallet-outline"
        subtitle="Bayar rekening air Anda di mitra resmi kami atau datang langsung ke unit pelayanan terdekat."
        title="Tempat Pembayaran"
      />

      <h2 class="text-headline-small font-weight-bold mb-4">
        Mitra Pembayaran
      </h2>

      <v-row>
        <v-col
          v-for="p of data[0]"
          :key="p.url"
          cols="1/2"
          lg="1/6"
          md="1/4"
          sm="1/3"
        >
          <v-card
            class="partner-card pa-3 h-100 d-flex align-center justify-center"
            :href="p.url"
            rel="noopener noreferrer"
            rounded="xl"
            target="_blank"
            variant="outlined"
          >
            <p-img
              :alt="p.name"
              :aspect-ratio="1"
              class="w-100"
              contain
              :src="p.logo"
            />
          </v-card>
        </v-col>
      </v-row>

      <h2 class="text-headline-small font-weight-bold mt-10 mb-4">
        Unit Pelayanan Langsung
      </h2>

      <POfficeGrid :offices="data[1]" searchable />
    </v-container>
  </v-main>
</template>

<style scoped>
  .partner-card {
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .partner-card:hover {
    transform: translateY(-3px);
  }
</style>
