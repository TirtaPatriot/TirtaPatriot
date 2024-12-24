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

.grad-1 {
  background: rgb(2,0,36);
  background: radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(8,23,252,1) 0%, rgba(0,212,255,1) 100%);
}

.grad-0 {
  background: rgb(40,23,112) !important;
  background: linear-gradient(0deg, rgba(40,23,112,1) 0%, rgba(4,135,210,1) 100%) !important;
}
</style>
