<script lang="ts" setup>
const { getSingletonItem } = useDirectusItems()
const { data } = await useAsyncData<any>('content.Sejarah', () => {
  return getSingletonItem({ collection: 'Sejarah' })
})
</script>

<template>
  <v-main>
    <PageHeader :title="data?.judul" :img="data?.cover" />
    <v-container class="prose">
      <article v-html="data?.isi" />
    </v-container>
  </v-main>
</template>

<style>

</style>
