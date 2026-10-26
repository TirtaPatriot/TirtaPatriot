<script lang="ts" setup>
  const items = [
    'Periksalah fasilitas air bersih yang terpasang di rumah, sebab kebocoran akan mempengaruhi besarnya rekening air setiap bulan',
    'Tempatkan meter air di lokasi yang aman dan mudah dibaca oleh petugas catat meter Perumda Tirta Patriot',
    'Sampaikanlah laporan jika terjadi kebocoran instalasi jaringan',
    'Penuhi kewajiban Anda sebagai pelanggan',
    'Mintalah bukti-bukti administrasi',
    'Untuk menghindari tagihan air yang melonjak, biarkan petugas kami membaca langsung meter air Anda',
  ]
</script>

<template>
  <div>
    <div class="d-flex align-center ga-3 mb-3">
      <v-avatar color="primary" size="40" variant="tonal">
        <v-icon icon="i-mdi:bullhorn-outline" size="22" />
      </v-avatar>

      <h2 class="text-title-large font-weight-bold">
        Himbauan untuk Pelanggan
      </h2>
    </div>

    <v-list bg-color="transparent" density="comfortable" lines="two">
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        class="px-0"
      >
        <template #prepend>
          <v-avatar class="mr-3" color="primary" size="28" variant="flat">
            <span class="text-body-small font-weight-bold">{{ i + 1 }}</span>
          </v-avatar>
        </template>

        <v-list-item-title class="text-body-large text-wrap">
          {{ item }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>
