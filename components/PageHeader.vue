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
  <p-img cover :src="$props.img || 'C74BDC20-E6AE-423E-BE27-68F220D0F119'" :height="180">
    <v-row justify="center" class="fill-height" align-content="center">
      <v-spacer />
      <v-col class="text-center text-white">
        <h1 class="text-h4">
          {{ title }}
        </h1>
      </v-col>
    </v-row>
  </p-img>
</template>

<style>

</style>
