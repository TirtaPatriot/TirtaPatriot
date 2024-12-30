<script lang="ts" setup>
defineOgImageComponent('NuxtSeo', {
  headline: 'Pendaftaran Pelanggan',
  title: 'Perumda Tirta Patriot',
  siteLogo: 'https://tirtapatriot.co.id/logo.png',
  theme: '#0487d2',
})
definePageMeta({
  alias: [
    '/pendaftaran-pasang-baru',
  ],
})
</script>

<template>
  <v-main>
    <PageHeader title="Pendaftaran" />
    <v-container>
      <h3 class="text-title text-uppercase text-center mb-4">
        Pendaftaran Pelanggan
      </h3>

      <PreRegister />

      <v-card class="w-auto" variant="outlined">
        <v-card-text class="d-flex">
          <div>
            <v-icon icon="$warning" size="40" class="mx-4" color="warning" />
          </div>
          <div>
            <p>Mohon maaf, pendaftaran online sedang dalam pengembangan.</p>
            <p class="caption">
              Jika anda berkenan untuk berkomunikasi langsung, Humas Perumda Tirta Patriot akan sangat senang melayani anda di media sosial kami berikut
            </p>
          </div>
        </v-card-text>
        <v-card-actions class="d-flex justify-center overflow-auto">
          <SocialButtons />
        </v-card-actions>
      </v-card>
      <!-- <v-banner class="text-body-1" icon="$info" color="blue">
        <v-banner-text>
          <p>Mohon maaf, pendaftaran online sedang dalam pengembangan.</p>
          <p class="caption">
            Jika anda berkenan untuk berkomunikasi langsung, Humas Perumda Tirta Patriot akan sangat senang melayani anda di media sosial kami berikut
          </p>
        </v-banner-text>
        <template #actions>
          <SocialButtons />
        </template>
      </v-banner> -->
    </v-container>
  </v-main>
</template>

<style>

</style>
