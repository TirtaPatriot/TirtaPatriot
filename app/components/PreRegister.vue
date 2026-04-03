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
    <v-timeline align="start" side="start">
      <v-timeline-item
        v-for="(item, i) in items"
        :key="i"
        :dot-color="item.color"
        fill-dot
        :icon="item.icon"
      >
        <v-card>
          <v-card-title :class="['text-title-large', `bg-${item.color}`]">
            {{ i + 1 }}. {{ item.title }}
          </v-card-title>
          <v-card-text class="bg-white text--primary">
            <p>{{ item.caption }}</p>
            <!-- <v-btn
              :color="item.color"
              variant="outlined"
            >
              Button
            </v-btn> -->
          </v-card-text>
        </v-card>
      </v-timeline-item>
    </v-timeline>
  </v-container>
</template>
