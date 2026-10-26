<script lang="ts" setup>
  defineOgImage('NuxtSeo', {
    headline: 'Kontak Perusahaan',
    title: 'Perumda Tirta Patriot',
    siteLogo: 'https://tirtapatriot.co.id/logo.png',
    theme: '#0487d2',
  })

  useSeoMeta({
    title: 'Kontak - Perumda Tirta Patriot',
    description: 'Hubungi Perumda Tirta Patriot Kota Bekasi melalui telepon, WhatsApp, email, media sosial, atau kunjungi unit pelayanan terdekat.',
  })

  const contacts = [
    { title: 'Telepon', value: '021-8896-6161', icon: 'i-mdi:phone-outline', href: 'tel:+622188966161' },
    { title: 'WhatsApp Humas', value: '0878-7516-3845', icon: 'i-mdi:whatsapp', href: 'https://wa.me/6287875163845' },
    { title: 'Email Humas', value: 'humas@tirtapatriot.co.id', icon: 'i-mdi:email-outline', href: 'mailto:humas@tirtapatriot.co.id' },
    { title: 'Email Sekretariat', value: 'sekretariat@tirtapatriot.co.id', icon: 'i-mdi:email-outline', href: 'mailto:sekretariat@tirtapatriot.co.id' },
  ]

  const channelGroups = [
    {
      title: 'Layanan Mandiri',
      description: 'Cek tagihan dan layanan otomatis kapan saja.',
      items: [
        { title: 'WhatsApp', icon: 'i-mdi:whatsapp', color: 'green', href: 'https://wa.me/message/XEQYWXIGCYSYA1' },
        { title: 'Telegram', icon: 'i-mdi:telegram', color: '#0088cc', href: 'https://t.me/TirtaPatriotBot' },
      ],
    },
    {
      title: 'Saluran Informasi',
      description: 'Pengumuman gangguan dan informasi resmi.',
      items: [
        { title: 'WhatsApp Channel', icon: 'i-mdi:whatsapp', color: 'green', href: 'https://whatsapp.com/channel/0029VaaWmpGId7nRB1BLj52w' },
        { title: 'Telegram Channel', icon: 'i-mdi:telegram', color: '#0088cc', href: 'https://t.me/PerumdaTirtaPatriot' },
      ],
    },
  ]

  const { getItems } = useDirectusItems()

  const { data } = await useAsyncData<any[]>(
    'kontak',
    () => getItems({ collection: 'kantor' }),
  )
</script>

<template>
  <v-main>
    <PageHeader title="Kontak" />

    <v-container class="py-8" max-width="1080">
      <PageIntro
        icon="i-mdi:headset"
        subtitle="Tim Humas dan Layanan Pelanggan siap membantu pada jam operasional, atau gunakan kanal digital kami kapan saja."
        title="Hubungi Kami"
      />

      <v-row>
        <v-col
          v-for="c in contacts"
          :key="c.title"
          cols="1/1"
          md="1/2"
          sm="1/2"
        >
          <v-card
            class="h-100 pa-4"
            :href="c.href"
            rounded="xl"
            :target="c.href.startsWith('http') ? '_blank' : undefined"
            variant="outlined"
          >
            <v-avatar class="mb-3" color="primary" size="48" variant="tonal">
              <v-icon :icon="c.icon" size="26" />
            </v-avatar>

            <div class="text-body-medium text-medium-emphasis">
              {{ c.title }}
            </div>

            <div class="text-title-medium font-weight-bold contact-value">
              {{ c.value }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <h2 class="text-headline-small font-weight-bold mt-10 mb-4">
        Kanal Digital
      </h2>

      <v-row>
        <v-col
          v-for="g in channelGroups"
          :key="g.title"
          cols="1/1"
          md="1/2"
        >
          <v-card class="h-100" rounded="xl" variant="outlined">
            <v-card-item>
              <v-card-title class="text-title-large font-weight-bold">
                {{ g.title }}
              </v-card-title>

              <v-card-subtitle class="text-wrap">
                {{ g.description }}
              </v-card-subtitle>
            </v-card-item>

            <v-list class="bg-transparent px-2 pb-2">
              <v-list-item
                v-for="i in g.items"
                :key="i.href"
                append-icon="i-mdi:open-in-new"
                :href="i.href"
                rel="noopener noreferrer"
                rounded="lg"
                target="_blank"
                :title="i.title"
              >
                <template #prepend>
                  <v-icon class="mr-3" :color="i.color" :icon="i.icon" />
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="1/1">
          <v-card class="pa-4 text-center" rounded="xl" variant="outlined">
            <div class="text-title-medium font-weight-bold mb-2">
              Ikuti Media Sosial Kami
            </div>

            <div class="d-flex justify-center flex-wrap ga-3">
              <SocialButtons />
            </div>
          </v-card>
        </v-col>
      </v-row>

      <template v-if="data?.length">
        <h2 class="text-headline-small font-weight-bold mt-10 mb-4">
          Unit Pelayanan Langsung
        </h2>

        <POfficeGrid :offices="data" />
      </template>
    </v-container>
  </v-main>
</template>

<style scoped>
  .contact-value {
    overflow-wrap: anywhere;
  }
</style>
