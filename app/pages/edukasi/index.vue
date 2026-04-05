<script lang="ts" setup>
  definePageMeta({
    alias: [
      '/info/edukasi',
      '/informasi/edukasi',
    ],
  })
  const { getItems } = useDirectusItems()

  const perPage = 10
  const page = ref(1)

  const artikel = ref<any[]>([])
  const hasNext = ref(false)
  const isLoadingMore = ref(false)
  const loadSentinel = ref<HTMLElement | null>(null)

  async function fetchPage (targetPage: number) {
    const rows = await getItems<any>({
      collection: 'artikel',
      params: {
        limit: perPage + 1,
        offset: (targetPage - 1) * perPage,
        sort: ['-date_created'],
        fields: ['id', 'judul', 'ringkasan', 'cover', 'date_created', 'permalink'],
        filter: {
          status: { _eq: 'published' },
          jenis: {
            _eq: 'edukasi',
          },
        },
      },
    })

    return rows ?? []
  }

  const { data: initialRows, pending } = await useAsyncData<any[]>(
    'edukasi-initial',
    () => fetchPage(1),
    {
      default: () => [],
    },
  )

  watch(
    initialRows,
    rows => {
      if (page.value === 1 && artikel.value.length === 0) {
        hasNext.value = rows.length > perPage
        artikel.value = rows.slice(0, perPage)
      }
    },
    { immediate: true },
  )

  const skeletonCount = 6
  const isInitialLoading = computed(() => pending.value && artikel.value.length === 0)

  async function loadMore () {
    if (!hasNext.value || isLoadingMore.value || pending.value) {
      return
    }

    isLoadingMore.value = true
    try {
      const nextPage = page.value + 1
      const rows = await fetchPage(nextPage)
      hasNext.value = rows.length > perPage
      page.value = nextPage

      const nextItems = rows.slice(0, perPage)
      const merged = [...artikel.value, ...nextItems]
      artikel.value = Array.from(new Map(merged.map(item => [item.id, item])).values())
    } finally {
      isLoadingMore.value = false
    }
  }

  let observer: IntersectionObserver | null = null

  function setupInfiniteObserver () {
    observer?.disconnect()
    if (!loadSentinel.value || !import.meta.client) {
      return
    }

    observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          void loadMore()
        }
      },
      { rootMargin: '320px 0px' },
    )

    observer.observe(loadSentinel.value)
  }

  onMounted(() => {
    setupInfiniteObserver()
  })

  watch(loadSentinel, () => {
    setupInfiniteObserver()
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  function formatDate (date: string) {
    return useDatetimeFormat(date)
  }
</script>

<template>
  <v-main>
    <PageHeader title="Edukasi" />
    <v-container>
      <v-row v-if="isInitialLoading">
        <v-col
          v-for="i in skeletonCount"
          :key="`edukasi-skeleton-${i}`"
          cols="1/1"
          sm="1/2"
          xl="1/3"
        >
          <v-card class="edukasi-card h-100" loading rounded="xl" variant="outlined">
            <template #loader>
              <v-progress-linear color="primary" height="3" indeterminate />
            </template>

            <v-skeleton-loader type="image" />
            <v-card-item>
              <v-skeleton-loader type="heading" />
              <v-skeleton-loader type="text" />
            </v-card-item>
            <v-card-actions class="px-4 pb-4">
              <v-skeleton-loader class="w-100" type="button" />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-empty-state
        v-else-if="!artikel?.length"
        class="edukasi-empty mx-auto"
        action-text="Hubungi"
        icon="mdi:account-school-outline"
        text="Belum ada konten edukasi, jika anda memerlukan informasi lebih lanjut mohon hubungi kami"
        title="Tidak Ada Konten"
        @click:action="() => navigateTo('/perusahaan/kontak')"
      />
      <div v-else>
        <v-row>
          <v-col
            v-for="item in artikel"
            :key="item.id"
            cols="1/1"
            sm="1/2"
            xl="1/3"
          >
            <v-card class="edukasi-card h-100 d-flex flex-column" rounded="xl" variant="outlined">
              <p-img class="edukasi-cover" cover :height="210" :src="item.cover" />

              <v-card-item class="pb-1 px-4 pt-4">
                <v-card-title class="edukasi-title text-headline-small px-0">
                  {{ item.judul }}
                </v-card-title>
                <template #subtitle>
                  <div class="edukasi-date mt-2">
                    <v-icon class="edukasi-date-icon" icon="mdi-clock-outline" size="18" />
                    <span class="edukasi-date-text">{{ formatDate(item.date_created) }}</span>
                  </div>
                </template>
              </v-card-item>

              <v-card-text class="edukasi-summary px-4 pt-2 text-body-medium text-medium-emphasis">
                {{ item.ringkasan || 'Ringkasan belum tersedia.' }}
              </v-card-text>

              <v-card-actions class="px-4 pb-4 mt-auto">
                <v-btn
                  append-icon="mdi-arrow-right"
                  block
                  class="text-none"
                  color="primary"
                  :to="item.permalink"
                  variant="tonal"
                >
                  Baca Selengkapnya
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <div ref="loadSentinel" class="py-6 d-flex flex-column align-center ga-3">
          <v-progress-circular
            v-if="isLoadingMore"
            color="primary"
            indeterminate
            size="30"
            width="3"
          />
          <div v-else-if="!hasNext" class="text-body-medium text-medium-emphasis">
            Semua edukasi sudah ditampilkan.
          </div>
        </div>
      </div>
    </v-container>
  </v-main>
</template>

<style scoped>
  .edukasi-card {
    transition: transform 200ms ease, box-shadow 200ms ease;
  }

  .edukasi-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgb(0 0 0 / 10%);
  }

  .edukasi-cover {
    border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
  }

  .edukasi-title {
    line-height: 1.3;
    overflow: hidden;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .edukasi-date {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgb(var(--v-theme-on-surface), 0.6);
    font-size: 0.9rem;
  }

  .edukasi-date-icon {
    flex-shrink: 0;
  }

  .edukasi-date-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .edukasi-summary {
    overflow: hidden;
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .edukasi-empty {
    max-width: 760px;
  }

  .edukasi-empty :deep(.v-empty-state__content),
  .edukasi-empty :deep(.v-empty-state__actions) {
    justify-content: center;
    text-align: center;
  }
</style>
