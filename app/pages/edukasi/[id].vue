<script lang="ts" setup>
  const { getSingletonItem } = useDirectusItems()
  const config = useRuntimeConfig()

  const route = useRoute()
  const perma = computed(() => route.path.replace('/informasi', ''))

  const { data, error } = await useAsyncData<any>(
    perma.value,
    () => getSingletonItem({
      collection: 'artikel',
      params: {
        filter: {
          permalink: {
            _eq: perma.value,
          },
        },
      },
    }),
    {
      transform: i => i?.length ? i[0] : null,
    },
  )

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

  const normalizedContent = computed(() => {
    const content = String(data.value?.content ?? '')
    const directusUrl = String(config.public.directusUrl ?? '').trim().replace(/\/+$/, '')

    if (!directusUrl) {
      return content
    }

    const escaped = directusUrl.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
    return content.replace(new RegExp(`${escaped}/assets/`, 'g'), '')
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

      <template v-else>
        <h1 class="text-h6">
          {{ data?.judul }}
        </h1>
        <MDC :value="normalizedContent" />
        <div class="text-caption text-right mx-4">
          {{ useDatetimeFormat(data?.dipublikasi) }}
        </div>
      </template>
    </v-container>
  </v-main>
</template>

<style>

</style>
