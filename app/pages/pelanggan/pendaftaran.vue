<script lang="ts" setup>
  defineOgImage('NuxtSeo', {
    headline: 'Pendaftaran Pelanggan',
    title: 'Perumda Tirta Patriot',
    siteLogo: 'https://tirtapatriot.co.id/logo.png',
    theme: '#0487d2',
  })

  useSeoMeta({
    title: 'Pendaftaran Pasang Baru - Perumda Tirta Patriot',
    description: 'Informasi alur, tahapan, dan persyaratan pendaftaran pemasangan sambungan air bersih baru Perumda Tirta Patriot Kota Bekasi.',
  })

  definePageMeta({
    alias: [
      '/pendaftaran-pasang-baru',
    ],
  })
</script>

<template>
  <v-main>
    <PageHeader title="Pendaftaran" />

    <v-container class="py-6">
      <div class="text-center mb-6">
        <h2 class="text-h4 font-weight-bold text-uppercase text-primary mb-2">
          Pendaftaran Sambungan Baru
        </h2>

        <p class="text-body-2 text-medium-emphasis">
          Tata cara dan tahapan permohonan pasang baru pelanggan air bersih Perumda Tirta Patriot.
        </p>
      </div>

      <PreRegister />

      <v-card class="mt-8 rounded-lg" :elevation="1" variant="outlined">
        <v-card-text class="d-flex flex-column flex-sm-row align-center pa-6">
          <div class="mb-4 mb-sm-0 mr-sm-6 text-center">
            <v-icon color="warning" icon="i-mdi:information" size="48" />
          </div>

          <div>
            <h4 class="text-subtitle-1 font-weight-bold mb-1">
              Pendaftaran & Konsultasi Langsung
            </h4>

            <p class="text-body-2 text-medium-emphasis mb-0">
              Pendaftaran online saat ini dalam proses integrasi sistem. Untuk informasi pendaftaran, survei lokasi, dan permohonan sambungan baru, tim Humas dan Layanan Pelanggan Perumda Tirta Patriot siap melayani Anda melalui kanal resmi berikut:
            </p>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="d-flex justify-center flex-wrap py-4">
          <SocialButtons />
        </v-card-actions>
      </v-card>
    </v-container>
  </v-main>
</template>
