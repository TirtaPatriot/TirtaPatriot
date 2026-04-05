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
</script>

<template>
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
              v-model="formBody.nomor"
              inputmode="numeric"
              label="No. Pelanggan"
              :loading="loading.step1"
              variant="outlined"
              @keyup.enter="emit('navigate', 'next')"
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

      <v-stepper-window-item :value="2">
        <v-card min-height="200">
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

      <v-stepper-window-item :value="3">
        <v-card min-height="200">
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

      <v-stepper-window-item :value="4">
        <v-card min-height="200">
          <v-card-text>
            Pengaduan berhasil terkirim, tiket aduan anda adalah <strong>{{ tiket }}</strong>

            <v-row class="mt-4" density="comfortable">
              <v-col cols="1/1" sm="1/2">
                <v-btn block color="blue" :to="`/pelanggan/pengaduan?tiket=${tiket}`" variant="tonal">
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
      :disabled="step === 4"
      next-text="Selanjutnya"
      prev-text="Sebelumnya"
      @click:next="emit('navigate', 'next')"
      @click:prev="emit('navigate', 'prev')"
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
    <v-card-actions class="social-actions">
      <SocialButtons />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
  .social-actions {
    display: flex;
    justify-content: center;
    overflow-x: auto;
  }
</style>
