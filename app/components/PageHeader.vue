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
    <v-row align-content="center" class="fill-height" justify="center">
      <v-spacer />
      <v-col class="text-right text-white">
        <div class="text-h4 mr-4" style="text-shadow: 00px 0px 10px blue;">
          {{ title }}
        </div>
      </v-col>
    </v-row>
  </p-img>
</template>

<style>

</style>
