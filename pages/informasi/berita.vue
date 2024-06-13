<script lang="ts" setup>
definePageMeta({
  alias: [
    '/info/berita',
    '/pengumuman-pelanggan',
  ],
})
</script>

<template>
  <v-main>
    <PageHeader title="Berita" />
    <v-container>
      <v-banner
        class="my-4 border-thin py-4"
        color="success"
        icon="i-mdi:info"
      >
        <v-banner-text>
          <div class="text-h6">
            Belum ada berita
          </div>
        </v-banner-text>
      </v-banner>
    </v-container>
  </v-main>
</template>

<style>

</style>
