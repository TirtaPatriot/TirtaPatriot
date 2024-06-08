<script lang="ts" setup>
const props = defineProps<{
  error: {
    url: string
    statusCode: number
    statusMessage: string
    message: string
    description: string
    data: any
  }
}>()

const state = computed(() => {
  return {
    code: props.error.statusCode > 499 ? 500 : props.error.statusCode,
    message: props.error.statusCode === 404 ? 'Halaman Tidak Ditemukan' : props.error.message,
  }
})
</script>

<template>
  <div class="text-white grad-0 h-screen">
    <v-empty-state
      action-text="Kembali"
      icon="$warning"
      color="white"
      :text="state.message"
      title="Terjadi Kesalahan"
      @click:action="navigateTo('/', { replace: true })"
    >
      <template #title>
        <div class="text-h2 my-2">
          {{ state.code }}
        </div>
      </template>
    </v-empty-state>
  </div>
</template>
