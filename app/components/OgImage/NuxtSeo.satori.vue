<script setup>
  import { computed } from 'vue'
  const props = defineProps({
    colorMode: { type: String, required: false, default: 'light' },
    title: { type: String, required: false, default: 'title' },
    description: { type: String, required: false },
    isPro: { type: Boolean, required: false },
  })
  const themeColor = computed(() => props.isPro ? '124, 58, 237' : '34, 197, 94')
  const accentColor = computed(() => props.isPro ? '#8b5cf6' : '#22c55e')
</script>

<template>
  <div
    :style="{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      padding: '40px',
      backgroundColor: colorMode === 'dark' ? '#171717' : '#ffffff',
      color: colorMode === 'dark' ? '#fafafa' : '#171717',
    }"
  >
    <!-- Gradient background -->
    <div
      :style="{
        position: 'absolute',
        inset: '0',
        backgroundImage: `radial-gradient(ellipse 100% 100% at 100% 100%, rgba(${themeColor}, 0.15) 0%, transparent 60%)`
      }"
    />
    <div
      :style="{
        position: 'absolute',
        inset: '0',
        backgroundImage: `radial-gradient(ellipse 100% 100% at 0.1% 0.1%, rgba(${themeColor}, 0.1) 0%, transparent 50%)`
      }"
    />

    <div
      :style="{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        textAlign: 'center',
        gap: '20px',
      }"
    >
      <!-- Logo -->
      <div :style="{ display: 'flex', alignItems: 'center', gap: '4px' }">
        <svg :style="{ width: '40px', height: '40px' }" viewBox="0 0 64 64">
          <defs>
            <linearGradient
              :id="isPro ? 'nsLine2' : 'nsLine1'"
              x1="0%"
              x2="100%"
              y1="100%"
              y2="0%"
            >
              <stop offset="0%" :stop-color="isPro ? '#7c3aed' : '#22c55e'" />
              <stop offset="100%" :stop-color="isPro ? '#c4b5fd' : '#86efac'" />
            </linearGradient>
            <linearGradient
              :id="isPro ? 'nsFill2' : 'nsFill1'"
              x1="0%"
              x2="0%"
              y1="0%"
              y2="100%"
            >
              <stop offset="0%" :stop-color="isPro ? '#7c3aed' : '#22c55e'" stop-opacity="0.6" />
              <stop offset="100%" :stop-color="isPro ? '#7c3aed' : '#22c55e'" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path d="M8 52 Q20 48 24 36 T40 20 T56 12 L56 56 L8 56 Z" :fill="`url(#${isPro ? 'nsFill2' : 'nsFill1'})`" />
          <path
            d="M8 52 Q20 48 24 36 T40 20 T56 12"
            fill="none"
            :stroke="`url(#${isPro ? 'nsLine2' : 'nsLine1'})`"
            stroke-linecap="round"
            stroke-width="4"
          />
          <circle cx="56" cy="12" :fill="`url(#${isPro ? 'nsLine2' : 'nsLine1'})`" r="6" />
        </svg>
        <span :style="{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.025em' }">
          Nuxt<span :style="{ marginLeft: '4px', color: accentColor }">SEO{{ isPro ? " Pro" : "" }}</span>
        </span>
      </div>

      <!-- Title -->
      <h1
        :style="{
          width: '100%',
          textAlign: 'center',
          fontSize: '48px',
          fontWeight: '700',
          margin: '0',
          lineHeight: '1.1',
          maxWidth: '700px',
          display: 'block',
          lineClamp: 3,
          textOverflow: 'ellipsis',
          textWrap: 'balance',
        }"
      >
        {{ title }}
      </h1>

      <!-- Description -->
      <p
        v-if="description"
        :style="{
          display: 'block',
          fontSize: '24px',
          opacity: 0.7,
          maxWidth: '650px',
          lineHeight: '1.625',
          lineClamp: 2,
          textOverflow: 'ellipsis',
        }"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>
