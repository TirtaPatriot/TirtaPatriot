<script lang="ts" setup>
  defineOgImage('NuxtSeo', {
    headline: 'Beranda',
    title: 'Perumda Tirta Patriot',
    siteLogo: 'https://tirtapatriot.co.id/logo.png',
    theme: '#0487d2',
  })

  const heroHeight = 'clamp(300px, 46vw, 560px)'
  const carouselReady = ref(false)

  useHead({
    title: 'Beranda',
  })

  const { getItems } = useDirectusItems()

  const { data } = await useAsyncData(
    'beranda1',
    async () => {
      const carousel = await getItems<any>({
        collection: 'korsel',
        params: {
          sort: ['sort', 'id'],
          filter: {
            status: { _eq: 'published' },
          },
        },
      })
      return {
        carousel,
      }
    },
  )

  const quickActions = [
    { title: 'Cek Tagihan', subtitle: 'Rekening air Anda', icon: 'i-mdi:receipt-text-outline', to: '/pelanggan/tagihan' },
    { title: 'Pengaduan', subtitle: 'Lapor & lacak tiket', icon: 'i-mdi:ticket-confirmation-outline', to: '/pelanggan/pengaduan' },
    { title: 'Pasang Baru', subtitle: 'Sambungan air baru', icon: 'i-mdi:water-pump', to: '/pelanggan/pendaftaran' },
    { title: 'Loket Pembayaran', subtitle: 'Lokasi & mitra resmi', icon: 'i-mdi:map-marker-radius-outline', to: '/informasi/tempat-pembayaran' },
  ]

  const { data: berita } = await useAsyncData<any[]>(
    'beranda-berita',
    async () => {
      try {
        const rows = await getItems<any>({
          collection: 'artikel',
          params: {
            limit: 3,
            sort: ['-date_created'],
            fields: ['id', 'judul', 'ringkasan', 'cover', 'date_created', 'permalink'],
            filter: {
              status: { _eq: 'published' },
              jenis: { _eq: 'berita' },
            },
          },
        })
        return rows ?? []
      } catch {
        // berita bersifat pelengkap, jangan menggagalkan beranda
        return []
      }
    },
    { default: () => [] },
  )

  function shortDate (date?: string) {
    try {
      return date ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(date)) : ''
    } catch {
      return ''
    }
  }

  onMounted(() => {
    carouselReady.value = true
  })
</script>

<template>
  <v-main>
    <template v-if="carouselReady">
      <v-carousel
        class="w-100"
        cycle
        delimiter-icon="i-mdi:water"
        :height="heroHeight"
        hide-delimiter-background
        :show-arrows="false"
      >
        <p-carousel-item
          v-for="(slide, i) in data?.carousel"
          :key="String(slide?.id ?? slide?.image ?? i)"
          :alt="slide.alt || slide.title"
          class="w-100"
          cover
          provider="directus"
          :src="slide.image"
        />
      </v-carousel>
    </template>

    <p-img
      v-else
      class="w-100"
      cover
      :height="heroHeight"
      provider="directus"
      :src="data?.carousel?.[0]?.image || '/bg_slide-1.jpg'"
    />

    <v-container class="quick-actions" max-width="1080">
      <v-row dense>
        <v-col
          v-for="action in quickActions"
          :key="action.to"
          cols="1/2"
          md="1/4"
        >
          <v-card
            class="quick-card h-100 pa-4 text-center"
            :elevation="4"
            rounded="xl"
            :to="action.to"
          >
            <v-avatar class="mb-2" color="primary" size="52" variant="tonal">
              <v-icon :icon="action.icon" size="28" />
            </v-avatar>

            <div class="text-title-medium font-weight-bold">
              {{ action.title }}
            </div>

            <div class="text-body-small text-medium-emphasis">
              {{ action.subtitle }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container v-if="berita?.length" class="pt-10" max-width="1080">
      <div class="d-flex align-center justify-space-between mb-4">
        <h2 class="text-headline-small font-weight-bold">
          Berita Terbaru
        </h2>

        <v-btn
          append-icon="i-mdi:chevron-right"
          class="text-none"
          color="primary"
          to="/informasi/berita"
          variant="text"
        >
          Lihat semua
        </v-btn>
      </div>

      <v-row>
        <v-col
          v-for="item in berita"
          :key="item.id"
          cols="1/1"
          md="1/3"
        >
          <v-card
            class="h-100 d-flex flex-column"
            rounded="xl"
            :to="item.permalink"
            variant="outlined"
          >
            <p-img cover :height="170" :src="item.cover" />

            <v-card-item class="pb-0">
              <v-card-subtitle class="px-0">
                {{ shortDate(item.date_created) }}
              </v-card-subtitle>

              <v-card-title class="px-0 text-title-medium font-weight-bold berita-judul">
                {{ item.judul }}
              </v-card-title>
            </v-card-item>

            <v-card-text class="text-body-medium text-medium-emphasis">
              <div class="berita-ringkasan">
                {{ item.ringkasan }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="pt-10" max-width="1080">
      <v-card class="no-glass app-banner pa-6 pa-md-8" rounded="xl">
        <v-row align="center">
          <v-col cols="1/1" md="7/12">
            <h2 class="text-headline-small text-md-headline-medium font-weight-bold mb-1">
              Semua layanan dalam genggaman
            </h2>

            <p class="text-body-large app-banner-text">
              Akses informasi lebih cepat dan eksklusif melalui aplikasi Tirta Patriot Mobile.
            </p>
          </v-col>

          <v-col class="d-flex flex-wrap ga-3 justify-md-end" cols="1/1" md="5/12">
            <v-btn
              class="bg-black text-white text-none"
              href="https://play.google.com/store/apps/details?id=com.tpkb.intipasi"
              prepend-icon="i-logos:google-play-icon"
              rel="external nofollow"
              rounded="xl"
              size="large"
            >
              Google Play
            </v-btn>

            <v-btn
              class="bg-black text-white text-none"
              href="https://apps.apple.com/id/app/tirta-patriot-mobile/id6783699713"
              prepend-icon="i-logos:apple-app-store"
              rel="external nofollow"
              rounded="xl"
              size="large"
            >
              App Store
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-container>

    <v-container class="pt-10" max-width="1080">
      <v-card class="pa-5 pa-md-8" rounded="xl" variant="outlined">
        <PHimbauan />
      </v-card>
    </v-container>

    <div class="py-10">
      <PStatistic />
    </div>
  </v-main>
</template>

<style scoped>
  .quick-actions {
    position: relative;
    margin-top: -56px;
    z-index: 2;
  }

  .quick-card {
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .quick-card:hover {
    transform: translateY(-3px);
  }

  .berita-judul,
  .berita-ringkasan {
    display: -webkit-box;
    overflow: hidden;
    white-space: normal;
    -webkit-box-orient: vertical;
  }

  .berita-judul {
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .berita-ringkasan {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  .app-banner {
    background: linear-gradient(135deg, #04266d 0%, #0b6fb8 100%);
    color: #fff;
  }

  .app-banner-text {
    opacity: 0.9;
  }

</style>
