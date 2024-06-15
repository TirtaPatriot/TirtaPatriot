<script lang="ts" setup>
defineOgImageComponent('NuxtSeo', {
  headline: 'Beranda',
  title: 'Perumda Tirta Patriot',
  siteLogo: '/pwa-512x512.png',
  theme: '#0487d2',
})

const { mdAndDown } = useDisplay()
useHead({
  title: 'Beranda',
})

const hours = useState('office.hours', () => [
  {
    day: 'Senin',
    time: '08:00 - 15:00',
  },
  {
    day: 'Selasa',
    time: '08:00 - 15:00',
  },
  {
    day: 'Rabu',
    time: '08:00 - 15:00',
  },
  {
    day: 'Kamis',
    time: '08:00 - 15:00',
  },
  {
    day: 'Jum\'at',
    time: '08:00 - 15:00',
  },
  {
    day: 'Sabtu',
    time: '08:00 - 15:00',
  },
  // {
  //   day: 'Minggu',
  //   time: 'Tutup',
  // },
])

const { getItems } = useDirectusItems()

const { data } = await useAsyncData(
  'beranda1',
  async () => {
    const carousel = await getItems<any>({
      collection: 'korsel',
    })
    return {
      carousel,
    }
  },
)
</script>

<template>
  <v-main>
    <v-carousel
      class="w-100"
      :show-arrows="false"
      cycle
      hide-delimiter-background
      delimiter-icon="mdi:water"
    >
      <p-carousel-item
        v-for="(slide, i) in data?.carousel"
        :key="i"
        cover
        :src="slide.image"
        provider="directus"
        :height="1500 / 2"
        :width="3000 / 2"
        class="w-100"
        :alt="slide.alt || slide.title"
      />
    </v-carousel>
    <div class="grad-1">
      <div class="text-white d-flex justify-center flex-column align-center py-10">
        <div class="text-h5 pa-4">
          Dapatkan kabar dan informasi terbaru tentang kami di WhatsApp dan Telegram
        </div>
        <div>
          <v-btn class="ma-2" href="https://whatsapp.com/channel/0029VaaWmpGId7nRB1BLj52w" rel="external nofollow" color="green" prepend-icon="logos:whatsapp-icon">
            Ikuti Saluran WhatsApp
          </v-btn>

          <v-btn class="ma-2" href="https://t.me/PerumdaTirtaPatriot" rel="external nofollow" color="blue-darken-1" prepend-icon="i-mdi:telegram">
            Ikuti Saluran Telegram
          </v-btn>
        </div>
      </div>
    </div>

    <div class="text-white bg-blue py-md-10">
      <v-container class="border-lg border-surface-light">
        <v-row justify="center">
          <v-col v-if="!mdAndDown" cols="1">
            <v-icon size="86" icon="i-mdi:message-fast-outline" />
          </v-col>
          <v-col cols="auto">
            <PHimbauan />
          </v-col>
        </v-row>
      </v-container>
    </div>

    <div class="py-md-10 grad-1">
      <PStatistic />
    </div>

    <v-footer
      :elevation="4"
      class="d-flex flex-column bg-blue-darken-2 pt-8"
    >
      <v-row justify="space-evenly" class="w-100" no-gutters>
        <v-col>
          <h4 class="text-h5">
            Kantor Pusat
          </h4>
          <div class="text-body-2">
            <p>
              Jl. Perjuangan  No.99, RT.003/RW.011, Marga Mulya,<br> Kec. Bekasi Utara, Kota Bekasi, Jawa Barat 17142
            </p>
            <p>
              <v-icon size="x-small" icon="i-mdi:email" /> perumda@tirtapatriot.co.id
            </p>
            <p>
              <v-icon size="x-small" icon="i-mdi:phone" /> 021-8896-6161
            </p>
          </div>
        </v-col>
        <v-spacer />
        <v-col cols="auto">
          <h4 class="text-h5">
            Jam Operasional
          </h4>
          <div class="d-flex flex-column">
            <div v-for="(h, x) of hours" :key="x" class="d-flex flex-row">
              <div class="mr-6" style="width: 60px;">
                {{ h.day }}
              </div>
              <div class="text-right">
                {{ h.time }}
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
      <div>
        &copy; {{ new Date().getFullYear() }} — <strong>Perusahaan Umum Daerah Air Minum Tirta Patriot</strong>
      </div>
    </v-footer>
  </v-main>
</template>

<style>
.grad-1 {
  background: rgb(2,0,36);
  background: radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(8,23,252,1) 0%, rgba(0,212,255,1) 100%);
}
.grad-0 {
  background: rgb(40,23,112) !important;
  background: linear-gradient(0deg, rgba(40,23,112,1) 0%, rgba(4,135,210,1) 100%) !important;
}
</style>
