<script lang="ts" setup>
  const step = defineModel<number>('step', { default: 0 })
  const nama = defineModel<string>('nama', { default: '' })
  const formBody = defineModel<Record<string, any>>('body', { required: true })

  defineProps<{
    steps: any[]
    loading: {
      step1: boolean
      step2: boolean
    }
    data: any
    tiket: string
  }>()

  const emit = defineEmits<{
    navigate: [dir: 'next' | 'prev']
  }>()

  const { xs } = useDisplay()

  // stepper tampil 1-based, logika halaman tetap 0-based
  const stepper = computed({
    get: () => step.value + 1,
    set: (value: number) => {
      step.value = value - 1
    },
  })
</script>

<template>
  <PageIntro
    icon="i-mdi:ticket-confirmation-outline"
    subtitle="Laporkan kendala sambungan rumah Anda. Tim kami akan menindaklanjuti dan Anda dapat memantau progresnya dengan nomor tiket."
    title="Pengaduan Pelanggan"
  />

  <v-stepper
    v-model="stepper"
    class="glass"
    :elevation="2"
    :mobile="xs"
    rounded="xl"
  >
    <v-stepper-header>
      <template
        v-for="(x, n) of steps"
        :key="n"
      >
        <v-stepper-item
          v-bind="x"
          :value="n + 1"
        />

        <v-divider v-if="n < steps.length - 1" />
      </template>
    </v-stepper-header>

    <v-stepper-window>
      <v-stepper-window-item :value="1">
        <v-card class="no-glass" flat>
          <v-card-title class="text-wrap">
            Sambungan Rumah Terkendala
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="formBody.nomor"
              hint="Nomor pelanggan tertera pada rekening air Anda"
              inputmode="numeric"
              label="No. Pelanggan"
              :loading="loading.step1"
              persistent-hint
              variant="outlined"
              @keyup.enter="emit('navigate', 'next')"
            />
          </v-card-text>
        </v-card>
      </v-stepper-window-item>

      <v-stepper-window-item :value="2">
        <v-card class="no-glass" flat>
          <v-card-title class="text-wrap">
            Verifikasi Data Sambungan
          </v-card-title>

          <v-card-subtitle class="text-wrap">
            Harap verifikasi dengan mengisi nama terdaftar untuk No. Pelanggan {{ formBody.nomor }}
          </v-card-subtitle>

          <v-card-text>
            <v-text-field
              v-model="nama"
              label="Atas Nama"
              :loading="loading.step2"
              variant="outlined"
              @click:append-inner="emit('navigate', 'next')"
              @keyup.enter="emit('navigate', 'next')"
            />
          </v-card-text>
        </v-card>
      </v-stepper-window-item>

      <v-stepper-window-item :value="3">
        <v-card class="no-glass" flat>
          <v-card-text>
            <v-text-field
              v-model="formBody.pelapor"
              class="mb-4"
              hint="Kosongkan jika sama dengan atas nama"
              label="Nama Pelapor"
              persistent-hint
              variant="outlined"
            />

            <v-text-field
              v-model="formBody.telepon"
              label="No. Telepon"
              type="tel"
              variant="outlined"
            />
          </v-card-text>
        </v-card>
      </v-stepper-window-item>

      <v-stepper-window-item :value="4">
        <v-card class="no-glass" flat>
          <v-card-text>
            <v-autocomplete
              v-model="formBody.jenis"
              :items="data?.jenis"
              label="Perihal"
              persistent-hint
              variant="outlined"
            />

            <v-textarea
              v-model="formBody.masalah"
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

      <v-stepper-window-item :value="5">
        <v-card class="no-glass" flat>
          <v-card-text class="text-center py-6">
            <v-icon color="success" icon="i-mdi:check-circle-outline" size="64" />

            <div class="text-title-large font-weight-bold mt-2">
              Pengaduan berhasil terkirim
            </div>

            <div class="text-body-large mt-1">
              Nomor tiket Anda <strong>{{ tiket }}</strong>
            </div>

            <v-row class="mt-4" density="comfortable" justify="center">
              <v-col cols="1/1" sm="1/2">
                <v-btn block color="primary" :to="`/pelanggan/pengaduan?tiket=${tiket}`" variant="flat">
                  Lihat Status Pengaduan
                </v-btn>
              </v-col>

              <v-col cols="1/1" sm="1/2">
                <v-btn block to="/" variant="outlined">
                  Kembali
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-stepper-window-item>
    </v-stepper-window>

    <v-stepper-actions
      color="primary"
      :disabled="step === 4"
      next-text="Selanjutnya"
      prev-text="Sebelumnya"
      @click:next="emit('navigate', 'next')"
      @click:prev="emit('navigate', 'prev')"
    />
  </v-stepper>

  <v-card class="mt-6 pa-5 pa-md-6" rounded="xl" variant="outlined">
    <PHimbauan />

    <p class="text-body-medium text-medium-emphasis mt-4 mb-0">
      Sebelumnya, kami mohon maaf atas ketidaknyamanan yang Anda alami.
    </p>
  </v-card>
</template>

<style scoped>
  :deep(.v-stepper-actions .v-btn:last-child:not(.v-btn--disabled)) {
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
  }
</style>
