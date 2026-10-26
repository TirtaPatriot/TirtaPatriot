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
    kategori?: string
    bulan?: string
    stan_awal?: number | string
    stan_akhir?: number | string
    kubik?: number | string
    air?: number | string
    administrasi?: number | string
    denda?: number | string
    lainnya?: number | string
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
  const { mdAndUp } = useDisplay()

  const jumlahTagihan = computed(() => data.value?.tagihan?.length ?? 0)
  const adaLainnya = computed(() => data.value?.tagihan?.some(t => t.lainnya && String(t.lainnya) !== '0') ?? false)
  const labelKategori: Record<string, string> = { NONAIR: 'Non-Air', CICILAN: 'Cicilan' }
  const alamatLengkap = computed(() => {
    const p = data.value?.pelanggan
    return [p?.alamat, p?.kelurahan, p?.kecamatan].filter(Boolean).join(', ') || '-'
  })

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

    <v-container class="py-8 tagihan-container">
      <v-card class="hero-card rounded-xl pa-6 pa-sm-8 mb-6" :elevation="6">
        <div class="d-flex align-center ga-3 mb-2">
          <v-avatar class="hero-avatar" size="48">
            <v-icon icon="i-mdi:water-check" size="28" />
          </v-avatar>

          <h2 class="text-h5 text-sm-h4 font-weight-bold">
            Cek Tagihan Air
          </h2>
        </div>

        <p class="text-body-2 text-sm-body-1 mb-5 hero-subtitle">
          Masukkan nomor sambungan langganan (SL) untuk memeriksa rincian rekening tagihan air Anda.
        </p>

        <v-text-field
          v-model="body.pelanggan"
          append-inner-icon="i-mdi:magnify"
          clearable
          hide-details="auto"
          inputmode="numeric"
          label="Nomor Pelanggan"
          :loading="loading"
          placeholder="Contoh: 010301001045"
          rounded="lg"
          variant="solo"
          @click:append-inner="submit"
          @keyup.enter="submit"
        />

        <v-btn
          block
          class="mt-4 text-none font-weight-bold"
          color="white"
          :loading="loading"
          prepend-icon="i-mdi:file-search-outline"
          size="large"
          variant="flat"
          @click="submit"
        >
          Cek Tagihan
        </v-btn>
      </v-card>

      <v-alert
        v-if="error"
        class="mb-6 rounded-lg"
        closable
        color="error"
        icon="i-mdi:alert-circle-outline"
        variant="tonal"
        @click:close="error = ''"
      >
        {{ error }}
      </v-alert>

      <template v-if="data">
        <v-alert
          v-if="data.pelanggan?._nonaktif"
          class="mb-6 rounded-lg"
          color="warning"
          icon="i-mdi:alert-outline"
          variant="tonal"
        >
          Status kepelangganan Anda saat ini tidak aktif
          <template v-if="jumlahTagihan">
            , namun masih terdapat kewajiban tagihan yang belum terselesaikan
          </template>.
        </v-alert>

        <v-row class="mb-2">
          <v-col cols="12" md="7">
            <v-card class="rounded-xl h-100" :elevation="2">
              <v-card-item class="pb-0">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  Data Pelanggan
                </v-card-title>
              </v-card-item>

              <v-list class="bg-transparent" density="comfortable" lines="two">
                <v-list-item
                  prepend-icon="i-mdi:identifier"
                  subtitle="No. Pelanggan"
                  :title="data.pelanggan?.nomor ?? '-'"
                />

                <v-list-item
                  prepend-icon="i-mdi:account-outline"
                  subtitle="Nama Pelanggan"
                  :title="data.pelanggan?.nama ?? '-'"
                />

                <v-list-item
                  prepend-icon="i-mdi:map-marker-outline"
                  subtitle="Alamat"
                  :title="alamatLengkap"
                />
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="5">
            <v-card
              class="rounded-xl h-100 d-flex flex-column justify-center pa-6 total-card"
              :class="jumlahTagihan ? 'total-due' : 'total-paid'"
              :elevation="4"
            >
              <template v-if="jumlahTagihan">
                <div class="text-overline total-label">
                  Total Tagihan
                </div>

                <div class="text-h4 text-sm-h3 font-weight-bold my-1">
                  Rp {{ data.total }}
                </div>

                <v-chip
                  class="mt-2 align-self-start"
                  color="white"
                  prepend-icon="i-mdi:calendar-clock-outline"
                  size="small"
                  variant="tonal"
                >
                  {{ jumlahTagihan }} periode belum dibayar
                </v-chip>
              </template>

              <template v-else>
                <v-icon class="mb-2" icon="i-mdi:check-circle-outline" size="48" />

                <div class="text-h6 font-weight-bold">
                  Tidak ada tagihan
                </div>

                <div class="text-body-2 total-label">
                  Seluruh rekening air Anda sudah terbayar.
                </div>
              </template>
            </v-card>
          </v-col>
        </v-row>

        <v-card v-if="jumlahTagihan" class="mt-4 rounded-xl overflow-hidden" :elevation="2">
          <v-card-item class="py-3">
            <v-card-title class="text-subtitle-1 font-weight-bold">
              Rincian Tagihan Belum Dibayar
            </v-card-title>
          </v-card-item>

          <v-divider />

          <div v-if="mdAndUp" class="overflow-x-auto">
            <v-table density="comfortable" hover>
              <thead>
                <tr>
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
                    Denda
                  </th>

                  <th v-if="adaLainnya" class="text-right">
                    Lainnya
                  </th>

                  <th class="text-right">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(t, i) in data.tagihan" :key="t.bulan || i">
                  <td class="font-weight-medium">
                    {{ t.bulan }}

                    <v-chip
                      v-if="t.kategori && labelKategori[t.kategori]"
                      class="ml-1"
                      color="primary"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ labelKategori[t.kategori] }}
                    </v-chip>
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
                    {{ t.denda }}
                  </td>

                  <td v-if="adaLainnya" class="text-right font-mono">
                    {{ t.lainnya }}
                  </td>

                  <td class="text-right font-mono font-weight-bold text-primary">
                    {{ t.total }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <div v-else class="pa-3">
            <v-card
              v-for="(t, i) in data.tagihan"
              :key="t.bulan || i"
              class="mb-3 rounded-lg"
              variant="outlined"
            >
              <div class="d-flex align-center justify-space-between px-4 pt-3">
                <span class="font-weight-bold">
                  {{ t.bulan }}

                  <v-chip
                    v-if="t.kategori && labelKategori[t.kategori]"
                    class="ml-1"
                    color="primary"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ labelKategori[t.kategori] }}
                  </v-chip>
                </span>

                <span class="font-weight-bold text-primary">Rp {{ t.total }}</span>
              </div>

              <v-list class="bg-transparent" density="compact">
                <v-list-item class="text-body-2" title="Stan meter">
                  <template #append>
                    {{ t.stan_awal }} → {{ t.stan_akhir }}
                  </template>
                </v-list-item>

                <v-list-item class="text-body-2" title="Pemakaian">
                  <template #append>
                    {{ t.kubik }} m³
                  </template>
                </v-list-item>

                <v-list-item class="text-body-2" title="Biaya air">
                  <template #append>
                    {{ t.air }}
                  </template>
                </v-list-item>

                <v-list-item class="text-body-2" title="Biaya administrasi">
                  <template #append>
                    {{ t.administrasi }}
                  </template>
                </v-list-item>

                <v-list-item class="text-body-2" title="Denda">
                  <template #append>
                    {{ t.denda }}
                  </template>
                </v-list-item>

                <v-list-item v-if="adaLainnya" class="text-body-2" title="Lainnya">
                  <template #append>
                    {{ t.lainnya }}
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </div>
        </v-card>
      </template>

      <v-alert
        class="mt-6 rounded-lg text-body-2"
        color="info"
        icon="i-mdi:information-outline"
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
    </v-container>
  </v-main>
</template>

<style scoped>
  .tagihan-container {
    max-width: 960px;
  }

  .hero-card {
    background: linear-gradient(135deg, #0487d2 0%, #4790ff 100%);
    color: #fff;
  }

  .hero-avatar {
    background: rgb(255 255 255 / 20%);
  }

  .hero-subtitle,
  .total-label {
    opacity: 0.85;
  }

  .total-card {
    color: #fff;
  }

  .total-due {
    background: linear-gradient(135deg, #0487d2 0%, #4790ff 100%);
  }

  .total-paid {
    background: linear-gradient(135deg, #2e9e78 0%, #47b88e 100%);
  }
</style>
