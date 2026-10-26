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

/* fokus keyboard yang jelas untuk semua elemen interaktif */
:focus-visible {
  outline: 3px solid #0b6fb8;
  outline-offset: 2px;
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

/* tipografi artikel untuk konten CMS/markdown; :where() agar kelas utilitas tetap menang */
:where(.prose) :where(h1) {
  margin: 0 0 0.75em;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.25;
}

:where(.prose) :where(h2) {
  margin: 1.75em 0 0.5em;
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.3;
}

:where(.prose) :where(h3) {
  margin: 1.5em 0 0.5em;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.35;
}

:where(.prose) :where(p) {
  margin: 0 0 1em;
  line-height: 1.75;
}

:where(.prose) :where(ul, ol) {
  margin: 0 0 1em;
  padding-inline-start: 1.5em;
  line-height: 1.7;
}

:where(.prose) :where(li) {
  margin-bottom: 0.4em;
}

:where(.prose) :where(blockquote) {
  margin: 1.25em 0;
  padding: 0.75em 1.25em;
  border-inline-start: 4px solid rgb(var(--v-theme-primary));
  border-radius: 0 12px 12px 0;
  background: rgba(var(--v-theme-primary), 0.07);
}

:where(.prose) :where(blockquote p:last-child) {
  margin-bottom: 0;
}

:where(.prose) :where(img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
}

:where(.prose) :where(a) {
  color: rgb(var(--v-theme-primary));
}

:where(.prose) :where(table) {
  width: 100%;
  margin-bottom: 1em;
  border-collapse: collapse;
}

:where(.prose) :where(th, td) {
  padding: 0.5em 0.75em;
  border: 1px solid rgba(var(--v-theme-on-background), 0.15);
  text-align: start;
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
