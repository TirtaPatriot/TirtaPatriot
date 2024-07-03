<script lang="ts" setup>
definePageMeta({
  alias: [
    '/info/berita',
    '/informasi/berita',
    '/pengumuman-pelanggan',
  ],
})
const { getItems } = useDirectusItems()
const artikel = await getItems<any>({
  collection: 'artikel',
  params: {
    limit: 10,
    sort: ['-date_created'],
    fields: ['judul', 'ringkasan', 'cover', 'date_created', 'permalink'],
    filter: {
      status: { _eq: 'published' },
      jenis: {
        _eq: 'berita',
      },
    },
  },
})

function formatDate(date: string) {
  return useDateFormat(date, 'DD MMMM YYYY HH:mm:ss', { locales: 'id-ID' })
}
</script>

<template>
  <v-main>
    <PageHeader title="Berita" />
    <v-container>
      <v-empty-state
        v-if="!artikel"
        icon="mdi:magnify"
        title="Tidak Ada Berita"
      />
      <div v-else>
        <v-row dense>
          <v-col
            v-for="item in artikel"
            :key="item.id"
            cols="auto"
            md="4"
          >
            <v-card class="pb-3" border flat>
              <p-img :src="item.cover" :height="200" cover />

              <v-list-item :subtitle="item.ringkasan" class="mb-2">
                <template #title>
                  <strong class="text-h6 mb-2">{{ item.judul }}</strong>
                </template>
              </v-list-item>

              <div class="d-flex justify-space-between px-4">
                <div class="d-flex align-center text-caption text-medium-emphasis me-1">
                  <v-icon icon="mdi-clock" start />

                  <div class="text-truncate">
                    {{ formatDate(item.date_created) }}
                  </div>
                </div>

                <v-btn
                  class="text-none"
                  size="small"
                  color="blue"
                  text="Selengkapnya"
                  :to="item.permalink"
                  flat
                />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </v-main>
</template>

<style>

</style>
