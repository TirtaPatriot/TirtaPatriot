<script lang="ts" setup>
  definePageMeta({
    title: 'Kebijakan Privasi dan Ketentuan Layanan',
  })

  useSeoMeta({
    title: 'Kebijakan Privasi & Ketentuan Layanan - Perumda Tirta Patriot',
    description: 'Pusat Kebijakan Privasi, Ketentuan Layanan (TOS), dan Panduan Pelindungan Data Pengguna Perusahaan Umum Daerah Air Minum Tirta Patriot Kota Bekasi.',
  })

  const legalDocs = [
    {
      category: 'Layanan WhatsApp Business & Meta App',
      description: 'Dokumen legalitas dan privasi untuk penggunaan saluran perpesanan resmi WhatsApp Business Perumda Tirta Patriot.',
      color: 'green',
      icon: 'i-mdi:whatsapp',
      items: [
        {
          title: 'Kebijakan Privasi (Privacy Policy)',
          subtitle: 'Pengelolaan, pengumpulan, dan pelindungan data pengguna WhatsApp',
          to: '/informasi/privacy-policy/whatsapp-business',
          badge: 'Meta / Facebook App',
        },
        {
          title: 'Syarat & Ketentuan Layanan (Terms of Service)',
          subtitle: 'Aturan hak, kewajiban, dan batasan penggunaan saluran WhatsApp',
          to: '/informasi/privacy-policy/whatsapp-business-tos',
          badge: 'TOS',
        },
        {
          title: 'Instruksi Penghapusan Data (Data Deletion Instructions)',
          subtitle: 'Tata cara permohonan penghapusan riwayat data pengguna WhatsApp',
          to: '/informasi/privacy-policy/whatsapp-business-deletion',
          badge: 'User Data Deletion',
        },
      ],
    },
    {
      category: 'Layanan Integrasi Google (CRM / OCA)',
      description: 'Ketentuan dan privasi penggunaan integrasi Google OAuth pada sistem CRM dukungan pelanggan OCA.',
      color: 'primary',
      icon: 'i-mdi:google',
      items: [
        {
          title: 'Kebijakan Privasi Integrasi Google',
          subtitle: 'Kebijakan privasi akses data Google OAuth dan saluran email',
          to: '/informasi/privacy-policy/oca-google',
          badge: 'Google OAuth',
        },
        {
          title: 'Persyaratan Layanan Integrasi Google - CRM',
          subtitle: 'Syarat dan ketentuan pemanfaatan CRM OCA terintegrasi',
          to: '/informasi/privacy-policy/oca-google-tos',
          badge: 'CRM TOS',
        },
      ],
    },
  ]
</script>

<template>
  <v-main>
    <PageHeader title="Kebijakan Privasi & Ketentuan Layanan" />

    <v-container class="prose py-8">
      <div class="mb-6">
        <h1 class="text-h4 font-weight-bold text-primary mb-2">
          Pusat Kebijakan Privasi &amp; Legalitas
        </h1>

        <p class="text-body-1 text-medium-emphasis">
          Selamat datang di portal transparansi hukum dan privasi Perumda Tirta Patriot Kota Bekasi. Halaman ini memuat seluruh dokumen kebijakan privasi, syarat penggunaan, serta pedoman pelindungan data pribadi untuk layanan digital kami.
        </p>
      </div>

      <v-row>
        <v-col
          v-for="group in legalDocs"
          :key="group.category"
          cols="12"
          md="6"
        >
          <v-card class="fill-height d-flex flex-column" elevation="2" rounded="lg">
            <v-card-item class="bg-grey-lighten-4 py-4">
              <template #prepend>
                <v-avatar :color="group.color" size="40" variant="tonal">
                  <v-icon :icon="group.icon" size="24" />
                </v-avatar>
              </template>

              <v-card-title class="font-weight-bold text-subtitle-1">
                {{ group.category }}
              </v-card-title>

              <v-card-subtitle class="text-wrap">
                {{ group.description }}
              </v-card-subtitle>
            </v-card-item>

            <v-divider />

            <v-list class="flex-grow-1" lines="two">
              <v-list-item
                v-for="item in group.items"
                :key="item.to"
                append-icon="i-mdi:chevron-right"
                class="py-2"
                :to="item.to"
              >
                <v-list-item-title class="font-weight-bold text-body-1">
                  {{ item.title }}
                </v-list-item-title>

                <v-list-item-subtitle class="text-caption mt-1">
                  {{ item.subtitle }}
                </v-list-item-subtitle>

                <template #append>
                  <v-chip class="mr-2" size="x-small" variant="outlined">
                    {{ item.badge }}
                  </v-chip>

                  <v-icon icon="i-mdi:chevron-right" />
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="my-8" />

      <v-card class="pa-4 bg-grey-lighten-4" flat rounded="lg">
        <h3 class="text-subtitle-1 font-weight-bold mb-2">
          Komitmen Pelindungan Data Pribadi
        </h3>

        <p class="text-body-2 mb-0">
          Perumda Tirta Patriot Kota Bekasi senantiasa mematuhi Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Kami menjamin bahwa pemrosesan data pribadi pada seluruh layanan digital dilakukan dengan prinsip legalitas, kehati-hatian, pembatasan tujuan, serta pengamanan ketat.
        </p>
      </v-card>
    </v-container>
  </v-main>
</template>
