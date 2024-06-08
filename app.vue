<script lang="ts" setup>
// useHead({
//   titleTemplate: '%s | Perumda Tirta Patriot',
// })
</script>

<template>
  <div>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
.grads {
  background: rgb(34, 120, 195);
  background: linear-gradient(0deg, rgb(34, 120, 195) 0%, rgba(255,255,255,1) 100%);
}
</style>
