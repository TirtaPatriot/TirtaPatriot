<script lang="ts" setup>
  defineOgImage('NuxtSeo', {
    headline: 'Beranda',
    title: 'Perumda Tirta Patriot',
    siteLogo: 'https://tirtapatriot.co.id/logo.png',
    theme: '#0487d2',
  })

  const { mdAndDown } = useDisplay()
  const heroHeight = computed(() => mdAndDown.value ? 300 : 560)

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
  ])

  const { getItems } = useDirectusItems()

  const { data } = await useAsyncData(
    'beranda1',
    async () => {
      const carousel = await getItems<any>({
        collection: 'korsel',
        params: {
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
</script>

<template>
  <v-main>
    <v-carousel
      class="w-100"
      cycle
      delimiter-icon="i-mdi:water"
      hide-delimiter-background
      :show-arrows="false"
    >
      <p-carousel-item
        v-for="(slide, i) in data?.carousel"
        :key="i"
        :alt="slide.alt || slide.title"
        class="w-100"
        cover
        :height="heroHeight"
        provider="directus"
        :src="slide.image"
      />
    </v-carousel>
    <div class="grad-1">
      <div class="text-white d-flex justify-center flex-column align-center py-10">
        <div class="text-h5 pa-4">
          Dapatkan kabar dan informasi terbaru tentang kami di WhatsApp dan Telegram
        </div>
        <div>
          <v-btn
            class="ma-2"
            color="green"
            href="https://whatsapp.com/channel/0029VaaWmpGId7nRB1BLj52w"
            prepend-icon="i-logos:whatsapp-icon"
            rel="external nofollow"
            rounded="xl"
          >
            Ikuti Saluran WhatsApp
          </v-btn>

          <v-btn
            class="ma-2"
            color="blue-darken-1"
            href="https://t.me/PerumdaTirtaPatriot"
            prepend-icon="i-mdi:telegram"
            rel="external nofollow"
            rounded="xl"
          >
            Ikuti Saluran Telegram
          </v-btn>
        </div>
      </div>
    </div>

    <div class="text-white bg-blue py-md-10">
      <v-container class="border-lg border-surface-light">
        <v-row justify="center">
          <v-col v-if="!mdAndDown" cols="1">
            <v-icon icon="i-mdi:message-fast-outline" size="86" />
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
      class="d-flex flex-column bg-blue-darken-2 pt-8"
      :elevation="4"
    >
      <v-row class="w-100" justify="space-evenly" no-gutters>
        <v-col>
          <h4 class="text-h5">
            Kantor Pusat
          </h4>
          <div class="text-body-2">
            <p>
              Jl. Perjuangan  No.99, RT.003/RW.011, Marga Mulya,<br> Kec. Bekasi Utara, Kota Bekasi, Jawa Barat 17142
            </p>
            <p>
              <v-icon icon="i-mdi:email" size="x-small" /> perumda@tirtapatriot.co.id
            </p>
            <p>
              <v-icon icon="i-mdi:phone" size="x-small" /> 021-8896-6161
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
      <div>
        <a href="/informasi/privacy-policy/oca-google">
          OCA Privacy Policy
        </a>
        -
        <a href="/informasi/privacy-policy/oca-google-tos">
          OCA ToS
        </a>
      </div>
    </v-footer>
  </v-main>
</template>
