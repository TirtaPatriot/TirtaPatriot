<script lang="ts" setup>
  const items = [
    {
      color: 'red-lighten-2',
      icon: 'i-mdi:phone',
      title: 'HUBUNGI',
      caption: 'Silahkan hubungi Humas Perumda Tirta Patriot atau isi form online untuk informasi pendaftaran',
    },
    {
      color: 'purple-lighten-2',
      icon: 'i-mdi:book-variant',
      title: 'PENDAFTARAN',
      caption: 'Bawa semua berkas yang diperlukan ke Kantor / Unit Pelayanan Pelanggan (KPP / UPP) Tirta Patriot',
    },
    {
      color: 'green-lighten-1',
      icon: 'i-mdi:magnify-expand',
      title: 'SURVEI',
      caption: 'Petugas Tirta Patriot akan datang ke tempat tinggal Anda untuk melakukan survei',
    },
    {
      color: 'indigo-lighten-2',
      icon: 'i-mdi:wallet-outline',
      title: 'BAYAR',
      caption: 'Setelah mendapat surat persetujuan dari Tirta Patriot, segera datangi KPP / UPP untuk melakukan pembayaran',
    },
    {
      color: 'indigo-lighten-2',
      icon: 'i-mdi:water-pump',
      title: 'PASANG',
      caption: 'Petugas Tirta Patriot akan datang ke tempat tinggal Anda untuk memasang meter air',
    },
  ]
</script>

<template>
  <v-container fluid>
    <!-- <div class="text-h6 text-center mb-4">
      PROSES <strong>PEMASANGAN BARU</strong>
    </div> -->
    <v-timeline align="center" class="px-lg prereg-timeline prereg-timeline-desktop" direction="horizontal">
      <v-timeline-item
        v-for="(item, i) in items"
        :key="i"
        :dot-color="item.color"
        fill-dot
        :icon="item.icon"
      >
        <template #opposite>
          <div class="text-title">
            {{ i + 1 }}. {{ item.title }}
          </div>
        </template>

        <p class="text-body">
          {{ item.caption }}
        </p>
      </v-timeline-item>
    </v-timeline>

    <v-timeline class="prereg-timeline prereg-timeline-mobile" direction="vertical">
      <v-timeline-item
        v-for="(item, i) in items"
        :key="`mobile-${i}`"
        :dot-color="item.color"
        fill-dot
        :icon="item.icon"
      >
        <div class="text-title mb-2">
          {{ i + 1 }}. {{ item.title }}
        </div>
        <p class="text-body mb-0">
          {{ item.caption }}
        </p>
      </v-timeline-item>
    </v-timeline>
  </v-container>
</template>

<style scoped>
  .prereg-timeline-desktop {
    display: none;
  }

  .prereg-timeline-mobile {
    display: block;
  }

  @media (width >= 960px) {
    .prereg-timeline-desktop {
      display: block;
    }

    .prereg-timeline-mobile {
      display: none;
    }
  }
</style>
