<script lang="ts" setup>
  const props = defineProps({
    title: String,
    img: String,
  })

  useHead({
    title: props.title,
  })
</script>

<template>
  <p-img cover :height="180" :src="$props.img || 'C74BDC20-E6AE-423E-BE27-68F220D0F119'">
    <v-row class="fill-height ma-0 align-center justify-end">
        <v-col class="text-right text-white px-4 px-md-6" cols="1/1">
        <div class="text-h4" style="text-shadow: 0 0 10px blue;">
          {{ title }}
        </div>
      </v-col>
    </v-row>
  </p-img>
</template>
