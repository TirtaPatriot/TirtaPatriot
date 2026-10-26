<script lang="ts" setup>
  defineOgImage('NuxtSeo', {
    headline: 'Manajemen Perusahaan',
    title: 'Perumda Tirta Patriot',
    siteLogo: 'https://tirtapatriot.co.id/logo.png',
    theme: '#0487d2',
  })
  definePageMeta({
    alias: [
      '/profile',
    ],
  })

  const { getItems } = useDirectusItems()
  const config = useRuntimeConfig()

  const sotkId = '8A917A55-EC1A-4166-890A-1FB3AC32E481'
  const sotkUrl = `${String(config.public.directusUrl ?? '').replace(/\/+$/, '')}/assets/${sotkId}`

  const { data } = await useAsyncData(
    'manajemen',
    () => getItems<any>({
      collection: 'manajemen_pegawai',
      params: {
        fields: ['id', 'nama', 'jabatan', 'foto'],
        filter: {
          manajemen: {
            _eq: 'direksi',
          },
        },
      },
    }),
  )
</script>

<template>
  <v-main>
    <PageHeader title="Manajemen" />

    <v-container class="py-8" max-width="1080">
      <PageIntro
        id="direksi"
        icon="i-mdi:account-group-outline"
        subtitle="Pimpinan Perumda Tirta Patriot Kota Bekasi."
        title="Jajaran Direksi"
      />

      <v-row justify="center">
        <v-col
          v-for="d of data || []"
          :key="d.id"
          class="d-flex justify-center"
          cols="1/1"
          lg="1/4"
          md="1/3"
          sm="1/2"
        >
          <p-img
            :aspect-ratio="3 / 4"
            class="w-100 align-end overflow-hidden text-white bg-light-blue-darken-1"
            cover
            max-width="320"
            provider="directus"
            rounded="xl"
            :src="d.foto"
          >
            <div class="direksi-overlay w-100 text-center px-4 pt-8 pb-4">
              <h3 class="mb-0 break-word text-title-medium font-weight-bold">
                {{ d.nama }}
              </h3>

              <div class="mt-1 mb-0 break-word text-body-small text-uppercase direksi-jabatan">
                {{ d.jabatan }}
              </div>
            </div>
          </p-img>
        </v-col>
      </v-row>

      <PageIntro
        id="sotk"
        class="mt-12"
        icon="i-mdi:sitemap-outline"
        subtitle="Geser untuk melihat bagan lengkap, atau buka gambar ukuran penuh."
        title="Susunan Organisasi & Tata Kerja"
      />

      <v-card class="pa-3 overflow-x-auto" rounded="xl" variant="outlined">
        <PImg
          :aspect-ratio="3292 / 1825"
          class="sotk-image"
          src="8A917A55-EC1A-4166-890A-1FB3AC32E481"
        />
      </v-card>

      <div class="text-center mt-4">
        <v-btn
          class="text-none"
          color="primary"
          :href="sotkUrl"
          prepend-icon="i-mdi:open-in-new"
          rel="noopener noreferrer"
          target="_blank"
          variant="tonal"
        >
          Buka gambar ukuran penuh
        </v-btn>
      </div>
    </v-container>
  </v-main>
</template>

<style scoped>
  .direksi-overlay {
    background: linear-gradient(to top, rgb(0 0 0 / 80%), rgb(0 0 0 / 0%));
  }

  .direksi-jabatan {
    opacity: 0.9;
  }

  .sotk-image {
    min-width: 700px;
  }
</style>
