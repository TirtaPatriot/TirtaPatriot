<script lang="ts" setup>
const route = useRoute()
const config = useRuntimeConfig()

const { data } = await useLazyFetch<any>(`${config.public.apiUrl}/pengaduan/${route.params.id}`, {
  server: false,
  default: () => ({}),
})

const title = computed(() => `Pengaduan #${route.params.id}`)
const fdate = (d: string) => new Intl.DateTimeFormat('id').format(new Date(d))
</script>

<template>
  <v-main>
    <PageHeader :title="title" />
    <v-container>
      <v-sheet elevation="2" class="pt-4 px-4">
        <v-textarea :model-value="data.pelapor" label="Pelapor" rows="1" auto-grow variant="underlined" readonly />
        <v-textarea :model-value="data.perihal" label="Perihal" rows="1" auto-grow variant="underlined" readonly />
        <v-textarea :model-value="data.masalah" label="Masalah" rows="1" auto-grow variant="underlined" readonly />
        <v-textarea :model-value="$route.params.id || '-'" label="No. Aduan" rows="1" auto-grow variant="plain" readonly />
      </v-sheet>

      <v-timeline side="end">
        <v-timeline-item
          v-if="data?.tgl_WO"
          dot-color="blue"
          size="small"
        >
          <div class="d-flex">
            <strong class="me-4">{{ fdate(data.tgl_WO) }}</strong>
            <div>
              <strong>WO</strong>
              <div class="text-caption">
                Petugas ditugaskan untuk menangani aduan
              </div>
            </div>
          </div>
        </v-timeline-item>

        <v-timeline-item
          v-if="data?.tgl_survei"
          dot-color="blue"
          size="small"
        >
          <div class="d-flex">
            <strong class="me-4">{{ fdate(data.tgl_survei) }}</strong>
            <div>
              <strong>Survei</strong>
              <div class="text-caption">
                Petugas melakukan survei
              </div>
            </div>
          </div>
        </v-timeline-item>

        <v-timeline-item
          v-if="data?.tgl_DPB"
          dot-color="teal-lighten-3"
          size="small"
        >
          <div class="d-flex">
            <strong class="me-4">{{ fdate(data.tgl_DPB) }}</strong>
            <div>
              <strong>DPB</strong>
              <div class="text-caption">
                Petugas meminta barang keperluan perbaikan
              </div>
            </div>
          </div>
        </v-timeline-item>

        <v-timeline-item
          v-if="data?.tgl_DPG"
          dot-color="teal-lighten-3"
          size="small"
        >
          <div class="d-flex">
            <strong class="me-4">{{ fdate(data.tgl_DPG) }}</strong>
            <div>
              <strong>DPG</strong>
              <div class="text-caption">
                Barang keperluan perbaikan sudah tersedia
              </div>
            </div>
          </div>
        </v-timeline-item>

        <v-timeline-item
          v-if="data?.tgl_SPK"
          dot-color="teal-lighten-3"
          size="small"
        >
          <div class="d-flex">
            <strong class="me-4">{{ fdate(data.tgl_SPK) }}</strong>
            <div>
              <strong>SPK</strong>
              <div class="text-caption">
                Perbaikan sudah diperintahkan
              </div>
            </div>
          </div>
        </v-timeline-item>
        <v-timeline-item
          v-if="data?.tgl_BA"
          dot-color="teal-lighten-3"
          size="small"
        >
          <div class="d-flex">
            <strong class="me-4">{{ fdate(data.tgl_BA) }}</strong>
            <div>
              <strong>BAC</strong>
              <div class="text-caption">
                Perbaikan telah selesai <span v-if="data.solusi">dengan solusi {{ data.solusi?.trim() }}</span>
              </div>
            </div>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-container>
  </v-main>
</template>

<style>

</style>
