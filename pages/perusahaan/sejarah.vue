<script lang="ts" setup>
defineOgImageComponent('NuxtSeo', {
  headline: 'Sejarah Perusahaan',
  title: 'Perumda Tirta Patriot',
  siteLogo: 'https://tirtapatriot.co.id/logo.png',
  theme: '#0487d2',
})
const { getSingletonItem } = useDirectusItems()
const { data } = await useAsyncData<any>('content.Sejarah', () => {
  return getSingletonItem({ collection: 'Sejarah' })
})
</script>

<template>
  <v-main>
    <PageHeader :title="data?.judul || 'Sejarah'" :img="data?.cover" />
    <v-container class="prose">
      <article v-html="data?.isi" />
    </v-container>
  </v-main>
</template>

<style>

</style>
