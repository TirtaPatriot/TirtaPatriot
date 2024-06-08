<script lang="ts" setup>
const { getSingletonItem } = useDirectusItems()
const { data } = await useAsyncData<any>('content.visi', () => {
  return getSingletonItem({ collection: 'visi' })
})
</script>

<template>
  <v-main>
    <PageHeader title="Visi dan Misi" />
    <v-container class="prose">
      <!-- <h2 class="text-h4 font-weight-light my-4">
        Visi
      </h2>
      <blockquote class="blockquote">
        Menjadi perusahaan yang menyediakan pelayanan air bersih yang sehat dan aman bagi masyarakat Kota Bekasi melalui jaringan perpipaan Perumda Tirta Patriot Kota Bekasi
      </blockquote>
      <h2 class="text-h4 font-weight-light my-4">
        Misi
      </h2> -->
      <article v-html="data?.isi" />
      <!-- <div class="text-body-1 font-weight-light ml-6">
        <ul>
          <li>Melakukan Optimalisasi Pelayanan Eksisting dalam rangka Peningkatan Kualitas, Kuantitas, Kontinuitas dan Tekanan Air demi tercapainya Kepuasan Pelanggan;</li>
          <li>⁠⁠Melakukan Perluasan dan Pengembangan Pelayanan Air Minum di Wilayah Baru yang Belum Ada Jaringan Perpipaan Perumda, Belum Terlayani Namun Sudah Ada Jaringan Perpipaan Perumda dan Demand Masyarakat untuk Menjadi Pelanggan Perumda Tergolong Agresif/Tinggi;</li>
          <li>⁠Melakukan Optimalisasi dan Perbaikan Pelayanan atas Terima Aset PDAM Tirta Bhagasasi yang ada di Kota Bekasi dan diserahkan pengelolaan/pelayanannya kepada Perumda Tirta Patriot.</li>
          <li>⁠Melakukan Kerjasama dengan Badan Usaha lainnya (BUMD/BUMN/Badan Usaha Swasta) dalam Bentuk Kerjasama Investasi dan Operasional (Bangun, Kelola dan Alih Milik Aset) dan/atau Perolehan Pembiayaan dari Pinjaman Bank dan/atau dapat Membentuk Anak Perusahaan dalam rangka Mewujudkan Investasi Pengembangan Pelayanan Ketersediaan Infrastruktur Air Bersih/Air Minum di Kota Bekasi;</li>
          <li>⁠Menyediakan Pelayanan Cepat dan Mudah Bagi Pelanggan melalui Penerapan Pengaduan Pelayanan One Day Service;</li>
          <li>⁠Meningkatkan Efisiensi Operasional dan Penurunan Tingkat Kehilangan Air agar Tercapai Pemanfaatan Kapasitas Produksi yang Optimal; dan</li>
          <li>⁠Meningkatkan Profesionalisme Pelayanan Pelanggan</li>
        </ul>
      </div> -->
    </v-container>
  </v-main>
</template>

<style>

</style>
