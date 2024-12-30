<script lang="ts" setup>
defineOgImageComponent('NuxtSeo', {
  headline: 'Tagihan Pelanggan',
  title: 'Perumda Tirta Patriot',
  siteLogo: 'https://tirtapatriot.co.id/logo.png',
  theme: '#0487d2',
})

definePageMeta({
  alias: [
    '/info/tagihan',
  ],
})
const body = reactive({
  pelanggan: '',
})

const error = ref('')
const loading = ref(false)
const data = ref<{ pelanggan: any, tagihan: any, total: string }>()

const { executeRecaptcha } = useGoogleRecaptcha()
const config = useRuntimeConfig()
async function submit() {
  try {
    loading.value = true
    const { token } = await executeRecaptcha('tagihan')

    data.value = await $fetch(`${config.public.apiUrl}/tagihan`, {
      method: 'POST',
      body: { ...body, 'g-recaptcha-response': token },
    })
  }
  catch (err: any) {
    error.value = err.toString
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <v-main>
    <PageHeader title="Tagihan" />
    <v-container>
      <h3 class="text-title text-center text-uppercase mb-4">
        Cek Tagihan Air
      </h3>
      <v-text-field
        v-model="body.pelanggan"
        inputmode="numeric"
        :loading="loading"
        append-inner-icon="i-mdi:magnify"
        label="No. Pelanggan"
        variant="solo"
        @keyup.enter="submit"
        @click:append-inner="submit"
      />

      <v-banner
        v-if="error"
        class="mb-6"
        color="error"
        icon="$warning"
        lines="three"
      >
        <v-banner-text>
          {{ error }}
        </v-banner-text>
      </v-banner>

      <v-banner v-if="data?.pelanggan?._nonaktif" icon="$warning" color="error" class="mb-4">
        <v-banner-text>
          Status kepelangganan anda sudah tidak aktif, namun masih ada piutang yang belum dibayarkan.
        </v-banner-text>
      </v-banner>

      <div v-if="data">
        <v-sheet elevation="2" class="py-4">
          <h2 class="text-h5 px-2 pt-3">
            Pelanggan
          </h2>
          <v-table class="bg-transparent">
            <tbody>
              <tr>
                <td>No. Pelanggan</td>
                <td>{{ data.pelanggan?.nomor }}</td>
              </tr>
              <tr>
                <td>Nama</td>
                <td>{{ data.pelanggan?.nama }}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>{{ data.pelanggan?.alamat }}, {{ data.pelanggan?.kecamatan }}, {{ data.pelanggan?.kelurahan }}</td>
              </tr>
              <tr>
                <td>Total Tagihan</td>
                <td>Rp {{ data.total }}</td>
              </tr>
              <!-- <tr>
                <td>No. Pelanggan</td>
                <td>{{ data.pelanggan?.nomor }}</td>
              </tr>
              <tr v-for="(v, k) in data?.pelanggan" :key="k">
                <td class="text-uppercase">
                  {{ k }}
                </td>
                <td>{{ v }}</td>
              </tr>
              <tr>
                <td>TOTAL TAGIHAN</td>
                <td>Rp {{ data.total }}</td>
              </tr> -->
            </tbody>
          </v-table>
        </v-sheet>

        <v-sheet elevation="2" class="my-4 mt-2">
          <h2 class="text-h5 pt-4 px-3">
            Tagihan
          </h2>
          <v-table class="">
            <thead class="">
              <tr>
                <th class="w-0">
                  No.
                </th>
                <th>
                  Periode
                </th>
                <th class="text-right">
                  Stan Awal
                </th>
                <th class="text-right">
                  Stan Akhir
                </th>
                <th class="text-right">
                  Pemakaian
                </th>
                <th class="text-right">
                  Biaya Air
                </th>
                <th class="text-right">
                  Biaya Adm.
                </th>
                <!-- <th>PPN. Adm.</th> -->
                <th class="text-right">
                  Angsuran
                </th>
                <th class="text-right">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(t, i) in data?.tagihan" :key="t.bulan">
                <td class="text-right">
                  {{ i + 1 }}
                </td>
                <td class="text-left" style="width: 90px;">
                  {{ t.bulan }}
                </td>
                <td class="text-right">
                  {{ t.stan_awal }}
                </td>
                <td class="text-right">
                  {{ t.stan_akhir }}
                </td>
                <td class="text-right">
                  {{ t.kubik }}
                </td>
                <td class="text-right">
                  {{ t.air }}
                </td>
                <td class="text-right">
                  {{ t.administrasi }}
                </td>
                <!-- <td class="text-right">
                  {{ t.ppn_administrasi }}
                </td> -->
                <td class="text-right">
                  {{ t.angsuran }}
                </td>
                <td class="text-right">
                  {{ t.total }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-sheet>
      </div>
      <div>
        <v-banner
          icon="i-mdi:warning-outline"
          color="pink-darken-1"
        >
          <v-banner-text>
            Nilai mungkin berbeda dengan yang dikeluarkan merchant mengingat adanya biaya layanan yang diterapkan
          </v-banner-text>
        </v-banner>

        <v-banner
          class="my-4"
        >
          <template #prepend>
            <v-avatar
              color="blue-darken-1"
              icon="i-mdi:palette-swatch-outline"
            />
          </template>
          <v-banner-text>
            Anda juga bisa melakukan pengecekan tagihan di layanan mandiri WhatsApp atau Telegram kami
            &nbsp;
            <v-btn size="30" icon="i-mdi:whatsapp" color="green" href="https://wa.me/message/XEQYWXIGCYSYA1" />
            &nbsp;
            <v-btn size="30" icon="i-mdi:telegram" color="blue" href="https://t.me/TirtaPatriotBot" />
          </v-banner-text>

          <template #actions />
        </v-banner>
      </div>
    </v-container>
  </v-main>
</template>
