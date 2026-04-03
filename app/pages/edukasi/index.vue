<script lang="ts" setup>
  definePageMeta({
    alias: [
      '/info/edukasi',
      '/informasi/edukasi',
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
          _eq: 'edukasi',
        },
      },
    },
  })

  function formatDate (date: string) {
    return useDatetimeFormat(date)
  }
</script>

<template>
  <v-main>
    <PageHeader title="Edukasi" />
    <v-container>
      <v-empty-state
        v-if="!artikel?.length"
        action-text="Hubungi"
        icon="mdi:account-school-outline"
        text="Belum ada konten edukasi, jika anda memerlukan informasi lebih lanjut mohon hubungi kami"
        title="Tidak Ada Konten"
        @click:action="() => navigateTo('/perusahaan/kontak')"
      />
      <v-row v-else>
        <v-col
          v-for="item in artikel"
          :key="item.id"
          cols="12"
          sm="6"
          xl="4"
        >
          <v-card border class="pb-3 h-100" flat>
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
    </v-container>
  </v-main>
</template>
