<script lang="ts" setup>
definePageMeta({
  title: 'Persyaratan Layanan Integrasi Google - CRM',
})
</script>

<template>
  <v-main>
    <PageHeader title="Persyaratan Layanan" />

    <v-container class="prose">
      <h1>Kebijakan Privasi Perusahaan Umum Daerah Air Minum Tirta Patriot (OCA)</h1>
      <p><em>Kebijakan Privasi ini efektif berlaku sejak 15 Desember 2025</em></p>

      <section id="pendahuluan">
        <h2>Pendahuluan</h2>
        <p>
          Kebijakan Privasi ini menjelaskan bagaimana Perusahaan Umum Daerah Air Minum Tirta Patriot (selanjutnya disebut **"Kami"** atau **"Perusahaan"**) mengumpulkan, menggunakan, dan melindungi informasi Anda sehubungan dengan layanan kami melalui platform dukungan pelanggan (OCA), khususnya yang terkait dengan **integrasi Google OAuth** (melalui layanan email Google).
        </p>
        <p>
          Kami berkomitmen untuk melindungi privasi Anda dan menjaga kerahasiaan informasi yang kami akses.
        </p>
      </section>

      <hr>

      <section id="pengumpulan-data">
        <h2>1. Informasi yang Kami Kumpulkan dan Akses</h2>
        <p>
          Melalui integrasi Google OAuth, kami dapat mengakses informasi berikut dari akun Google Anda, yang digunakan semata-mata untuk tujuan penyediaan dan pengoperasian fitur dukungan pelanggan (Saluran Email):
        </p>
        <table>
          <thead>
            <tr>
              <th>Jenis Data</th>
              <th>Tujuan Pengumpulan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Informasi Dasar Akun (Sign-In)</strong></td>
              <td>Untuk mengidentifikasi Anda sebagai Pengguna Layanan dan memfasilitasi proses <em>Sign-In</em> (meliputi nama dan alamat email utama).</td>
            </tr>
            <tr>
              <td><strong>Data Saluran Email (Gmail API)</strong></td>
              <td>Untuk memungkinkan platform kami (OCA) mengirim dan menerima email layanan pelanggan melalui akun Gmail yang Anda integrasikan. Ini meliputi akses ke <strong>metadata pesan</strong> (header, pengirim, penerima), <strong>badan pesan</strong>, dan <strong>lampiran</strong> yang relevan dengan komunikasi dukungan pelanggan yang sedang ditangani dalam sistem OCA.</td>
            </tr>
          </tbody>
        </table>

        <h3>Catatan Khusus Penggunaan Data Gmail:</h3>
        <blockquote>
          <p>
            <strong>Kami tidak akan mentransfer atau menjual data pengguna Gmail Anda kepada pihak ketiga. Akses dan penggunaan data yang diperoleh dari Google API akan tetap mematuhi Google API Services User Data Policy, termasuk persyaratan penggunaan terbatas.</strong>
          </p>
        </blockquote>
      </section>

      <section id="penggunaan-data">
        <h2>2. Bagaimana Kami Menggunakan Informasi Anda</h2>
        <p>
          Informasi yang kami akses dari integrasi Google OAuth digunakan secara eksklusif untuk tujuan-tujuan berikut:
        </p>
        <ul>
          <li><strong>Penyediaan Layanan Inti:</strong> Mengaktifkan dan mengelola saluran komunikasi email Anda dalam platform OCA, memungkinkan Anda untuk berinteraksi dengan pelanggan secara efisien.</li>
          <li><strong>Dukungan Pelanggan:</strong> Menganalisis riwayat komunikasi (email) untuk memberikan jawaban yang akurat dan dukungan yang relevan kepada pelanggan Anda.</li>
          <li><strong>Keamanan dan Audit:</strong> Memastikan kepatuhan terhadap kebijakan internal dan eksternal, serta melakukan audit keamanan sistem.</li>
        </ul>
      </section>

      <section id="pembagian-data">
        <h2>3. Pembagian dan Pengungkapan Informasi</h2>
        <p>
          Kami tidak akan membagikan, menjual, atau menyewakan informasi pribadi Anda (termasuk konten email) kepada pihak ketiga, kecuali dalam kondisi berikut:
        </p>
        <ul>
          <li><strong>Penyedia Layanan:</strong> Kepada pihak ketiga yang bekerja atas nama kami (seperti penyedia <em>hosting</em> atau teknisi pemeliharaan sistem), yang terikat oleh perjanjian kerahasiaan ketat untuk tujuan memproses data atas instruksi kami.</li>
          <li><strong>Kewajiban Hukum:</strong> Jika diharuskan oleh hukum, perintah pengadilan, atau otoritas pemerintah yang berwenang.</li>
        </ul>
      </section>

      <section id="perlindungan-data">
        <h2>4. Perlindungan Data</h2>
        <p>
          Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang wajar untuk melindungi data yang kami akses dari akses tidak sah, pengungkapan, perubahan, atau penghancuran. Ini termasuk enkripsi data, kontrol akses yang ketat, dan protokol keamanan yang dirancang untuk melindungi informasi sensitif, khususnya data yang diakses melalui Gmail API.
        </p>
      </section>

      <section id="retensi-data">
        <h2>5. Retensi Data</h2>
        <p>
          Kami akan menyimpan informasi Anda selama akun Anda aktif atau selama diperlukan untuk menyediakan Layanan. Setelah akun Anda dihentikan, kami akan menghapus atau menganonimkan data Anda sesuai dengan kebijakan retensi internal kami dan persyaratan hukum yang berlaku.
        </p>
      </section>

      <section id="persetujuan">
        <h2>6. Pilihan dan Persetujuan Anda (Opt-In)</h2>
        <p>
          Integrasi layanan Google adalah **opsional**. Dengan menghubungkan akun Google Anda (melalui <em>Sign-In</em> atau Saluran Email), Anda memberikan persetujuan eksplisit kepada Kami untuk memproses data Anda sesuai dengan Kebijakan Privasi ini. Anda memiliki hak untuk mencabut akses ini kapan saja dengan memutuskan koneksi layanan Google melalui pengaturan akun Anda.
        </p>
      </section>

      <section id="kontak">
        <h2>7. Hubungi Kami</h2>
        <p>
          Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau praktik data kami, silakan hubungi kami di:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:sekretariat@tirtapatriot.co.id">sekretariat@tirtapatriot.co.id</a></li>
          <li><strong>Alamat:</strong> Jl. Perjuangan No.99, RT.003/RW.011, Marga Mulya, Kec. Bekasi Utara, Kota Bekasi, Jawa Barat 17142</li>
        </ul>
      </section>

      <p style="text-align: right; font-size: small;">
        Terakhir Diperbarui: 15 Desember 2025
      </p>
    </v-container>
  </v-main>
</template>
