<script lang="ts" setup>
  const items = [
    {
      icon: 'i-mdi:phone',
      title: 'Hubungi',
      caption: 'Silakan hubungi Humas Perumda Tirta Patriot atau isi form online untuk informasi pendaftaran',
    },
    {
      icon: 'i-mdi:book-variant',
      title: 'Pendaftaran',
      caption: 'Bawa semua berkas yang diperlukan ke Kantor / Unit Pelayanan Pelanggan (KPP / UPP) Tirta Patriot',
    },
    {
      icon: 'i-mdi:magnify-expand',
      title: 'Survei',
      caption: 'Petugas Tirta Patriot akan datang ke tempat tinggal Anda untuk melakukan survei',
    },
    {
      icon: 'i-mdi:wallet-outline',
      title: 'Bayar',
      caption: 'Setelah mendapat surat persetujuan dari Tirta Patriot, segera datangi KPP / UPP untuk melakukan pembayaran',
    },
    {
      icon: 'i-mdi:water-pump',
      title: 'Pasang',
      caption: 'Petugas Tirta Patriot akan datang ke tempat tinggal Anda untuk memasang meter air',
    },
  ]
</script>

<template>
  <v-timeline align="start" density="comfortable" side="end">
    <v-timeline-item
      v-for="(item, i) in items"
      :key="i"
      dot-color="primary"
      fill-dot
      :icon="item.icon"
    >
      <v-card rounded="xl" variant="outlined">
        <v-card-item>
          <template #prepend>
            <v-chip color="primary" size="small" variant="tonal">
              Langkah {{ i + 1 }}
            </v-chip>
          </template>

          <v-card-title class="text-title-large font-weight-bold">
            {{ item.title }}
          </v-card-title>
        </v-card-item>

        <v-card-text class="text-body-large pt-0">
          {{ item.caption }}
        </v-card-text>
      </v-card>
    </v-timeline-item>
  </v-timeline>
</template>
