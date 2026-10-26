<script lang="ts" setup>
  const config = useRuntimeConfig()
  const route = useRoute()

  defineOgImage('NuxtSeo', {
    headline: 'Pengaduan Pelanggan',
    title: 'Perumda Tirta Patriot',
    siteLogo: 'https://tirtapatriot.co.id/logo.png',
    theme: '#0487d2',
  })

  useSeoMeta({
    title: 'Pengaduan Pelanggan - Perumda Tirta Patriot',
    description: 'Sampaikan laporan kendala sambungan rumah, aliran air, serta lacak status penyelesaian tiket aduan pelanggan Perumda Tirta Patriot Kota Bekasi.',
  })

  const tiketId = computed(() => route.query.tiket as string | undefined)
  const showTicketTracking = ref(false)

  const { data: tiketData, error: tiketError, execute: loadTiketData } = useLazyFetch<any>(
    () => `${config.public.apiUrl}/pengaduan/${tiketId.value}`,
    {
      server: false,
      default: () => ({}),
      immediate: false,
    },
  )

  if (import.meta.client) {
    watch(tiketId, id => {
      showTicketTracking.value = !!id
      if (id)
        loadTiketData()
    }, { immediate: true })
  }

  const { data } = await useAsyncData<any>(
    'pengaduan',
    () => $fetch(`${config.public.apiUrl}/pengaduan`).catch(() => ({})),
  )

  const loading = reactive({
    step1: false,
    step2: false,
  })

  const body = reactive({
    id: '',
    nomor: '',
    jenis: '',
    pelapor: '',
    masalah: '',
    telepon: '',
  })

  const nama = ref('')
  const masked = ref('')
  const verifiedNama = ref('')
  const tiket = ref('')
  const step = ref(0)
  const errorMsg = ref('')

  const stepDefs = [
    { title: 'No. Pelanggan', rules: [() => !!masked.value || false] },
    { title: 'Verifikasi', rules: [() => !!body.id || false] },
    { title: 'Pelapor' },
    { title: 'Kendala', rules: [() => !!tiket.value || false] },
    { title: 'Selesai' },
  ]

  // validasi hanya ditampilkan untuk langkah yang sudah dilewati, bukan sejak awal
  const steps = computed(() => stepDefs.map((s, i) => ({ ...s, rules: i < step.value ? s.rules : undefined })))

  // mengganti nomor pelanggan membatalkan verifikasi sebelumnya
  watch(() => body.nomor, () => {
    body.id = ''
    masked.value = ''
    nama.value = ''
    verifiedNama.value = ''
  })

  const { executeRecaptcha } = useGoogleRecaptcha()

  function messageOf (e: any, fallback: string) {
    if (e?.statusCode === 404 || e?.status === 404)
      return 'Nomor pelanggan tidak ditemukan. Periksa kembali nomor pada rekening air Anda.'
    return e?.data?.message || fallback
  }

  async function getMe () {
    if (!body.nomor?.trim())
      throw new Error('Silakan masukkan nomor pelanggan terlebih dahulu.')

    // data tersamar sudah dimuat untuk nomor yang sama
    if (masked.value)
      return

    try {
      loading.step1 = true
      const { token } = await executeRecaptcha('aduan')
      const result = await $fetch<any>(`${config.public.apiUrl}/pelanggan`, {
        method: 'POST',
        body: { 'nomor': body.nomor.trim(), 'g-recaptcha-response': token },
      })

      masked.value = result?.nama ?? ''
    } catch (error: any) {
      throw new Error(messageOf(error, 'Data pelanggan belum dapat dimuat. Silakan coba lagi.'), { cause: error })
    } finally {
      loading.step1 = false
    }
  }

  async function unlock () {
    const typed = nama.value.trim()
    if (!typed)
      throw new Error('Silakan isi nama sesuai data sambungan Anda.')

    // nama yang sama sudah terverifikasi
    if (body.id && verifiedNama.value === typed)
      return

    try {
      loading.step2 = true
      const { token } = await executeRecaptcha('aduan')
      const result = await $fetch<any>(`${config.public.apiUrl}/pelanggan`, {
        method: 'POST',
        body: {
          'nomor': body.nomor.trim(),
          'nama': typed,
          'g-recaptcha-response': token,
        },
      })

      body.id = result?.id ?? ''
      verifiedNama.value = typed
    } catch (error: any) {
      body.id = ''
      verifiedNama.value = ''
      throw new Error(error?.data?.code === 'CN403'
        ? 'Nama tidak sesuai dengan data sambungan. Isi nama lengkap sesuai rekening air, tanpa tanda bintang.'
        : messageOf(error, 'Verifikasi belum berhasil. Silakan coba lagi.'), { cause: error })
    } finally {
      loading.step2 = false
    }
  }

  async function complain () {
    const { token } = await executeRecaptcha('aduan')

    tiket.value = ''
    try {
      const result = await $fetch<any>(`${config.public.apiUrl}/pengaduan`, {
        method: 'POST',
        body: {
          ...body,
          'nama': verifiedNama.value,
          'g-recaptcha-response': token,
        },
      })

      tiket.value = result
    } catch (error: any) {
      throw new Error(messageOf(error, 'Pengaduan belum dapat dikirim. Silakan coba lagi.'), { cause: error })
    }
  }

  async function actions (dir: 'next' | 'prev') {
    errorMsg.value = ''

    try {
      if (dir === 'next' && step.value === 3) {
        await complain()
        step.value = 4
        return
      }

      if (dir === 'next' && step.value === 0) {
        await getMe()
        step.value = 1
        return
      }

      if (dir === 'next' && step.value === 1) {
        await unlock()
        step.value = 2
        return
      }
    } catch (error: any) {
      errorMsg.value = error?.message || 'Terjadi kendala. Silakan coba lagi.'
      return
    }

    if (dir === 'next')
      step.value += 1
    else
      step.value -= 1
  }
</script>

<template>
  <v-main>
    <PageHeader title="Pengaduan" />

    <v-container class="py-8" max-width="960">
      <template v-if="showTicketTracking && tiketError">
        <PageIntro
          icon="i-mdi:ticket-confirmation-outline"
          :subtitle="`Nomor tiket ${tiketId}`"
          title="Status Pengaduan"
        />

        <v-alert
          class="mb-4"
          color="error"
          icon="i-mdi:alert-circle-outline"
          :text="tiketError.statusCode === 404
            ? 'Nomor tiket tidak ditemukan. Periksa kembali nomor tiket Anda, lalu coba lagi.'
            : 'Status tiket belum dapat dimuat. Silakan coba lagi beberapa saat lagi.'"
          title="Tiket tidak ditemukan"
          variant="tonal"
        />

        <v-row class="mb-4" density="comfortable">
          <v-col cols="12" sm="6">
            <v-btn block color="primary" to="/pelanggan/pengaduan" variant="flat">
              Buat Pengaduan Baru
            </v-btn>
          </v-col>

          <v-col cols="12" sm="6">
            <v-btn block :to="`/pelanggan/pengaduan?tiket=${tiketId}`" variant="outlined" @click="loadTiketData()">
              Muat Ulang Status
            </v-btn>
          </v-col>
        </v-row>
      </template>

      <PPengaduanStatus
        v-else-if="showTicketTracking"
        :tiket-data="tiketData"
        :tiket-id="tiketId"
      />

      <PPengaduanForm
        v-else
        v-model:body="body"
        v-model:error="errorMsg"
        v-model:nama="nama"
        v-model:step="step"
        :data="data"
        :loading="loading"
        :masked="masked"
        :steps="steps"
        :tiket="tiket"
        @navigate="actions"
      />

      <PBantuan />
    </v-container>
  </v-main>
</template>
