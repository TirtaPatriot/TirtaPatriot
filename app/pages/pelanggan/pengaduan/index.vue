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

  const { data: tiketData, execute: loadTiketData } = useLazyFetch<any>(
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
  const tiket = ref('')
  const step = ref(0)

  const stepDefs = [
    { title: 'No. Pelanggan', rules: [() => !!body.id || false] },
    { title: 'Verifikasi', rules: [() => !nama.value.includes('*') || false] },
    { title: 'Pelapor' },
    { title: 'Kendala', rules: [() => !!tiket.value || false] },
    { title: 'Selesai' },
  ]

  // validasi hanya ditampilkan untuk langkah yang sudah dilewati, bukan sejak awal
  const steps = computed(() => stepDefs.map((s, i) => ({ ...s, rules: i < step.value ? s.rules : undefined })))

  const { executeRecaptcha } = useGoogleRecaptcha()

  async function getMe () {
    try {
      loading.step1 = true
      const { token } = await executeRecaptcha('aduan')
      const result = await $fetch<any>(`${config.public.apiUrl}/pelanggan`, {
        method: 'POST',
        body: { ...body, 'g-recaptcha-response': token },
      })

      body.id = result?.id ?? ''
      nama.value = result?.nama ?? ''
    } finally {
      loading.step1 = false
    }
  }

  async function unlock (b: any) {
    const { token } = await executeRecaptcha('aduan')

    if (body.id || nama.value.includes('＊'))
      return

    try {
      loading.step2 = true
      const result = await $fetch<any>(`${config.public.apiUrl}/pelanggan`, {
        method: 'POST',
        body: {
          'nomor': body.nomor,
          ...b,
          'g-recaptcha-response': token,
        },
      })
      nama.value = result?.nama ?? ''
      body.id = result?.id ?? ''
    } finally {
      loading.step2 = false
    }
  }

  async function complain () {
    const { token } = await executeRecaptcha('aduan')

    tiket.value = ''
    const result = await $fetch<any>(`${config.public.apiUrl}/pengaduan`, {
      method: 'POST',
      body: {
        ...body,
        'g-recaptcha-response': token,
      },
    })

    tiket.value = result
  }

  async function actions (dir: 'next' | 'prev') {
    if (step.value === 3 && dir === 'next') {
      await complain()
      step.value = 4
      return
    }

    if (step.value === 0 && dir === 'next') {
      await getMe()
      step.value = 1
      return
    }

    if (step.value === 1 && dir === 'next') {
      await unlock({ nama: nama.value })
      step.value = 2
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
      <PPengaduanStatus
        v-if="showTicketTracking"
        :tiket-data="tiketData"
        :tiket-id="tiketId"
      />

      <PPengaduanForm
        v-else
        v-model:body="body"
        v-model:nama="nama"
        v-model:step="step"
        :data="data"
        :loading="loading"
        :steps="steps"
        :tiket="tiket"
        @navigate="actions"
      />

      <PBantuan />
    </v-container>
  </v-main>
</template>
