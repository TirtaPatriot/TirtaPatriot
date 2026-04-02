<script lang="ts" setup>
  const config = useRuntimeConfig()
  const route = useRoute()

  defineOgImage('NuxtSeo', {
    headline: 'Pengaduan Pelanggan',
    title: 'Perumda Tirta Patriot',
    siteLogo: 'https://tirtapatriot.co.id/logo.png',
    theme: '#0487d2',
  })

  // ── Ticket tracking view ─────────────────────────────────────────────
  const tiketId = computed(() => route.query.tiket as string | undefined)

  const { data: tiketData } = useLazyFetch<any>(
    () => `${config.public.apiUrl}/pengaduan/${tiketId.value}`,
    {
      server: false,
      default: () => ({}),
      watch: [tiketId],
      immediate: computed(() => !!tiketId.value),
    },
  )

  const fdate = (d: string) => new Intl.DateTimeFormat('id').format(new Date(d))

  // ── Complaint form ───────────────────────────────────────────────────
  const { data } = await useAsyncData<any>(
    'pengaduan',
    () => $fetch(`${config.public.apiUrl}/pengaduan`),
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
  const { executeRecaptcha } = useGoogleRecaptcha()

  async function getMe () {
    try {
      loading.step1 = true
      const { token } = await executeRecaptcha('aduan')
      const result = await $fetch<any>(`${config.public.apiUrl}/pelanggan`, {
        method: 'POST',
        body: { ...body, 'g-recaptcha-response': token },
      })

      body.id = result.id
      nama.value = result.nama
    } finally {
      loading.step1 = false
    }
  }

  const verified = ref(false)
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
      nama.value = result.nama
      body.id = result.id
      verified.value = true
    } finally {
      loading.step2 = false
    }
  }
  const tiket = ref('')
  async function complain () {
    const { token } = await executeRecaptcha('aduan')

    tiket.value = ''
    const result = await $fetch<any>(`${config.public.apiUrl}/pengaduan`, {
      method: 'post',
      body: {
        ...body,
        'g-recaptcha-response': token,
      },
    })

    tiket.value = result
  }

  const steps = [
    { title: 'No. Pelanggan', rules: [() => !!body.id || false] },
    { title: 'Verifikasi', rules: [() => !nama.value.includes('*') || false] },
    { title: 'Pelapor' },
    { title: 'Kendala', rules: [() => !!tiket.value || false] },
    { title: 'Selesai' },
  ]
  const step = ref(0)

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
    <v-container>
      <!-- ── Ticket tracking view ─────────────────────────────────── -->
      <template v-if="tiketId">
        <h3 class="text-title text-uppercase mb-4 text-center">
          Status Pengaduan #{{ tiketId }}
        </h3>
        <v-sheet class="pt-4 px-4" elevation="2">
          <v-textarea
            auto-grow
            label="Pelapor"
            :model-value="tiketData.pelapor"
            readonly
            rows="1"
            variant="underlined"
          />
          <v-textarea
            auto-grow
            label="Perihal"
            :model-value="tiketData.perihal"
            readonly
            rows="1"
            variant="underlined"
          />
          <v-textarea
            auto-grow
            label="Masalah"
            :model-value="tiketData.masalah"
            readonly
            rows="1"
            variant="underlined"
          />
          <v-textarea
            auto-grow
            label="No. Aduan"
            :model-value="tiketId"
            readonly
            rows="1"
            variant="plain"
          />
        </v-sheet>

        <v-timeline side="end">
          <v-timeline-item v-if="tiketData?.tgl_WO" dot-color="blue" size="small">
            <div class="d-flex">
              <strong class="me-4">{{ fdate(tiketData.tgl_WO) }}</strong>
              <div>
                <strong>WO</strong>
                <div class="text-caption">Petugas ditugaskan untuk menangani aduan</div>
              </div>
            </div>
          </v-timeline-item>
          <v-timeline-item v-if="tiketData?.tgl_survei" dot-color="blue" size="small">
            <div class="d-flex">
              <strong class="me-4">{{ fdate(tiketData.tgl_survei) }}</strong>
              <div>
                <strong>Survei</strong>
                <div class="text-caption">Petugas melakukan survei</div>
              </div>
            </div>
          </v-timeline-item>
          <v-timeline-item v-if="tiketData?.tgl_DPB" dot-color="teal-lighten-3" size="small">
            <div class="d-flex">
              <strong class="me-4">{{ fdate(tiketData.tgl_DPB) }}</strong>
              <div>
                <strong>DPB</strong>
                <div class="text-caption">Petugas meminta barang keperluan perbaikan</div>
              </div>
            </div>
          </v-timeline-item>
          <v-timeline-item v-if="tiketData?.tgl_DPG" dot-color="teal-lighten-3" size="small">
            <div class="d-flex">
              <strong class="me-4">{{ fdate(tiketData.tgl_DPG) }}</strong>
              <div>
                <strong>DPG</strong>
                <div class="text-caption">Barang keperluan perbaikan sudah tersedia</div>
              </div>
            </div>
          </v-timeline-item>
          <v-timeline-item v-if="tiketData?.tgl_SPK" dot-color="teal-lighten-3" size="small">
            <div class="d-flex">
              <strong class="me-4">{{ fdate(tiketData.tgl_SPK) }}</strong>
              <div>
                <strong>SPK</strong>
                <div class="text-caption">Perbaikan sudah diperintahkan</div>
              </div>
            </div>
          </v-timeline-item>
          <v-timeline-item v-if="tiketData?.tgl_BA" dot-color="teal-lighten-3" size="small">
            <div class="d-flex">
              <strong class="me-4">{{ fdate(tiketData.tgl_BA) }}</strong>
              <div>
                <strong>BAC</strong>
                <div class="text-caption">
                  Perbaikan telah selesai
                  <span v-if="tiketData.solusi">dengan solusi {{ tiketData.solusi?.trim() }}</span>
                </div>
              </div>
            </div>
          </v-timeline-item>
        </v-timeline>

        <div class="mt-4">
          <v-btn to="/pelanggan/pengaduan" variant="outlined">
            Buat Pengaduan Baru
          </v-btn>
        </div>
      </template>

      <!-- ── Complaint form ──────────────────────────────────────── -->
      <template v-else>
        <h3 class="text-title text-uppercase mb-4 text-center">
          Pengaduan Pelanggan
        </h3>

        <v-stepper v-model="step">
          <v-stepper-header>
            <template
              v-for="(x, n) of steps"
              :key="n"
            >
              <v-stepper-item
                v-bind="x"
                :value="n"
              />
              <v-divider v-if="n < steps.length - 1" />
            </template>
          </v-stepper-header>
          <v-stepper-window>
            <v-stepper-window-item :value="0">
              <v-card height="200">
                <v-card-title>
                  Sambungan Rumah Terkendala
                </v-card-title>
                <v-card-text>
                  <v-text-field
                    v-model="body.nomor"
                    inputmode="numeric"
                    label="No. Pelanggan"
                    :loading="loading.step1"
                    variant="outlined"
                    @keyup.enter="actions('next')"
                  />
                </v-card-text>
              </v-card>
            </v-stepper-window-item>

            <v-stepper-window-item :value="1">
              <v-card height="200">
                <v-card-title>
                  Verifikasi Data Sambungan
                </v-card-title>
                <v-card-subtitle>
                  Harap verifikasi dengan mengisi nama terdaftar untuk No. Pelanggan {{ body.nomor }}
                </v-card-subtitle>
                <v-card-text>
                  <v-text-field
                    v-model="nama"
                    label="Atas Nama"
                    :loading="loading.step2"
                    variant="outlined"
                    @click:append-inner="actions('next')"
                    @keyup.enter="actions('next')"
                  />
                </v-card-text>
              </v-card>
            </v-stepper-window-item>

            <v-stepper-window-item :value="2">
              <v-card min-height="200">
                <v-card-text>
                  <v-text-field
                    v-model="body.pelapor"
                    class="mb-4"
                    hint="Kosongkan jika sama dengan atas nama"
                    label="Nama Pelapor"
                    persistent-hint
                    variant="outlined"
                  />
                  <v-text-field
                    v-model="body.telepon"
                    label="No. Telepon"
                    type="tel"
                    variant="outlined"
                  />
                </v-card-text>
              </v-card>
            </v-stepper-window-item>

            <v-stepper-window-item :value="3">
              <v-card min-height="200">
                <v-card-text>
                  <v-autocomplete
                    v-model="body.jenis"
                    :items="data?.jenis"
                    label="Perihal"
                    persistent-hint
                    variant="outlined"
                  />
                  <v-textarea
                    v-model="body.masalah"
                    auto-grow
                    counter
                    label="Pesan"
                    max-rows="3"
                    maxlength="365"
                    rows="2"
                    variant="outlined"
                  />
                </v-card-text>
              </v-card>
            </v-stepper-window-item>

            <v-stepper-window-item :value="4">
              <v-card min-height="200">
                <v-card-text>
                  Pengaduan berhasil terkirim, tiket aduan anda adalah <strong>{{ tiket }}</strong>
                  <div class="mt-4 d-flex gap-2">
                    <v-btn color="blue" :to="`/pelanggan/pengaduan?tiket=${tiket}`" variant="tonal">
                      Lihat Status Pengaduan
                    </v-btn>
                    <v-btn to="/" variant="outlined">
                      Kembali
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-stepper-window-item>
          </v-stepper-window>

          <v-stepper-actions
            :disabled="step === 4"
            next-text="Selanjutnya"
            prev-text="Sebelumnya"
            @click:next="actions('next')"
            @click:prev="actions('prev')"
          />
        </v-stepper>

        <v-card class="mt-4" icon="$info" tile variant="outlined">
          <v-card-text>
            <PHimbauan />
          </v-card-text>
          <v-card-text>
            <p>Sebelumnya, kami mohon maaf atas ketidaknyamanan yang anda alami.</p>
            <div class="caption">
              Jika anda berkenan untuk berkomunikasi langsung, Humas Perumda Tirta Patriot akan sangat senang melayani anda di media sosial kami berikut
            </div>
          </v-card-text>
          <v-card-actions class="d-flex justify-center overflow-auto">
            <SocialButtons />
          </v-card-actions>
        </v-card>
      </template>
    </v-container>
  </v-main>
</template>

<style>

</style>
