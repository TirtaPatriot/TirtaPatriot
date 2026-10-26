<script lang="ts" setup>
  definePageMeta({
    title: 'Persyaratan Layanan Integrasi Google - CRM',
    alias: [
      '/terms-of-service/oca-google',
    ],
  })

  useSeoMeta({
    title: 'Persyaratan Layanan Integrasi Google - Perumda Tirta Patriot',
    description: 'Syarat dan ketentuan penggunaan platform dukungan pelanggan (CRM) OCA yang terintegrasi dengan Google OAuth, Perusahaan Umum Daerah Air Minum Tirta Patriot Kota Bekasi.',
    ogTitle: 'Persyaratan Layanan Integrasi Google - Perumda Tirta Patriot',
    ogDescription: 'Syarat dan ketentuan penggunaan platform dukungan pelanggan (CRM) OCA yang terintegrasi dengan Google OAuth, Perusahaan Umum Daerah Air Minum Tirta Patriot Kota Bekasi.',
  })

  const related = [
    { title: 'Kebijakan Privasi', to: '/informasi/privacy-policy/oca-google' },
  ]
</script>

<template>
  <v-main>
    <PageHeader title="Persyaratan Layanan Integrasi Google" />

    <v-container class="py-8" max-width="960">
      <PLegalHeader
        badge="CRM OCA"
        effective="15 Desember 2025"
        :links="related"
        party="Perusahaan Umum Daerah Air Minum Tirta Patriot (Perumda Tirta Patriot)"
        party-label="Penyedia Layanan"
        subtitle="Platform dukungan pelanggan (CRM) OCA terintegrasi Google"
        title="Persyaratan Layanan Aplikasi Tirta Patriot ID"
      />

      <section id="pendahuluan" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">Pengantar</h2>

        <p class="text-body-large text-justify mb-3">
          Ketentuan Layanan ini menetapkan syarat dan ketentuan yang mengikat antara Anda (selanjutnya disebut <strong>"Pengguna"</strong>) dan Perusahaan Umum Daerah Air Minum Tirta Patriot (selanjutnya disebut <strong>"Kami"</strong>) terkait penggunaan layanan, fitur, dan platform dukungan pelanggan digital kami (OCA). Dokumen ini menjelaskan hak dan kewajiban Pengguna, aturan penggunaan platform, batasan tanggung jawab Kami, serta prosedur penyelesaian sengketa, memastikan lingkungan yang adil dan aman bagi semua pengguna layanan kami.
        </p>
      </section>

      <v-divider class="my-6" />

      <section id="penerimaan-persyaratan" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">1. Penerimaan Persyaratan</h2>

        <p class="text-body-large text-justify mb-3">
          Selamat datang di layanan Perusahaan Umum Daerah Air Minum Tirta Patriot ("Kami," "Layanan," atau "Aplikasi"). Layanan yang kami sediakan melalui platform OCA di <code>omni.app.tirtapatriot.com</code> diatur oleh Persyaratan Layanan (<strong>"Persyaratan"</strong>) ini. Dengan mengakses atau menggunakan Layanan, Anda setuju untuk terikat oleh Persyaratan ini.
        </p>
      </section>

      <section id="deskripsi-layanan" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">2. Deskripsi Layanan</h2>

        <p class="text-body-large text-justify mb-3">
          Kami menyediakan platform manajemen hubungan pelanggan (Customer Relationship Management/CRM) dan dukungan pelanggan melalui OCA, yang memungkinkan Anda mengelola komunikasi dengan pelanggan melalui berbagai saluran, termasuk email, yang terintegrasi melalui Google OAuth.
        </p>
      </section>

      <section id="akun-pengguna" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">3. Akun Pengguna</h2>

        <ul class="text-body-large pl-6 mb-3">
          <li class="mb-2">Anda harus memberikan informasi yang akurat dan lengkap saat membuat akun.</li>
          <li class="mb-2">Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi dan aktivitas yang terjadi di bawah akun Anda.</li>
          <li class="mb-2">Anda dilarang membagikan detail akun Anda kepada pihak lain.</li>
        </ul>
      </section>

      <section id="integrasi-pihak-ketiga-google-oauth" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">4. Integrasi Pihak Ketiga (Google OAuth)</h2>
        <p class="text-body-large text-justify mb-3">Layanan ini memungkinkan Anda mengintegrasikan akun Google Anda (termasuk Gmail) melalui Google OAuth untuk fungsi <em>Sign-In</em> dan Saluran Email.</p>

        <ul class="text-body-large pl-6 mb-3">
          <li class="mb-2">Dengan menggunakan integrasi ini, Anda mengizinkan kami untuk mengakses informasi Anda sesuai dengan <NuxtLink class="text-primary" to="/informasi/privacy-policy/oca-google">Kebijakan Privasi</NuxtLink> kami.</li>
          <li class="mb-2">Anda bertanggung jawab penuh atas konfigurasi dan izin yang Anda berikan kepada Google.</li>
          <li class="mb-2">Kami tidak bertanggung jawab atas kegagalan layanan Google atau perubahan kebijakan Google yang memengaruhi integrasi.</li>
        </ul>
      </section>

      <section id="kewajiban-pengguna" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">5. Kewajiban Pengguna</h2>
        <p class="text-body-large text-justify mb-3">Anda setuju untuk tidak:</p>

        <ul class="text-body-large pl-6 mb-3">
          <li class="mb-2">Menggunakan Layanan untuk mengirim spam, materi berbahaya, atau konten ilegal.</li>
          <li class="mb-2">Melanggar hukum yang berlaku atau hak pihak ketiga.</li>
          <li class="mb-2">Mengganggu atau merusak integritas atau kinerja Layanan.</li>
        </ul>
      </section>

      <section id="penghentian" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">6. Penghentian</h2>

        <p class="text-body-large text-justify mb-3">
          Kami dapat menangguhkan atau menghentikan akses Anda ke Layanan kapan saja, tanpa pemberitahuan atau kewajiban, jika Anda melanggar Persyaratan ini.
        </p>
      </section>

      <section id="penolakan-jaminan" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">7. Penolakan Jaminan</h2>

        <p class="text-body-large text-justify mb-3">
          Layanan disediakan atas dasar <strong>"sebagaimana adanya"</strong> dan <strong>"sebagaimana tersedia"</strong> tanpa jaminan apa pun, baik tersurat maupun tersirat, termasuk, tetapi tidak terbatas pada, jaminan tersirat tentang kelayakan jual, kesesuaian untuk tujuan tertentu, dan non-pelanggaran.
        </p>
      </section>

      <section id="pembatasan-kewajiban" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">8. Pembatasan Kewajiban</h2>

        <p class="text-body-large text-justify mb-3">
          Sejauh diizinkan oleh hukum, Perusahaan Umum Daerah Air Minum Tirta Patriot tidak akan bertanggung jawab atas kerusakan tidak langsung, insidental, khusus, konsekuensial, atau hukuman, termasuk, namun tidak terbatas pada, kerugian keuntungan, data, atau penggunaan, yang timbul dari akses atau penggunaan Anda terhadap Layanan.
        </p>
      </section>

      <section id="hukum-yang-mengatur" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">9. Hukum yang Mengatur</h2>

        <p class="text-body-large text-justify mb-3">
          Persyaratan ini diatur dan ditafsirkan sesuai dengan hukum Indonesia, tanpa memperhatikan pertentangan prinsip hukumnya.
        </p>
      </section>

      <section id="perubahan-persyaratan" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">10. Perubahan Persyaratan</h2>

        <p class="text-body-large text-justify mb-3">
          Kami berhak, atas kebijakan tunggal kami, untuk mengubah atau mengganti Persyaratan ini kapan saja. Kami akan berusaha memberikan pemberitahuan setidaknya 30 hari sebelum Persyaratan baru mulai berlaku.
        </p>
      </section>

      <section id="hubungi-kami" class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-2">11. Hubungi Kami</h2>
        <p class="text-body-large text-justify mb-3">Jika Anda memiliki pertanyaan tentang Persyaratan ini, silakan hubungi kami di:</p>

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
