<script lang="ts" setup>
  const currentYear = useState('site.currentYear', () => new Date().getFullYear())

  const hours = [
    { day: 'Senin', time: '08:00 - 15:00' },
    { day: 'Selasa', time: '08:00 - 15:00' },
    { day: 'Rabu', time: '08:00 - 15:00' },
    { day: 'Kamis', time: '08:00 - 15:00' },
    { day: 'Jum\'at', time: '08:00 - 15:00' },
    { day: 'Sabtu', time: '08:00 - 15:00' },
  ]

  const services = [
    { title: 'Cek Tagihan', to: '/pelanggan/tagihan' },
    { title: 'Pengaduan', to: '/pelanggan/pengaduan' },
    { title: 'Pasang Baru', to: '/pelanggan/pendaftaran' },
    { title: 'Loket Pembayaran', to: '/informasi/tempat-pembayaran' },
  ]

  const info = [
    { title: 'Berita', to: '/informasi/berita' },
    { title: 'Kontak', to: '/perusahaan/kontak' },
    { title: 'Kebijakan Privasi & Ketentuan', to: '/informasi/privacy-policy' },
  ]
</script>

<template>
  <v-footer class="site-footer d-flex flex-column pt-10 pb-4 px-0">
    <v-container class="w-100" max-width="1080">
      <v-row>
        <v-col cols="1/1" md="4/12">
          <h3 class="text-title-large font-weight-bold mb-3">
            Kantor Pusat
          </h3>

          <p class="text-body-medium mb-3">
            Jl. Perjuangan No.99, RT.003/RW.011, Marga Mulya, Kec. Bekasi Utara, Kota Bekasi, Jawa Barat 17142
          </p>

          <p class="text-body-medium mb-1">
            <v-icon icon="i-mdi:email" size="small" /> humas@tirtapatriot.co.id
          </p>

          <p class="text-body-medium mb-0">
            <v-icon icon="i-mdi:phone" size="small" /> 021-8896-6161
          </p>
        </v-col>

        <v-col cols="1/1" md="3/12">
          <h3 class="text-title-large font-weight-bold mb-3">
            Jam Operasional
          </h3>

          <div v-for="h in hours" :key="h.day" class="d-flex text-body-medium mb-1">
            <div class="flex-shrink-0 footer-day">
              {{ h.day }}
            </div>

            <div>{{ h.time }}</div>
          </div>
        </v-col>

        <v-col cols="1/2" md="2/12">
          <h3 class="text-title-large font-weight-bold mb-3">
            Layanan
          </h3>

          <div class="d-flex flex-column ga-2 text-body-medium">
            <NuxtLink v-for="l in services" :key="l.to" class="footer-link" :to="l.to">
              {{ l.title }}
            </NuxtLink>
          </div>
        </v-col>

        <v-col cols="1/2" md="3/12">
          <h3 class="text-title-large font-weight-bold mb-3">
            Informasi
          </h3>

          <div class="d-flex flex-column ga-2 text-body-medium">
            <NuxtLink v-for="l in info" :key="l.to" class="footer-link" :to="l.to">
              {{ l.title }}
            </NuxtLink>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-4 footer-divider" />

      <div class="text-body-small text-center footer-copy">
        &copy; {{ currentYear }} — <strong>Perusahaan Umum Daerah Air Minum Tirta Patriot</strong>
      </div>
    </v-container>
  </v-footer>
</template>

<style scoped>
  .site-footer {
    background: #04266d;
    color: #fff;
  }

  .footer-day {
    width: 72px;
  }

  .footer-link {
    color: rgb(255 255 255 / 85%);
    text-decoration: none;
  }

  .footer-link:hover {
    color: #fff;
    text-decoration: underline;
  }

  .footer-divider {
    border-color: rgb(255 255 255 / 25%);
    opacity: 1;
  }

  .footer-copy {
    opacity: 0.85;
  }
</style>
