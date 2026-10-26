<script lang="ts" setup>
  defineOgImage('NuxtSeo', {
    headline: 'Visi & Misi Perusahaan',
    title: 'Perumda Tirta Patriot',
    siteLogo: 'https://tirtapatriot.co.id/logo.png',
    theme: '#0487d2',
  })
  useSeoMeta({
    title: 'Visi & Misi - Perumda Tirta Patriot',
    description: 'Visi dan misi Perusahaan Umum Daerah Air Minum Tirta Patriot Kota Bekasi.',
  })

  const { getSingletonItem } = useDirectusItems()
  const { data } = await useAsyncData<any>('content.visi', () => {
    return getSingletonItem({ collection: 'visi' })
  })
</script>

<template>
  <v-main>
    <PageHeader title="Visi dan Misi" />

    <v-container class="py-8" max-width="860">
      <PageIntro
        icon="i-mdi:target-arrow"
        subtitle="Arah dan komitmen kami dalam menghadirkan layanan air bersih yang prima."
        title="Visi & Misi"
      />

      <v-card class="pa-5 pa-md-10" rounded="xl" variant="outlined">
        <article class="prose text-body-large" v-html="data?.isi" />
      </v-card>
    </v-container>
  </v-main>
</template>
