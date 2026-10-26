<template>
  <v-app>
    <NuxtLoadingIndicator color="#0b6fb8" :height="3" />

    <nuxt-layout>
      <nuxt-page />
    </nuxt-layout>
  </v-app>
</template>

<style>
/* transparansi sebelumnya dihitung dua kali (warna + elemen) sehingga kontras hanya ~2,5:1 */
.v-application .text-medium-emphasis {
  color: rgba(var(--v-theme-on-background), 0.7) !important;
  opacity: 1 !important;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

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
