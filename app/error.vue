<script lang="ts" setup>
  import type { NuxtError } from '#app'

  const props = defineProps<{ error: NuxtError }>()

  const notFound = computed(() => props.error?.statusCode === 404)

  useHead({
    title: notFound.value ? 'Halaman tidak ditemukan' : 'Terjadi kendala',
  })

  const shortcuts = [
    { title: 'Cek Tagihan', icon: 'i-mdi:receipt-text-outline', to: '/pelanggan/tagihan' },
    { title: 'Pengaduan', icon: 'i-mdi:ticket-confirmation-outline', to: '/pelanggan/pengaduan' },
    { title: 'Kontak', icon: 'i-mdi:phone', to: '/perusahaan/kontak' },
  ]

  function goHome () {
    clearError({ redirect: '/' })
  }
</script>

<template>
  <v-app>
    <v-main>
      <v-container class="d-flex flex-column align-center text-center py-16" max-width="720">
        <v-avatar class="mb-4" color="primary" size="88" variant="tonal">
          <v-icon :icon="notFound ? 'i-mdi:water-off-outline' : 'i-mdi:alert-circle-outline'" size="48" />
        </v-avatar>

        <div class="text-label-large text-primary mb-1">
          {{ error?.statusCode || 'Error' }}
        </div>

        <h1 class="text-headline-medium font-weight-bold mb-2">
          {{ notFound ? 'Halaman tidak ditemukan' : 'Terjadi kendala pada layanan kami' }}
        </h1>

        <p class="text-body-large text-medium-emphasis mb-6">
          {{ notFound
            ? 'Alamat yang Anda tuju mungkin sudah dipindahkan atau tidak tersedia. Silakan kembali ke beranda atau gunakan layanan di bawah ini.'
            : 'Silakan coba lagi beberapa saat lagi. Jika masalah berlanjut, hubungi Contact Center kami.' }}
        </p>

        <v-btn
          class="text-none mb-8"
          color="primary"
          prepend-icon="i-mdi:home-outline"
          size="large"
          variant="flat"
          @click="goHome"
        >
          Kembali ke Beranda
        </v-btn>

        <v-row class="w-100" justify="center">
          <v-col
            v-for="s in shortcuts"
            :key="s.to"
            cols="1/1"
            sm="1/3"
          >
            <v-card
              class="pa-4 text-center"
              rounded="xl"
              :to="s.to"
              variant="outlined"
            >
              <v-icon class="mb-1" color="primary" :icon="s.icon" size="28" />

              <div class="text-title-medium font-weight-bold">
                {{ s.title }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <SiteFooter />
    </v-main>
  </v-app>
</template>
