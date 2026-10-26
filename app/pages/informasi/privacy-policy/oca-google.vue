<script lang="ts" setup>
  definePageMeta({
    title: 'Kebijakan Privasi Integrasi Google',
    alias: [
      '/privacy-policy/oca-google',
    ],
  })

  useSeoMeta({
    title: 'Kebijakan Privasi Integrasi Google - Perumda Tirta Patriot',
    description: 'Kebijakan Privasi akses data Google OAuth dan saluran email pada platform dukungan pelanggan OCA Perusahaan Umum Daerah Air Minum Tirta Patriot Kota Bekasi.',
    ogTitle: 'Kebijakan Privasi Integrasi Google - Perumda Tirta Patriot',
    ogDescription: 'Kebijakan Privasi akses data Google OAuth dan saluran email pada platform dukungan pelanggan OCA Perusahaan Umum Daerah Air Minum Tirta Patriot Kota Bekasi.',
  })

  const related = [
    { title: 'Persyaratan Layanan', to: '/informasi/privacy-policy/oca-google-tos' },
  ]
</script>

<template>
  <v-main>
    <PageHeader title="Kebijakan Privasi Integrasi Google" />

    <v-container class="prose py-8" max-width="960">
      <PLegalHeader
        badge="Google OAuth"
        effective="15 Desember 2025"
        :links="related"
        party="Perusahaan Umum Daerah Air Minum Tirta Patriot (Perumda Tirta Patriot)"
        party-label="Pengendali Data"
        subtitle="Integrasi Google OAuth pada platform dukungan pelanggan (OCA)"
        title="Kebijakan Privasi Aplikasi Tirta Patriot ID"
      />

      <section id="pendahuluan" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">Pendahuluan</h2>

        <p class="text-body-large text-justify mb-3">
          Kebijakan Privasi ini menjelaskan bagaimana Perusahaan Umum Daerah Air Minum Tirta Patriot (selanjutnya disebut <strong>"Kami"</strong>) mengumpulkan, menggunakan, dan melindungi informasi Anda sehubungan dengan integrasi kami dengan layanan email Google melalui platform dukungan pelanggan kami (OCA).
        </p>
      </section>

      <v-divider class="my-6" />

      <section id="data-yang-kami-kumpulkan-dan-tujuannya" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">1. Data yang Kami Kumpulkan dan Tujuannya</h2>
        <p class="text-body-large text-justify mb-3">Kami mengakses data Google Anda secara eksklusif untuk menyediakan fungsi saluran (channel) email pada platform dukungan pelanggan kami (OCA).</p>

        <h3 class="text-title-medium font-weight-bold mt-4 mb-2">1.1. Data Akun Google (Digunakan untuk SSO dan Identifikasi)</h3>

        <ul class="text-body-large pl-6 mb-3">
          <li class="mb-2"><strong>Data yang Dikumpulkan:</strong> Alamat email, nama, dan informasi profil dasar.</li>
          <li class="mb-2"><strong>Tujuan:</strong> Untuk mengautentikasi pengguna (Single Sign-On/SSO) dan mengidentifikasi agen atau administrator dalam sistem OCA.</li>
        </ul>

        <h3 class="text-title-medium font-weight-bold mt-4 mb-2">1.2. Data Gmail (Digunakan untuk Saluran Email)</h3>

        <p class="text-body-large text-justify mb-3">
          Aplikasi kami menggunakan Google API Services untuk mengaktifkan fungsi Saluran Email. Penggunaan data yang diterima dari Google API akan mematuhi
          <a class="text-primary" href="https://developers.google.com/terms/api-services-user-data-policy" rel="noopener noreferrer" target="_blank">Google API Services User Data Policy</a>,
          termasuk Persyaratan Penggunaan Batasan (Limited Use Requirements).
        </p>

        <ul class="text-body-large pl-6 mb-3">
          <li class="mb-2"><strong>Data yang Dikumpulkan:</strong> Kami mengakses, membaca, menulis, mengirim, dan menghapus email dari kotak masuk (inbox) yang telah Anda hubungkan sebagai saluran dukungan pelanggan di OCA.</li>

          <li class="mb-2">
            <strong>Tujuan:</strong>
            Data ini digunakan secara ketat untuk:
            <ul class="text-body-large pl-6 mb-3">
              <li class="mb-2">Mengubah email masuk menjadi "Percakapan" atau "Tiket" dukungan pelanggan di OCA.</li>
              <li class="mb-2">Memungkinkan agen dukungan pelanggan kami untuk membalas email keluar langsung dari antarmuka OCA.</li>
              <li class="mb-2">Mengelola utas percakapan (threading) dan status tiket dukungan pelanggan.</li>
            </ul>
          </li>

          <li class="mb-2"><strong>Batasan Penggunaan:</strong> Kami hanya memproses email yang masuk ke alamat email yang secara eksplisit dikonfigurasi sebagai saluran layanan pelanggan oleh Anda. Kami tidak mengakses atau memproses email pribadi Anda.</li>
        </ul>
      </section>

      <section id="penggunaan-batasan-limited-use-data-gmail" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">2. Penggunaan Batasan (Limited Use) Data Gmail</h2>
        <p class="text-body-large text-justify mb-3">Meskipun kami memiliki akses ke <code>https://mail.google.com/</code>, penggunaan dan transfer kami atas informasi yang diterima dari Google API Services tunduk pada:</p>

        <ul class="text-body-large pl-6 mb-3">
          <li class="mb-2">Penggunaan internal untuk menyediakan atau meningkatkan fitur yang relevan dengan pengguna aplikasi.</li>
          <li class="mb-2">Keamanan pengguna (misalnya, menyelidiki penyalahgunaan).</li>
          <li class="mb-2">Kepatuhan terhadap hukum yang berlaku.</li>
          <li class="mb-2">Transfer ke pihak lain hanya jika diperlukan untuk menyediakan layanan (misalnya, ke server OCA untuk pemrosesan tiket) dan dengan persetujuan pengguna.</li>
        </ul>

        <p class="text-body-large text-justify mb-3"><strong>Kami tidak akan menjual atau membagikan data ini untuk tujuan periklanan atau pemasaran.</strong></p>
      </section>

      <section id="keamanan-data" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">3. Keamanan Data</h2>

        <p class="text-body-large text-justify mb-3">
          Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi informasi yang kami kumpulkan dari akses, pengungkapan, perubahan, atau penghancuran yang tidak sah. Data email disimpan di server yang aman di Jawa Barat, Indonesia dan akses dibatasi hanya untuk agen dukungan yang berwenang.
        </p>
      </section>

      <section id="pengungkapan-kepada-pihak-ketiga" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">4. Pengungkapan Kepada Pihak Ketiga</h2>
        <p class="text-body-large text-justify mb-3">Kami tidak akan membagikan, menyewakan, atau menjual informasi email Anda kepada pihak ketiga mana pun kecuali dalam keadaan berikut:</p>

        <ul class="text-body-large pl-6 mb-3">
          <li class="mb-2">Dengan persetujuan eksplisit Anda.</li>
          <li class="mb-2">Untuk mematuhi kewajiban hukum atau peraturan.</li>
          <li class="mb-2">Kepada penyedia layanan pihak ketiga (seperti vendor hosting OCA) yang hanya memproses data atas nama kami.</li>
        </ul>
      </section>

      <section id="kontrol-dan-retensi-data" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">5. Kontrol dan Retensi Data</h2>

        <p class="text-body-large text-justify mb-3">
          Anda dapat mengontrol data yang kami akses dengan mencabut izin integrasi Google kapan saja melalui pengaturan akun Google Anda atau dengan menghapus saluran email dari pengaturan OCA Anda. Kami akan menyimpan data email selama akun OCA Anda aktif atau selama diperlukan untuk memenuhi tujuan yang diuraikan dalam Kebijakan Privasi ini.
        </p>
      </section>

      <section id="perubahan-kebijakan-privasi" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">6. Perubahan Kebijakan Privasi</h2>

        <p class="text-body-large text-justify mb-3">
          Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Jika Kami melakukan perubahan materi (substansial), Kami akan memberitahu Anda melalui email, notifikasi di platform, atau dengan memposting Kebijakan Privasi yang direvisi di halaman ini, sebelum perubahan tersebut efektif. Kami mendorong Anda untuk meninjau Kebijakan Privasi ini secara berkala.
        </p>
      </section>

      <section id="hubungi-kami" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">7. Hubungi Kami</h2>
        <p class="text-body-large text-justify mb-3">Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di:</p>

        <ul class="text-body-large pl-6 mb-3">
          <li class="mb-2"><strong>Email:</strong> <a class="text-primary" href="mailto:sekretariat@tirtapatriot.co.id">sekretariat@tirtapatriot.co.id</a></li>
          <li class="mb-2"><strong>Alamat:</strong> Jl. Perjuangan No.99, RT.003/RW.011, Marga Mulya, Kec. Bekasi Utara, Kota Bekasi, Jawa Barat 17142</li>
        </ul>
      </section>

      <p class="text-body-small text-right text-medium-emphasis mt-6">
        Terakhir Diperbarui: 15 Desember 2025
      </p>
    </v-container>
  </v-main>
</template>
