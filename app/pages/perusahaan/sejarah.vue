<script lang="ts" setup>
  defineOgImage('NuxtSeo', {
    headline: 'Sejarah Perusahaan',
    title: 'Perumda Tirta Patriot',
    siteLogo: 'https://tirtapatriot.co.id/logo.png',
    theme: '#0487d2',
  })
  useSeoMeta({
    title: 'Sejarah - Perumda Tirta Patriot',
    description: 'Sejarah berdirinya Perusahaan Umum Daerah Air Minum Tirta Patriot Kota Bekasi.',
  })

  const { getSingletonItem } = useDirectusItems()
  const { data } = await useAsyncData<any>('content.Sejarah', () => {
    return getSingletonItem({ collection: 'Sejarah' })
  })
</script>

<template>
  <v-main>
    <PageHeader :img="data?.cover" :title="data?.judul || 'Sejarah'" />

    <v-container class="py-8" max-width="860">
      <PageIntro
        icon="i-mdi:history"
        subtitle="Perjalanan kami melayani kebutuhan air bersih masyarakat Kota Bekasi."
        title="Sejarah Perumda Tirta Patriot"
      />

      <v-card class="pa-5 pa-md-10" rounded="xl" variant="outlined">
        <PContent format="html" omit-leading-heading size="lg" :value="data?.isi" />
      </v-card>
    </v-container>
  </v-main>
</template>
