<script lang="ts" setup>
  const route = useRoute()
  await navigateTo(`/pelanggan/pengaduan?tiket=${route.params.id}`, { redirectCode: 301, replace: true })
</script>
