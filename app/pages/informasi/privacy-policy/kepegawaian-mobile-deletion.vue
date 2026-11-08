<script lang="ts" setup>
  definePageMeta({
    title: 'Instruksi Penghapusan Data Pengguna Aplikasi Kepegawaian Mobile',
    alias: [
      '/kepegawaian/hapus-data',
      '/informasi/privacy-policy/kepegawaian-mobile-deletion',
    ],
  })

  useSeoMeta({
    title: 'Penghapusan Data Pengguna Kepegawaian Mobile - Perumda Tirta Patriot',
    description: 'Panduan dan instruksi resmi permohonan penghapusan data pengguna (User Data Deletion Instructions) aplikasi Kepegawaian Mobile Perumda Tirta Patriot Kota Bekasi di Google Play.',
    ogTitle: 'Penghapusan Data Pengguna Kepegawaian Mobile - Perumda Tirta Patriot',
    ogDescription: 'Panduan resmi permohonan penghapusan data pengguna aplikasi Kepegawaian Mobile Perumda Tirta Patriot.',
  })

  const emailSubject = encodeURIComponent('Permohonan Penghapusan Data Kepegawaian Mobile')
  const emailBody = encodeURIComponent([
    'Halo Admin Perumda Tirta Patriot,',
    '',
    'Saya ingin meminta penghapusan data saya pada aplikasi Kepegawaian Mobile.',
    'Nama Lengkap: ',
    'NIP / Nomor Pegawai: ',
    'Unit Kerja: ',
    'Data yang ingin dihapus: ',
    '',
    'Terima kasih.',
  ].join('\n'))
  const mailtoHref = `mailto:sekretariat@tirtapatriot.co.id?subject=${emailSubject}&body=${emailBody}`
</script>

<template>
  <v-main>
    <PageHeader title="Penghapusan Data Pengguna" />

    <v-container class="py-8" max-width="960">
      <div class="d-flex flex-wrap justify-space-between align-center mb-4">
        <div>
          <h1 class="text-headline-medium font-weight-bold text-primary mb-2">
            Instruksi Penghapusan Data Pengguna (User Data Deletion)
          </h1>

          <p class="text-title-medium text-medium-emphasis">
            Aplikasi Kepegawaian Mobile Perumda Tirta Patriot Kota Bekasi
          </p>
        </div>

        <v-chip color="primary" variant="tonal">
          Google Play Data Safety
        </v-chip>
      </div>

      <v-card class="mb-6 pa-4 bg-grey-lighten-4" flat rounded="lg">
        <p class="text-body-medium mb-1">
          <strong>Aplikasi:</strong> Kepegawaian Mobile &mdash; dikembangkan oleh Perumda Tirta Patriot Kota Bekasi
        </p>

        <p class="text-body-medium mb-0">
          Sesuai dengan kebijakan Google Play dan Undang-Undang Pelindungan Data Pribadi (UU PDP No. 27/2022), pegawai pengguna aplikasi Kepegawaian Mobile berhak meminta penghapusan data pribadi yang dikumpulkan melalui aplikasi ini.
        </p>
      </v-card>

      <section class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-3">
          1. Data Apa Saja yang Dapat Dihapus?
        </h2>

        <p class="text-body-large text-justify mb-2">
          Permohonan penghapusan data yang diproses meliputi:
        </p>

        <ul class="text-body-large pl-6 mb-3">
          <li>ID perangkat (Device ID) yang terdaftar sebagai perangkat presensi akun Anda.</li>
          <li>Token notifikasi (Firebase Cloud Messaging) yang terhubung dengan perangkat Anda.</li>
          <li>Data sesi login dan informasi perangkat yang tersimpan untuk keperluan keamanan akun.</li>
          <li>Foto profil dan berkas yang Anda unggah melalui aplikasi di luar keperluan arsip kepegawaian.</li>
        </ul>

        <v-alert class="my-3" color="warning" icon="i-mdi:alert" variant="tonal">
          <strong>Data yang Tetap Disimpan:</strong> Data induk kepegawaian, rekap presensi (termasuk waktu, foto, dan koordinat lokasi presensi), data cuti/izin, serta data penggajian tetap disimpan dalam sistem kepegawaian inti sesuai dengan kewajiban kearsipan, audit, dan regulasi BUMD yang berlaku. Data tersebut dikelola sesuai masa retensi arsip yang ditetapkan perusahaan.
        </v-alert>
      </section>

      <v-divider class="my-6" />

      <section class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-3">
          2. Cara Mengajukan Permohonan Penghapusan Data
        </h2>

        <v-card class="pa-4 mb-4" elevation="2" rounded="lg">
          <div class="d-flex align-center mb-2">
            <v-icon class="mr-2" color="primary" icon="i-mdi:email" size="28" />

            <h3 class="text-title-medium font-weight-bold">
              Melalui Email Resmi
            </h3>
          </div>

          <p class="text-body-medium mb-3">
            Kirimkan surat permohonan melalui email terdaftar:
          </p>

          <ul class="text-body-medium pl-4 mb-3">
            <li><strong>Kepada:</strong> <a class="text-primary" href="mailto:sekretariat@tirtapatriot.co.id">sekretariat@tirtapatriot.co.id</a></li>
            <li><strong>Subjek:</strong> Permohonan Penghapusan Data Kepegawaian Mobile - [NIP Anda]</li>
            <li><strong>Isi:</strong> Cantumkan nama lengkap, NIP/nomor pegawai, unit kerja, dan data yang ingin dihapus.</li>
          </ul>

          <v-btn
            block
            color="primary"
            :href="mailtoHref"
            prepend-icon="i-mdi:email"
            variant="tonal"
          >
            Kirim Permintaan via Email
          </v-btn>
        </v-card>

        <p class="text-body-medium text-medium-emphasis">
          Pegawai juga dapat mengajukan permohonan secara langsung ke bagian Sumber Daya Manusia (SDM) Perumda Tirta Patriot.
        </p>
      </section>

      <v-divider class="my-6" />

      <section class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-3">
          3. Proses dan Waktu Pelaksanaan
        </h2>

        <p class="text-body-large text-justify mb-2">
          Setelah permohonan diterima:
        </p>

        <ul class="text-body-large pl-6 mb-3">
          <li class="mb-2">
            <strong>Verifikasi Identitas (1-2 hari kerja):</strong> Tim kami memverifikasi bahwa pemohon adalah pemilik akun pegawai yang bersangkutan.
          </li>

          <li class="mb-2">
            <strong>Penghapusan Data (3-5 hari kerja):</strong> Sistem menghapus ID perangkat, token notifikasi, dan data perangkat lainnya dari akun Anda.
          </li>

          <li class="mb-2">
            <strong>Konfirmasi Akhir:</strong> Kami akan mengirimkan konfirmasi tertulis bahwa data yang diminta telah berhasil dihapus.
          </li>
        </ul>

        <p class="text-body-medium text-medium-emphasis">
          Total waktu pemrosesan penghapusan data maksimal <strong>7 (tujuh) hari kerja</strong> sejak permohonan diverifikasi.
        </p>
      </section>

      <v-divider class="my-6" />

      <section class="mb-6">
        <h2 class="text-title-large font-weight-bold mb-3">
          4. Pertanyaan dan Bantuan
        </h2>

        <p class="text-body-large mb-3">
          Jika Anda memiliki pertanyaan mengenai proses penghapusan data atau status permohonan Anda, silakan hubungi kontak resmi kami:
        </p>

        <p class="text-body-medium mb-1">
          <strong>Perumda Tirta Patriot Kota Bekasi</strong><br>
          Jl. Perjuangan No. 99, Marga Mulya, Kec. Bekasi Utara, Kota Bekasi, Jawa Barat 17142<br>
          Telepon: (021) 8896-6161<br>
          Email: <a class="text-primary text-decoration-none" href="mailto:sekretariat@tirtapatriot.co.id">sekretariat@tirtapatriot.co.id</a>
        </p>
      </section>

      <v-divider class="my-6" />

      <div class="d-flex flex-wrap ga-2 justify-space-between align-center">
        <NuxtLink class="text-primary text-decoration-none font-weight-medium" to="/informasi/privacy-policy">
          ← Kembali ke Pusat Kebijakan Privasi
        </NuxtLink>
      </div>
    </v-container>
  </v-main>
</template>
