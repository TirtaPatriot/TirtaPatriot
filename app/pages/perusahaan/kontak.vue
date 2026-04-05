<script lang="ts" setup>
  defineOgImage('NuxtSeo', {
    headline: 'Kontak Perusahaan',
    title: 'Perumda Tirta Patriot',
    siteLogo: 'https://tirtapatriot.co.id/logo.png',
    theme: '#0487d2',
  })

  const selfService = ref([
    {
      title: 'WhatsApp',
      color: 'green',
      icon: 'i-mdi:whatsapp',
      href: 'https://wa.me/message/XEQYWXIGCYSYA1',
    },
    {
      title: 'Telegram',
      color: '#0088cc',
      icon: 'i-mdi:telegram',
      href: 'https://t.me/TirtaPatriotBot',
    },
  ])

  const { getItems } = useDirectusItems()

  const { data } = await useAsyncData<any[]>(
    'kontak',
    () => getItems({ collection: 'kantor' }),
  )
</script>

<template>
  <v-main>
    <PageHeader title="Kontak" />
    <v-container>
      <v-row>
        <v-col>
          <v-sheet v-if="data?.length" :elevation="2">
            <v-list class="mx-2">
              <v-list-subheader class="text-title text-uppercase font-weight-bold">
                Unit Pelayanan Langsung
              </v-list-subheader>
              <v-list-item
                v-for="o of data"
                :key="o.id"
                append-icon="i-mdi:directions"
                :href="`https://www.google.com/maps?saddr=My+Location&daddr=${o.latitude},${o.longitude}`"
                lines="three"
                prepend-icon="i-mdi:office-building"
                rel="external nofollow"
                rounded="shaped"
                :subtitle="o.address"
                :title="o.name"
              />
            </v-list>
          </v-sheet>
        </v-col>
        <v-col>
          <v-sheet class="my-2" :elevation="2">
            <v-list class="mx-2">
              <v-list-subheader class="text-title font-weight-bold text-uppercase">
                Bisnis
              </v-list-subheader>

              <v-list-item
                append-icon="i-mdi:launch"
                href="mailto:perumda@tirtapatriot.co.id"
                prepend-icon="i-mdi:email"
                rounded="shaped"
                title="sekretariat@tirtapatriot.co.id"
              />
              <v-list-item
                append-icon="i-mdi:launch"
                href="tel:622188966161"
                prepend-icon="i-mdi:phone"
                rounded="shaped"
                title="021-8896-6161"
              />

              <v-list-subheader class="text-title font-weight-bold text-uppercase">
                Humas
              </v-list-subheader>
              <v-list-item
                append-icon="i-mdi:launch"
                href="mailto:humas@tirtapatriot.co.id"
                prepend-icon="i-mdi:email"
                rounded="shaped"
                title="humas@tirtapatriot.co.id"
              />
              <v-list-item
                append-icon="i-mdi:launch"
                href="tel:6287875163845"
                prepend-icon="i-mdi:phone"
                rounded="shaped"
                title="0878-7516-3845"
              />
            </v-list>
          </v-sheet>

          <v-sheet elevation="2">
            <SocialButtons list title="Media Sosial" />
          </v-sheet>

          <v-sheet class="my-2" elevation="2">
            <v-list>
              <v-list-subheader class="text-title font-weight-bold text-uppercase">
                Layanan Mandiri
              </v-list-subheader>
              <v-list-item
                v-for="s of selfService"
                :key="s.href"
                append-icon="i-mdi:launch"
                :href="s.href"
                :prepend-icon="s.icon"
                rel="external nofollow"
                rounded="shaped"
                :title="s.title"
              />
            </v-list>
          </v-sheet>
          <v-sheet class="my-2" :elevation="2">
            <v-list class="mx-2">
              <v-list-subheader class="text-title font-weight-bold text-uppercase">
                SALURAN
              </v-list-subheader>

              <v-list-item
                append-icon="i-mdi:launch"
                href="https://whatsapp.com/channel/0029VaaWmpGId7nRB1BLj52w"
                prepend-icon="i-mdi:whatsapp"
                rel="external nofollow"
                rounded="shaped"
                title="WhatsApp"
              />
              <v-list-item
                append-icon="i-mdi:launch"
                href="https://t.me/PerumdaTirtaPatriot"
                prepend-icon="i-mdi:telegram"
                rel="external nofollow"
                title="Telegram"
              />
            </v-list>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<style>

</style>
