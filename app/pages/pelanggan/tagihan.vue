<script lang="ts" setup>
  defineOgImage('NuxtSeo', {
    headline: 'Tagihan Pelanggan',
    title: 'Perumda Tirta Patriot',
    siteLogo: 'https://tirtapatriot.co.id/logo.png',
    theme: '#0487d2',
  })

  useSeoMeta({
    title: 'Cek Tagihan Air - Perumda Tirta Patriot',
    description: 'Layanan informasi rekening dan pengecekan tagihan pemakaian air online pelanggan Perumda Tirta Patriot Kota Bekasi.',
  })

  definePageMeta({
    alias: [
      '/info/tagihan',
    ],
  })

  type PelangganData = {
    nomor?: string
    nama?: string
    alamat?: string
    kecamatan?: string
    kelurahan?: string
    _nonaktif?: boolean
  }

  type ItemTagihan = {
    bulan?: string
    stan_awal?: number | string
    stan_akhir?: number | string
    kubik?: number | string
    air?: number | string
    administrasi?: number | string
    angsuran?: number | string
    total?: number | string
  }

  type ResponseTagihan = {
    pelanggan?: PelangganData
    tagihan?: ItemTagihan[]
    total?: string | number
  }

  const body = reactive({
    pelanggan: '',
  })

  const error = ref('')
  const loading = ref(false)
  const data = ref<ResponseTagihan | null>(null)

  const { executeRecaptcha } = useGoogleRecaptcha()
  const config = useRuntimeConfig()

  async function submit () {
    if (!body.pelanggan.trim()) {
      error.value = 'Silakan masukkan nomor pelanggan terlebih dahulu.'
      return
    }

    try {
      loading.value = true
      error.value = ''
      const { token } = await executeRecaptcha('tagihan')

      data.value = await $fetch<ResponseTagihan>(`${config.public.apiUrl}/tagihan`, {
        method: 'POST',
        body: {
          'pelanggan': body.pelanggan.trim(),
          'g-recaptcha-response': token,
        },
      })
    } catch (error_: any) {
      data.value = null
      error.value = error_?.data?.message || error_?.message || 'Nomor pelanggan tidak ditemukan atau terjadi kendala saat memproses tagihan.'
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <v-main>
    <PageHeader title="Tagihan" />

    <v-container class="py-6">
      <div class="text-center mb-6">
        <h2 class="text-h4 font-weight-bold text-uppercase text-primary mb-2">
          Cek Tagihan Air
        </h2>

        <p class="text-body-2 text-medium-emphasis">
          Masukkan nomor sambungan langganan (SL) untuk memeriksa rincian rekening tagihan air Anda.
        </p>
      </div>

      <v-row justify="center">
        <v-col cols="12" md="8" sm="10">
          <v-text-field
            v-model="body.pelanggan"
            append-inner-icon="i-mdi:magnify"
            clearable
            hide-details="auto"
            inputmode="numeric"
            label="Nomor Pelanggan"
            :loading="loading"
            placeholder="Contoh: 123456"
            variant="solo"
            @click:append-inner="submit"
            @keyup.enter="submit"
          />

          <v-banner
            v-if="error"
            class="mt-4 rounded-lg"
            color="error"
            icon="i-mdi:alert"
            lines="two"
          >
            <v-banner-text>
              {{ error }}
            </v-banner-text>
          </v-banner>

          <v-banner
            v-if="data?.pelanggan?._nonaktif"
            class="mt-4 rounded-lg"
            color="warning"
            icon="i-mdi:warning-outline"
            lines="two"
          >
            <v-banner-text>
              Status kepelangganan Anda saat ini tidak aktif, namun masih terdapat kewajiban tagihan yang belum terselesaikan.
            </v-banner-text>
          </v-banner>

          <div v-if="data" class="mt-6">
            <v-card class="mb-6 rounded-lg" :elevation="2">
              <v-card-item class="bg-surface-variant py-3">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  Data Pelanggan
                </v-card-title>
              </v-card-item>

              <v-table density="comfortable">
                <tbody>
                  <tr>
                    <td class="font-weight-medium text-medium-emphasis" style="width: 180px;">
                      No. Pelanggan
                    </td>

                    <td class="font-weight-bold">
                      {{ data.pelanggan?.nomor ?? '-' }}
                    </td>
                  </tr>

                  <tr>
                    <td class="font-weight-medium text-medium-emphasis">
                      Nama Pelanggan
                    </td>

                    <td>{{ data.pelanggan?.nama ?? '-' }}</td>
                  </tr>

                  <tr>
                    <td class="font-weight-medium text-medium-emphasis">
                      Alamat
                    </td>

                    <td>
                      {{ data.pelanggan?.alamat ?? '-' }}
                      <span v-if="data.pelanggan?.kelurahan || data.pelanggan?.kecamatan">
                        , {{ data.pelanggan?.kelurahan }}, {{ data.pelanggan?.kecamatan }}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td class="font-weight-medium text-medium-emphasis">
                      Total Tagihan
                    </td>

                    <td class="text-h6 font-weight-bold text-primary">
                      Rp {{ data.total }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>

            <v-card class="mb-6 rounded-lg" :elevation="2">
              <v-card-item class="bg-surface-variant py-3">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  Rincian Tagihan Belum Dibayar
                </v-card-title>
              </v-card-item>

              <div class="overflow-x-auto">
                <v-table density="comfortable" hover>
                  <thead>
                    <tr>
                      <th class="text-center" style="width: 48px;">
                        No.
                      </th>

                      <th>Periode</th>

                      <th class="text-right">
                        Stan Awal
                      </th>

                      <th class="text-right">
                        Stan Akhir
                      </th>

                      <th class="text-right">
                        Pemakaian (m³)
                      </th>

                      <th class="text-right">
                        Biaya Air
                      </th>

                      <th class="text-right">
                        Biaya Adm.
                      </th>

                      <th class="text-right">
                        Angsuran
                      </th>

                      <th class="text-right">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="(t, i) in data?.tagihan" :key="t.bulan || i">
                      <td class="text-center text-medium-emphasis">
                        {{ i + 1 }}
                      </td>

                      <td class="font-weight-medium">
                        {{ t.bulan }}
                      </td>

                      <td class="text-right font-mono">
                        {{ t.stan_awal }}
                      </td>

                      <td class="text-right font-mono">
                        {{ t.stan_akhir }}
                      </td>

                      <td class="text-right font-mono font-weight-bold">
                        {{ t.kubik }}
                      </td>

                      <td class="text-right font-mono">
                        {{ t.air }}
                      </td>

                      <td class="text-right font-mono">
                        {{ t.administrasi }}
                      </td>

                      <td class="text-right font-mono">
                        {{ t.angsuran }}
                      </td>

                      <td class="text-right font-mono font-weight-bold text-primary">
                        {{ t.total }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </v-card>
          </div>

          <v-alert
            class="mt-6 rounded-lg text-body-2"
            color="info"
            icon="i-mdi:information"
            variant="tonal"
          >
            Nilai nominal pada struk pembayaran pihak ketiga / mitra merchant mungkin terdapat perbedaan karena penyesuaian biaya administrasi jasa transaksi.
          </v-alert>

          <div class="d-flex justify-center mt-6">
            <v-btn
              color="primary"
              prepend-icon="i-mdi:wallet-outline"
              to="/informasi/tempat-pembayaran"
              variant="text"
            >
              Lihat Mitra Loket Pembayaran Resmi
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
