<script lang="ts" setup>
  definePageMeta({
    alias: [
      '/info/berita',
      '/informasi/berita',
      '/pengumuman-pelanggan',
    ],
  })
  const { getItems } = useDirectusItems()

  const perPage = 12
  const page = ref(1)

  const { data, pending } = await useAsyncData(
    'berita',
    () => getItems<any>({
      collection: 'artikel',
      params: {
        limit: perPage + 1,
        offset: (page.value - 1) * perPage,
        sort: ['-date_created'],
        fields: ['judul', 'ringkasan', 'cover', 'date_created', 'permalink'],
        filter: {
          status: { _eq: 'published' },
          jenis: { _eq: 'berita' },
        },
      },
    }),
    { watch: [page] },
  )

  const artikel = computed(() => data.value?.slice(0, perPage) ?? [])
  const hasNext = computed(() => (data.value?.length ?? 0) > perPage)

  function changePage (delta: number) {
    page.value += delta
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function formatDate (date: string) {
    return useDatetimeFormat(date)
  }
</script>

<template>
  <v-main>
    <PageHeader title="Berita" />
    <v-container>
      <v-empty-state
        v-if="!artikel?.length"
        action-text="Hubungi"
        icon="mdi:newspaper"
        text="Belum ada konten berita, jika anda memerlukan informasi lebih lanjut mohon hubungi kami"
        title="Tidak Ada Konten"
        @click:action="() => navigateTo('/perusahaan/kontak')"
      />
      <div v-else>
        <v-row density="comfortable">
          <v-col
            v-for="item in artikel"
            :key="item.id"
            cols="auto"
            md="4"
          >
            <v-card border class="pb-3" flat>
              <p-img cover :height="200" :src="item.cover" />

              <v-list-item class="mb-2" :subtitle="item.ringkasan">
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
                  color="blue"
                  flat
                  size="small"
                  text="Selengkapnya"
                  :to="item.permalink"
                />
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="page > 1 || hasNext" class="my-6" justify="center">
          <v-btn
            :disabled="page === 1 || pending"
            prepend-icon="mdi-chevron-left"
            text="Sebelumnya"
            variant="outlined"
            @click="changePage(-1)"
          />
          <v-btn
            append-icon="mdi-chevron-right"
            class="mx-2"
            :disabled="!hasNext || pending"
            text="Berikutnya"
            variant="outlined"
            @click="changePage(1)"
          />
        </v-row>
      </div>
    </v-container>
  </v-main>
</template>

<style>

</style>
