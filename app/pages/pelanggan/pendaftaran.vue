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

    <v-container class="py-8" max-width="960">
      <PageIntro
        icon="i-mdi:water-pump"
        subtitle="Tata cara dan tahapan permohonan pasang baru pelanggan air bersih Perumda Tirta Patriot."
        title="Pendaftaran Sambungan Baru"
      />

      <PreRegister />

      <v-card class="mt-8" :elevation="1" rounded="xl" variant="outlined">
        <v-card-text class="contact-body pa-6">
          <div class="text-center">
            <v-icon color="warning" icon="i-mdi:information" size="48" />
          </div>

          <div>
            <h4 class="text-title-medium font-weight-bold mb-1">
              Pendaftaran & Konsultasi Langsung
            </h4>

            <p class="text-body-medium text-medium-emphasis mb-0">
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

<style scoped>
  .contact-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  @media (width >= 600px) {
    .contact-body {
      flex-direction: row;
      gap: 24px;
    }
  }
</style>
