<script lang="ts" setup>
const { getSingletonItem } = useDirectusItems()

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
</script>

<template>
  <v-main>
    <PageHeader :title="data?.judul" :img="data?.head_img" />
    <v-container class="prose">
      <v-empty-state
        v-if="error"
        icon="$warning"
        text="kami mencoba memuat berita untuk anda akan tetapi kami mengalami kendala saat ini, cobalah beberapa saat lagi."
        title="Terjadi kesalahan tak terduga."
      />

      <template v-else>
        <p-img cover :src="data?.cover || 'C74BDC20-E6AE-423E-BE27-68F220D0F119'" :height="520" />
        <MDC :value="data.content" />
      </template>
    </v-container>
  </v-main>
</template>

<style>

</style>
