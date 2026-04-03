<script lang="ts" setup>
  const route = useRoute()
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  await navigateTo(`/pelanggan/pengaduan?tiket=${id ?? ''}`, { replace: true })
</script>
