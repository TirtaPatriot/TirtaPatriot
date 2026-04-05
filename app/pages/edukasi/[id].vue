<script lang="ts" setup>
  definePageMeta({
    key: route => route.fullPath,
    alias: [
      '/informasi/edukasi/:id',
      '/info/edukasi/:id',
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
      `/edukasi/${slug.value}`,
      `/informasi/edukasi/${slug.value}`,
      `/info/edukasi/${slug.value}`,
    ]
  })

  async function findArticleByPermalink () {
    for (const permalink of permaCandidates.value) {
      const items = await getItems({
        collection: 'artikel',
        params: {
          filter: {
            status: { _eq: 'published' },
            jenis: { _eq: 'edukasi' },
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

  const { data, error, pending } = await useAsyncData<any | null>(
    () => `edukasi:${slug.value}`,
    async () => {
      if (permaCandidates.value.length === 0) {
        return null
      }

      return findArticleByPermalink()
    },
    {
      watch: [slug],
      default: () => null,
    },
  )

  const markdownContent = computed(() => {
    const contentValue = String(data.value?.content ?? '')
    const directusUrl = String(config.public.directusUrl ?? '').trim().replace(/\/+$/, '')

    if (!directusUrl) {
      return contentValue
    }

    const escaped = directusUrl.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
    return contentValue.replace(new RegExp(`${escaped}/assets/`, 'g'), '')
  })

  const siteName = 'Perumda Tirta Patriot'

  const pageTitle = computed(() => {
    if (!data.value?.judul) {
      return 'Edukasi'
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

    return plainText.slice(0, 160) || 'Konten edukasi dari Perumda Tirta Patriot.'
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
    <v-container class="prose">
      <v-empty-state
        v-if="error"
        icon="$warning"
        text="kami mencoba memuat data untuk anda akan tetapi kami mengalami kendala saat ini, cobalah beberapa saat lagi."
        title="Terjadi kesalahan tak terduga."
      />

      <v-skeleton-loader
        v-else-if="pending"
        type="heading, article"
      />

      <v-empty-state
        v-else-if="!data"
        icon="mdi:file-search-outline"
        text="Konten edukasi tidak ditemukan atau belum tersedia."
        title="Konten Tidak Ditemukan"
      />

      <div v-else :key="contentRenderKey">
        <h1 class="text-headline-small">
          {{ data?.judul }}
        </h1>
        <MDC
          v-if="markdownContent"
          :key="contentRenderKey"
          :value="markdownContent"
        />
        <div class="text-body-small text-right mx-4">
          {{ useDatetimeFormat(data?.dipublikasi) }}
        </div>
      </div>
    </v-container>
  </v-main>
</template>

<style>

</style>
