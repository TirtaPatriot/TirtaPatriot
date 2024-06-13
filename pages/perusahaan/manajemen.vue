<script lang="ts" setup>
definePageMeta({
  alias: [
    '/profile',
  ]
})
const { sm, xs } = useDisplay()

const { getItems } = useDirectusItems()

const manPow = await getItems<any>({
  collection: 'manajemen_pegawai',
  params: {
    fields: ['id', 'nama', 'jabatan', 'foto'],
    filter: {
      manajemen: {
        _eq: 'direksi',
      },
    },
  },
})
</script>

<template>
  <v-main>
    <PageHeader title="Manajemen" />

    <v-container>
      <!-- <p-img cover src="/bg_slide-1.jpg" aspect-ratio="1">
      <div class="d-flex flex-column fill-height align-center justify-center text-white">
        <h1 class="text-h4 font-weight-thin mb-4">
          Perumda Tirta Patriot
        </h1>
        <h4 class="subheading">
          Profile Perusahaan
        </h4>
      </div>
    </p-img> -->
      <div id="direksi" class="text-center text-h5 my-6">
        JAJARAN <strong>DIREKSI</strong>
      </div>
      <v-row justify="center" align-content="center">
        <v-col v-for="d of manPow" :key="d.id" :cols="xs ? 12 : sm ? 6 : 3">
          <!-- <v-card class="mx-auto text-center" max-width="400"> -->
          <p-img style="text-shadow: -2px 1px 5px black" class="text-center text-white text-uppercase w-100 bg-blue align-end" :src="d.foto" :height="3512 / 10" :width="2558 / 10" provider="directus">
            <h5>
              {{ d.nama }}
            </h5>
            <h6>
              {{ d.jabatan }}
            </h6>
          </p-img>
          <!-- </v-card> -->
        </v-col>
      </v-row>

      <!-- <div class="text-h5 mt-12 text-center">
        JAJARAN <strong>MANAJER</strong>
      </div>
      <v-row justify="center">
        <v-col v-for="m of dirute" :key="m.id" :cols="xs ? 12 : sm ? 6 : 3">
          <p-img class="text-center align-end text-dark" :src="m.foto" :height="3512 / 8" :width="2558 / 8">
            <div class="bg-blue">
              <div class="text-title">
                {{ m.nama }}
              </div>
              <div class="text-caption">
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
              <div class="text-caption">
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
              <div class="text-caption">
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
              <div class="text-caption">
                {{ m.bagian }}
              </div>
            </div>
          </p-img>
        </v-col>
      </v-row> -->
    </v-container>
    <div id="direksi" class="text-h5 text-center mb-4 mt-6 mx-auto">
      SUSUNAN ORGANISASI & TATA KERJA
    </div>
    <v-sheet elevation="2" class="pa-4 mx-4" color="white">
      <PImg src="41302BD1-8DB1-47D8-B58E-BAEEE7BF64EB" class="w-100" :height="1825 / 3" :width="3292 / 3" />
      <!-- <v-img src="/SOTK-X.jpg" class="w-100" /> -->
    </v-sheet>
  </v-main>
</template>
