<script lang="ts" setup>
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
  () => Promise.all([
    getItems({ collection: 'kantor' }),
  ]),
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
                v-for="o of data[0]"
                :key="o.id"
                :subtitle="o.address"
                :title="o.name"
                lines="three"
                :href="`https://www.google.com/maps?saddr=My+Location&daddr=${o.latitude},${o.longitude}`"
                rounded="shaped" prepend-icon="i-mdi:office-building"
                append-icon="i-mdi:directions"
                rel="external nofollow"
              />
            </v-list>
          </v-sheet>
        </v-col>
        <v-col>
          <v-sheet :elevation="2" class="my-2">
            <v-list class="mx-2">
              <v-list-subheader class="text-title font-weight-bold text-uppercase">
                Bisnis
              </v-list-subheader>

              <v-list-item title="sekretariat@tirtapatriot.co.id" href="mailto:perumda@tirtapatriot.co.id" rounded="shaped" prepend-icon="i-mdi:email" append-icon="i-mdi:launch" />
              <v-list-item title="021-8896-6161" href="tel:622188966161" rounded="shaped" prepend-icon="i-mdi:phone" append-icon="i-mdi:launch" />

              <v-list-subheader class="text-title font-weight-bold text-uppercase">
                Humas
              </v-list-subheader>
              <v-list-item title="humas@tirtapatriot.co.id" href="mailto:humas@tirtapatriot.co.id" rounded="shaped" prepend-icon="i-mdi:email" append-icon="i-mdi:launch" />
              <v-list-item title="0878-7516-3845" href="tel:6287875163845" rounded="shaped" prepend-icon="i-mdi:phone" append-icon="i-mdi:launch" />
            </v-list>
          </v-sheet>

          <v-sheet elevation="2">
            <SocialButtons list title="Media Sosial" />
          </v-sheet>

          <v-sheet elevation="2" class="my-2">
            <v-list>
              <v-list-subheader class="text-title font-weight-bold text-uppercase">
                Layanan Mandiri
              </v-list-subheader>
              <v-list-item
                v-for="s of selfService" :key="s.href"
                :title="s.title"
                :href="s.href"
                rounded="shaped"
                :prepend-icon="s.icon"
                append-icon="i-mdi:launch"
                rel="external nofollow"
              />
            </v-list>
          </v-sheet>
          <v-sheet :elevation="2" class="my-2">
            <v-list class="mx-2">
              <v-list-subheader class="text-title font-weight-bold text-uppercase">
                SALURAN
              </v-list-subheader>

              <v-list-item title="WhatsApp" href="https://whatsapp.com/channel/0029VaaWmpGId7nRB1BLj52w" rel="external nofollow" rounded="shaped" prepend-icon="i-mdi:whatsapp" append-icon="i-mdi:launch" />
              <v-list-item title="Telegram" href="https://t.me/PerumdaTirtaPatriot" rel="external nofollow" prepend-icon="i-mdi:telegram" append-icon="i-mdi:launch" />
            </v-list>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<style>

</style>
