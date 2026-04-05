<script lang="ts" setup>
  const { getItems } = useDirectusItems()

  const gangguan = await getItems<any>({
    collection: 'gangguan_layanan',
    params: {
      // limit: 2,
      sort: ['-waktu_mulai'],
      filter: {
        status: { _eq: 'published' },
        selesai: {
          _null: true,
        },
      },
    },
  })

  function formatDate (date: string) {
    return useDatetimeFormat(date)
  }

  function onClickAction () {
    navigateTo('/pelanggan/pengaduan')
  }
</script>

<template>
  <v-main>
    <PageHeader title="Gangguan Layanan" />
    <v-container>
      <v-empty-state
        v-if="!gangguan?.length"
        action-text="Pengaduan"
        icon="mdi-check"
        text="Tidak ada gangguan yang terdeteksi, jika anda merasa ada gangguan pada pelayanan kami, silahkan ajukan pengaduan"
        title="Layanan Berjalan Lancar"
        @click:action="onClickAction"
      />
      <div v-for="x of gangguan" v-else :key="x.id">
        <!-- {{ now }} -->
        <v-card class="my-4">
          <p-img cover :height="200" :src="x.image" />
          <v-card-title>
            {{ x.title }}
          </v-card-title>
          <v-card-subtitle v-if="x.subtitle">
            {{ x.subtitle }}
          </v-card-subtitle>
          <v-card-text>
            <div class="prose" v-html="x.content" />
          </v-card-text>
          <v-card-actions class="mx-2">
            <div>{{ formatDate(x.waktu_mulai) }}</div>
            <v-spacer />
            <div>{{ formatDate(x.estimasi_selesai) }}</div>
          </v-card-actions>
        </v-card>
      </div>
    </v-container>
  </v-main>
</template>

<style>

</style>
