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

    <v-container>
      <!-- <p-img cover src="/bg_slide-1.jpg" aspect-ratio="1">
      <div class="d-flex flex-column fill-height align-center justify-center text-white">
        <h1 class="text-headline-large font-weight-thin mb-4">
          Perumda Tirta Patriot
        </h1>
        <h4 class="subheading">
          Profile Perusahaan
        </h4>
      </div>
    </p-img> -->
      <div id="direksi" class="text-center text-headline-medium my-6">
        JAJARAN <strong>DIREKSI</strong>
      </div>
      <v-row justify="center">
        <v-col
          v-for="d of data || []"
          :key="d.id"
          class="d-flex justify-center"
          cols="1/1"
          lg="1/4"
          md="1/3"
          sm="1/2"
          xs="1/1"
        >
          <p-img
            :aspect-ratio="3 / 4"
            class="w-100 align-end overflow-hidden text-white text-uppercase bg-light-blue-darken-1"
            cover
            max-width="320"
            provider="directus"
            rounded="xl"
            :src="d.foto"
          >
            <div class="direksi-overlay w-100 text-center px-4 pt-5 pb-4">
              <h5 class="mb-0 break-word text-body-large text-md-headline-small text-lg-body-large">
                {{ d.nama }}
              </h5>
              <h6 class="mt-2 mb-0 font-weight-bold break-word text-body-small">
                {{ d.jabatan }}
              </h6>
            </div>
          </p-img>
        </v-col>
      </v-row>

      <!-- <div class="text-headline-medium mt-12 text-center">
        JAJARAN <strong>MANAJER</strong>
      </div>
      <v-row justify="center">
        <v-col v-for="m of dirute" :key="m.id" :cols="xs ? 12 : sm ? 6 : 3">
          <p-img class="text-center align-end text-dark" :src="m.foto" :height="3512 / 8" :width="2558 / 8">
            <div class="bg-blue">
              <div class="text-title">
                {{ m.nama }}
              </div>
              <div class="text-body-small">
                {{ m.bagian }}
              </div>
            </div>
          </p-img>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col v-for="m of dirume" :key="m.id" :cols="xs ? 12 : sm ? 6 : 3">
          <p-img class="text-center align-end text-dark" :src="m.foto" :height="3512 / 8" :width="2558 / 8" contain>
            <div class="bg-blue">
              <div class="text-title">
                {{ m.nama }}
              </div>
              <div class="text-body-small">
                {{ m.bagian }}
              </div>
            </div>
          </p-img>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col v-for="m of dirteke" :key="m.id" :cols="xs ? 12 : sm ? 6 : 3">
          <p-img class="text-center align-end text-dark" :src="m.foto" :height="3512 / 8" :width="2558 / 8" contain>
            <div class="bg-blue">
              <div class="text-title">
                {{ m.nama }}
              </div>
              <div class="text-body-small">
                {{ m.bagian }}
              </div>
            </div>
          </p-img>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col v-for="m of diruse" :key="m.id" :cols="xs ? 12 : sm ? 6 : 3">
          <p-img class="text-center align-end text-dark" :src="m.foto" :height="3512 / 8" :width="2558 / 8" contain>
            <div class="bg-blue">
              <div class="text-title">
                {{ m.nama }}
              </div>
              <div class="text-body-small">
                {{ m.bagian }}
              </div>
            </div>
          </p-img>
        </v-col>
      </v-row> -->
    </v-container>
    <div id="sotk" class="text-headline-medium text-center mb-4 mt-6 mx-auto">
      SUSUNAN ORGANISASI & TATA KERJA
    </div>
    <v-sheet class="pa-4 mx-4 overflow-x-auto" color="white" elevation="2">
      <PImg
        :aspect-ratio="3292 / 1825"
        class="sotk-image"
        src="41302BD1-8DB1-47D8-B58E-BAEEE7BF64EB"
      />
    </v-sheet>
  </v-main>
</template>

<style scoped>
  .direksi-overlay {
    background: linear-gradient(to top, rgb(0 0 0 / 72%), rgb(0 0 0 / 8%));
  }

  .sotk-image {
    min-width: 700px;
  }
</style>
