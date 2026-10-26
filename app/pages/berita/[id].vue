<script lang="ts" setup>
  definePageMeta({
    key: route => route.fullPath,
    alias: [
      '/informasi/berita/:id',
      '/info/berita/:id',
    ],
  })

  const { getItems } = useDirectusItems()
  const config = useRuntimeConfig()

  const route = useRoute()
  const slug = computed(() => String(route.params.id ?? '').trim())
  const permaCandidates = computed(() => {
    if (!slug.value) {
      return []
    }

    return [
      `/berita/${slug.value}`,
      `/informasi/berita/${slug.value}`,
      `/info/berita/${slug.value}`,
    ]
  })

  const data = ref<any | null>(null)
  const error = ref<any>(null)
  const pending = ref(false)

  let activeRequest = 0

  async function findArticleByPermalink () {
    for (const permalink of permaCandidates.value) {
      const items = await getItems({
        collection: 'artikel',
        params: {
          filter: {
            status: { _eq: 'published' },
            jenis: { _eq: 'berita' },
            permalink: { _eq: permalink },
          },
          limit: 1,
        },
      })

      if (items?.length) {
        return items[0]
      }
    }

    return null
  }

  async function loadArticle () {
    const requestId = ++activeRequest
    error.value = null

    if (permaCandidates.value.length === 0) {
      data.value = null
      return
    }

    pending.value = true

    try {
      const article = await findArticleByPermalink()

      if (requestId === activeRequest) {
        data.value = article
      }
    } catch (error_) {
      if (requestId === activeRequest) {
        error.value = error_
        data.value = null
      }
    } finally {
      if (requestId === activeRequest) {
        pending.value = false
      }
    }
  }

  await loadArticle()

  watch(slug, async (newSlug, oldSlug) => {
    if (newSlug !== oldSlug) {
      await loadArticle()
    }
  })

  const siteName = 'Perumda Tirta Patriot'

  const pageTitle = computed(() => {
    if (!data.value?.judul) {
      return 'Berita'
    }

    return data.value.judul
  })

  const pageDescription = computed(() => {
    const summary = String(data.value?.ringkasan ?? '').trim()

    if (summary) {
      return summary
    }

    const rawContent = String(data.value?.content ?? '')
    const plainText = rawContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return plainText.slice(0, 160) || 'Berita terbaru Perumda Tirta Patriot.'
  })

  const normalizedContent = computed(() => {
    const content = String(data.value?.content ?? '')
    const directusUrl = String(config.public.directusUrl ?? '').trim().replace(/\/+$/, '')

    if (!directusUrl) {
      return content
    }

    // const escaped = directusUrl.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
    return content
    // .replace(new RegExp(`${escaped}/assets/`, 'g'), '')
  })

  const contentRenderKey = computed(() => {
    const articleId = String(data.value?.id ?? '')
    const articleStamp = String(data.value?.date_updated ?? data.value?.date_created ?? '')
    return `${slug.value}:${articleId}:${articleStamp}`
  })

  useSeoMeta({
    title: () => pageTitle.value,
    description: () => pageDescription.value,
    ogTitle: () => `${pageTitle.value} | ${siteName}`,
    ogDescription: () => pageDescription.value,
    twitterTitle: () => `${pageTitle.value} | ${siteName}`,
    twitterDescription: () => pageDescription.value,
  })
</script>

<template>
  <v-main>
    <v-container class="py-8" max-width="860">
      <v-btn
        class="text-none mb-4"
        prepend-icon="i-mdi:arrow-left"
        to="/berita"
        variant="text"
      >
        Semua berita
      </v-btn>

      <v-empty-state
        v-if="error"
        icon="$warning"
        text="kami mencoba memuat berita untuk anda akan tetapi kami mengalami kendala saat ini, cobalah beberapa saat lagi."
        title="Terjadi kesalahan tak terduga."
      />

      <v-skeleton-loader
        v-else-if="pending"
        type="image, heading, article"
      />

      <v-empty-state
        v-else-if="!data"
        icon="mdi:file-search-outline"
        text="Konten berita tidak ditemukan atau belum tersedia."
        title="Konten Tidak Ditemukan"
      />

      <article v-else :key="contentRenderKey">
        <v-chip
          class="mb-3"
          color="primary"
          prepend-icon="i-mdi:calendar-outline"
          variant="tonal"
        >
          {{ useDateOnly(data?.dipublikasi || data?.date_created) }}
        </v-chip>

        <h1 class="text-headline-medium text-md-headline-large font-weight-bold mb-5">
          {{ data?.judul }}
        </h1>

        <p-img
          :aspect-ratio="16 / 9"
          class="mb-6"
          cover
          rounded="xl"
          :src="data?.cover || 'C74BDC20-E6AE-423E-BE27-68F220D0F119'"
        />

        <PContent :key="contentRenderKey" size="lg" :value="normalizedContent" />

        <v-divider class="my-6" />

        <PShare :title="data?.judul" />
      </article>
    </v-container>
  </v-main>
</template>
