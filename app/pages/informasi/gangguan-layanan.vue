<script lang="ts" setup>
  useSeoMeta({
    title: 'Gangguan Layanan - Perumda Tirta Patriot',
    description: 'Informasi gangguan layanan air bersih Perumda Tirta Patriot Kota Bekasi yang sedang berlangsung.',
  })

  const { getItems } = useDirectusItems()

  const gangguan = await getItems<any>({
    collection: 'gangguan_layanan',
    params: {
      sort: ['-waktu_mulai'],
      filter: {
        status: { _eq: 'published' },
        selesai: {
          _null: true,
        },
      },
    },
  })
</script>

<template>
  <v-main>
    <PageHeader title="Gangguan Layanan" />

    <v-container class="py-8" max-width="860">
      <PageIntro
        icon="i-mdi:water-alert-outline"
        subtitle="Pantau gangguan layanan yang sedang berlangsung dan perkiraan waktu pemulihannya."
        title="Informasi Gangguan Layanan"
      />

      <v-card
        v-if="!gangguan?.length"
        class="pa-8 text-center"
        color="success"
        rounded="xl"
        variant="tonal"
      >
        <v-icon icon="i-mdi:check-circle-outline" size="64" />

        <div class="text-headline-small font-weight-bold mt-2 text-high-emphasis">
          Layanan Berjalan Lancar
        </div>

        <p class="text-body-large mt-2 mb-6 text-high-emphasis">
          Tidak ada gangguan yang terdeteksi. Jika Anda merasa ada gangguan pada layanan kami, silakan ajukan pengaduan.
        </p>

        <v-btn
          class="text-none"
          color="green-darken-3"
          prepend-icon="i-mdi:ticket-confirmation-outline"
          to="/pelanggan/pengaduan"
          variant="flat"
        >
          Buat Pengaduan
        </v-btn>
      </v-card>

      <v-card
        v-for="x of gangguan"
        v-else
        :key="x.id"
        class="mb-6 overflow-hidden"
        rounded="xl"
        variant="outlined"
      >
        <p-img v-if="x.image" cover :height="200" :src="x.image" />

        <v-card-item>
          <template #prepend>
            <v-chip color="warning" prepend-icon="i-mdi:alert-outline" variant="flat">
              Sedang berlangsung
            </v-chip>
          </template>
        </v-card-item>

        <v-card-title class="text-wrap text-title-large font-weight-bold">
          {{ x.title }}
        </v-card-title>

        <v-card-subtitle v-if="x.subtitle" class="text-wrap">
          {{ x.subtitle }}
        </v-card-subtitle>

        <v-card-text>
          <div class="prose text-body-large" v-html="x.content" />
        </v-card-text>

        <v-divider />

        <v-card-text class="d-flex flex-wrap ga-4 text-body-medium">
          <div class="d-flex align-center ga-2">
            <v-icon color="primary" icon="i-mdi:clock-start" />

            <span><strong>Mulai:</strong> {{ useDateTimeShort(x.waktu_mulai) }}</span>
          </div>

          <div class="d-flex align-center ga-2">
            <v-icon color="primary" icon="i-mdi:clock-check-outline" />

            <span><strong>Estimasi selesai:</strong> {{ x.estimasi_selesai ? useDateTimeShort(x.estimasi_selesai) : 'Belum ditentukan' }}</span>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>
