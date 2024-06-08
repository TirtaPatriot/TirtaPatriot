<script lang="ts" setup>
const config = useRuntimeConfig()
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

async function getMe() {
  try {
    loading.step1 = true
    const { token } = await executeRecaptcha('aduan')
    const result = await $fetch<any>(`${config.public.apiUrl}/pelanggan`, {
      method: 'POST',
      body: { ...body, 'g-recaptcha-response': token },
    })

    body.id = result.id
    nama.value = result.nama
  }
  finally {
    loading.step1 = false
  }
}

const verified = ref(false)
async function unlock(b: any) {
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
  }
  finally {
    loading.step2 = false
  }
}
const tiket = ref('')
async function complain() {
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

async function actions(dir: 'next' | 'prev') {
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
          <v-stepper-window-item
            :value="0"
          >
            <v-card height="200">
              <v-card-title>
                Sambungan Rumah Terkendala
              </v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="body.nomor"
                  :loading="loading.step1"
                  variant="outlined"
                  inputmode="numeric"
                  label="No. Pelanggan"
                  @keyup.enter="actions('next')"
                />
              </v-card-text>
            </v-card>
          </v-stepper-window-item>

          <v-stepper-window-item
            :value="1"
          >
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
                  :loading="loading.step2"
                  variant="outlined"
                  label="Atas Nama"
                  @keyup.enter="actions('next')"
                  @click:append-inner="actions('next')"
                />
              </v-card-text>
            </v-card>
          </v-stepper-window-item>

          <v-stepper-window-item
            :value="2"
          >
            <v-card min-height="200">
              <!-- <v-card-title>
                Kontak Pelapor
              </v-card-title> -->

              <v-card-text>
                <v-text-field
                  v-model="body.pelapor"
                  class="mb-4"
                  variant="outlined"
                  label="Nama Pelapor"
                  hint="Kosongkan jika sama dengan atas nama"
                  persistent-hint
                />
                <v-text-field
                  v-model="body.telepon"
                  type="tel"
                  variant="outlined"
                  label="No. Telepon"
                />
              </v-card-text>
            </v-card>
          </v-stepper-window-item>
          <v-stepper-window-item
            :value="3"
          >
            <v-card min-height="200">
              <!-- <v-card-title>
                Kendala
              </v-card-title> -->

              <v-card-text>
                <v-autocomplete
                  v-model="body.jenis"
                  variant="outlined"
                  :items="data?.jenis"
                  label="Perihal"
                  persistent-hint
                />
                <v-textarea
                  v-model="body.masalah"
                  label="Pesan"
                  variant="outlined"

                  rows="2"
                  auto-grow counter
                  max-rows="3"
                  maxlength="365"
                />
              </v-card-text>
            </v-card>
          </v-stepper-window-item>
          <v-stepper-window-item
            :value="4"
          >
            <v-card min-height="200">
              <!-- <v-card-title>
                Kendala
              </v-card-title> -->

              <v-card-text>
                Pengaduan berhasil terkirim, tiket aduan anda adalah {{ tiket }}
                <div>
                  <v-btn to="/">
                    Kembali
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-stepper-window-item>
        </v-stepper-window>

        <v-stepper-actions
          next-text="Selanjutnya"
          prev-text="Sebelumnya"
          :disabled="step === 4"
          @click:next="actions('next')"
          @click:prev="actions('prev')"
        />
      </v-stepper>

      <v-card icon="$info" class="mt-4" tile variant="outlined">
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
    </v-container>
  </v-main>
</template>

<style>

</style>
