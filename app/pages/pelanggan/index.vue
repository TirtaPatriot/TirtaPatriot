<script lang="ts" setup>
  defineOgImage('NuxtSeo', {
    headline: 'Layanan Pelanggan',
    title: 'Perumda Tirta Patriot',
    siteLogo: 'https://tirtapatriot.co.id/logo.png',
    theme: '#0487d2',
  })

  useSeoMeta({
    title: 'Layanan Pelanggan - Perumda Tirta Patriot',
    description: 'Pusat layanan pelanggan Perumda Tirta Patriot Kota Bekasi: Cek tagihan air online, pengaduan pelanggan & lacak tiket, serta informasi pendaftaran pasang baru.',
  })

  const services = [
    {
      title: 'Cek Tagihan Air',
      subtitle: 'Inquiry Rekening Online',
      description: 'Periksa riwayat penggunaan kubikasi air bulanan, stan meter, dan rincian total tagihan rekening air Anda dengan mudah.',
      icon: 'i-mdi:wallet-outline',
      color: 'primary',
      to: '/pelanggan/tagihan',
      actionText: 'Cek Tagihan',
    },
    {
      title: 'Pengaduan Pelanggan',
      subtitle: 'Layanan Aduan & Lacak Tiket',
      description: 'Laporkan kendala kualitas/kuantitas air, kebocoran pipa, serta pantau progres tindak lanjut penanganan tiket aduan Anda secara real-time.',
      icon: 'i-mdi:ticket-confirmation-outline',
      color: 'teal-darken-1',
      to: '/pelanggan/pengaduan',
      actionText: 'Buat / Lacak Aduan',
    },
    {
      title: 'Pendaftaran Sambungan Baru',
      subtitle: 'Pasang Baru',
      description: 'Ketahui alur proses, tahapan pendaftaran, survei lokasi, hingga pemasangan meter air bersih untuk sambungan rumah baru.',
      icon: 'i-mdi:water-pump',
      color: 'indigo-darken-1',
      to: '/pelanggan/pendaftaran',
      actionText: 'Info Pasang Baru',
    },
  ]
</script>

<template>
  <v-main>
    <PageHeader title="Layanan Pelanggan" />

    <v-container class="py-8">
      <div class="text-center mb-8">
        <h2 class="text-h4 font-weight-bold text-primary mb-2">
          Pusat Layanan Pelanggan
        </h2>

        <p class="text-body-1 text-medium-emphasis mx-auto" style="max-width: 680px;">
          Kemudahan akses layanan Perumda Tirta Patriot Kota Bekasi dalam satu pintu untuk kenyamanan dan kepuasan pelanggan kami.
        </p>
      </div>

      <v-row class="mb-6">
        <v-col
          v-for="service in services"
          :key="service.to"
          cols="12"
          md="4"
        >
          <v-card
            class="d-flex flex-column h-100"
            :elevation="2"
            hover
            :to="service.to"
          >
            <v-card-item class="pb-2">
              <template #prepend>
                <v-avatar
                  class="mr-3"
                  :color="service.color"
                  rounded="lg"
                  size="48"
                >
                  <v-icon :icon="service.icon" size="28" />
                </v-avatar>
              </template>

              <v-card-title class="text-h6 font-weight-bold">
                {{ service.title }}
              </v-card-title>

              <v-card-subtitle class="text-caption text-uppercase font-weight-medium">
                {{ service.subtitle }}
              </v-card-subtitle>
            </v-card-item>

            <v-card-text class="flex-grow-1 text-body-2 text-medium-emphasis">
              {{ service.description }}
            </v-card-text>

            <v-divider />

            <v-card-actions class="px-4 py-3">
              <span class="text-body-2 font-weight-bold text-primary">
                {{ service.actionText }}
              </span>

              <v-spacer />

              <v-icon color="primary" icon="i-mdi:chevron-right" size="20" />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-sheet
        class="pa-6 rounded-lg d-flex flex-column flex-sm-row align-center justify-space-between mt-8"
        color="surface-variant"
        :elevation="1"
      >
        <div class="d-flex align-center mb-4 mb-sm-0">
          <v-avatar class="mr-4" color="green" size="44">
            <v-icon color="white" icon="i-mdi:whatsapp" size="24" />
          </v-avatar>

          <div>
            <div class="text-subtitle-1 font-weight-bold">
              Butuh Bantuan Langsung?
            </div>

            <div class="text-body-2 text-medium-emphasis">
              Hubungi Contact Center WhatsApp resmi atau kunjungi kantor pelayanan kami.
            </div>
          </div>
        </div>

        <div class="d-flex ga-2">
          <v-btn
            color="green"
            href="https://wa.me/6287875163845"
            prepend-icon="i-mdi:whatsapp"
            rel="noopener noreferrer"
            target="_blank"
            variant="flat"
          >
            WhatsApp
          </v-btn>

          <v-btn
            color="primary"
            prepend-icon="i-mdi:phone"
            to="/perusahaan/kontak"
            variant="tonal"
          >
            Kontak UPP
          </v-btn>
        </div>
      </v-sheet>
    </v-container>
  </v-main>
</template>
