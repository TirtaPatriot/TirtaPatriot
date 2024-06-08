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

const { mdAndDown } = useDisplay()
</script>

<template>
  <v-container fluid>
    <!-- <div class="text-h6 text-center mb-4">
      PROSES <strong>PEMASANGAN BARU</strong>
    </div> -->
    <v-timeline align="center" :direction="mdAndDown ? 'vertical' : 'horizontal'" class="px-lg">
      <v-timeline-item
        v-for="(item, i) in items"
        :key="i"
        :dot-color="item.color"
        :icon="item.icon"
        fill-dot
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
  </v-container>
</template>

<style>

</style>
