<script lang="ts" setup>
  type TicketData = Record<string, any>

  const props = withDefaults(defineProps<{
    tiketId?: string
    tiketData?: TicketData
  }>(), {
    tiketId: '',
    tiketData: () => ({}),
  })

  const fdate = (d: string) => new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta' }).format(new Date(d))

  const cleanedMasalah = computed(() => {
    const raw = String(props.tiketData?.masalah ?? '')
    return raw.replace(/^\s*Masalah\s*:\s*/i, '').trim() || '-'
  })

  const cleanedSolusi = computed(() => {
    const raw = String(props.tiketData?.solusi ?? '')
    return raw.trim() || 'Belum tersedia'
  })

  type TrackingStage = {
    key: string
    label: string
    description: string
    color: string
    dateKey: string
    numberKey?: string
  }

  const trackingStages: TrackingStage[] = [
    {
      key: 'wo',
      label: 'WO Dibuat',
      description: 'Petugas ditugaskan untuk menangani aduan.',
      color: 'blue',
      dateKey: 'tgl_WO',
      numberKey: 'wo_no',
    },
    {
      key: 'survei',
      label: 'Survei',
      description: 'Petugas melakukan survei ke lokasi.',
      color: 'cyan-darken-1',
      dateKey: 'tgl_survei',
    },
    {
      key: 'dpb',
      label: 'DPB',
      description: 'Permintaan barang keperluan perbaikan diproses.',
      color: 'teal-darken-1',
      dateKey: 'tgl_DPB',
      numberKey: 'dpb_no',
    },
    {
      key: 'dpg',
      label: 'DPG',
      description: 'Barang keperluan perbaikan sudah tersedia.',
      color: 'teal',
      dateKey: 'tgl_DPG',
      numberKey: 'dpg_no',
    },
    {
      key: 'spk',
      label: 'SPK',
      description: 'Perbaikan sudah diperintahkan.',
      color: 'indigo-darken-1',
      dateKey: 'tgl_SPK',
      numberKey: 'spk_no',
    },
    {
      key: 'bac',
      label: 'BAC / Selesai',
      description: 'Perbaikan selesai dan berita acara diterbitkan.',
      color: 'green-darken-1',
      dateKey: 'tgl_BA',
      numberKey: 'bac_no',
    },
  ]

  const timelineStatus = computed(() => {
    const source = props.tiketData ?? {}

    return trackingStages.map(stage => ({
      ...stage,
      date: source[stage.dateKey] as string | null | undefined,
      number: stage.numberKey ? source[stage.numberKey] as string | null | undefined : undefined,
      done: !!source[stage.dateKey],
    }))
  })

  const completedSteps = computed(() => timelineStatus.value.filter(x => x.done).length)
  const progressPercent = computed(() => Math.round((completedSteps.value / timelineStatus.value.length) * 100))

  const currentStatusLabel = computed(() => {
    if (props.tiketData?.selesai)
      return 'Selesai'

    const nextStep = timelineStatus.value.find(x => !x.done)
    return nextStep ? `Menunggu ${nextStep.label}` : 'Dalam Proses'
  })
</script>

<template>
  <h3 class="text-headline-medium font-weight-bold text-uppercase mb-4 text-center">
    Status Pengaduan #{{ tiketId }}
  </h3>

  <v-alert
    border="start"
    class="mb-4"
    color="info"
    density="comfortable"
    :text="`Progres saat ini: ${currentStatusLabel}`"
    title="Informasi Status"
    variant="tonal"
  />

  <v-row class="ga-4">
    <v-col cols="1/1" md="2/3">
      <v-card elevation="2" rounded="lg">
        <v-card-title>
          Detail Aduan
        </v-card-title>

        <v-divider />

        <v-list density="comfortable" lines="two">
          <v-list-item subtitle="Nama pelapor" :title="tiketData?.pelapor || '-'" />
          <v-list-item subtitle="Nomor aduan" :title="tiketId || '-'" />
          <v-list-item subtitle="Perihal" :title="tiketData?.perihal || '-'" />
          <v-list-item subtitle="Masalah" :title="cleanedMasalah" />
          <v-list-item subtitle="Solusi" :title="cleanedSolusi" />
        </v-list>

        <v-card-text>
          <v-chip color="primary" prepend-icon="i-mdi:ticket-confirmation-outline" variant="tonal">
            Tiket #{{ tiketId }}
          </v-chip>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="1/1" md="1/3">
      <v-card elevation="2" rounded="lg">
        <v-card-title>
          Progres
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-card-subtitle class="px-0 pb-2 pt-0">
            Status Saat Ini
          </v-card-subtitle>

          <v-chip color="blue" size="small" variant="tonal">
            {{ currentStatusLabel }}
          </v-chip>

          <v-progress-linear
            class="mt-4"
            color="blue"
            :model-value="progressPercent"
            rounded
          />

          <div class="text-body-small mt-2">
            {{ completedSteps }} / {{ timelineStatus.length }} tahapan selesai
          </div>

          <v-progress-circular
            class="mt-4"
            color="primary"
            :model-value="progressPercent"
            size="72"
            width="7"
          >
            {{ progressPercent }}%
          </v-progress-circular>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-card class="mt-4" elevation="2" rounded="lg">
    <v-card-title>
      Perjalanan Pengaduan
    </v-card-title>

    <v-divider />

    <v-card-text>
      <v-timeline density="compact" line-inset="8" side="end">
        <v-timeline-item
          v-for="stage in timelineStatus"
          :key="stage.key"
          :dot-color="stage.done ? stage.color : 'grey-lighten-1'"
          fill-dot
          :icon="stage.done ? 'i-mdi:check' : 'i-mdi:clock-outline'"
          size="small"
        >
          <v-card rounded="lg" :variant="stage.done ? 'elevated' : 'outlined'">
            <v-card-text>
              <div class="timeline-row-head">
                <strong>{{ stage.label }}</strong>
                <v-chip
                  :color="stage.done ? 'green' : 'grey-darken-1'"
                  size="x-small"
                  variant="tonal"
                >
                  {{ stage.done ? 'Selesai' : 'Menunggu' }}
                </v-chip>
              </div>

              <div class="text-body-medium mt-1">
                {{ stage.description }}
              </div>

              <div v-if="stage.done && stage.date" class="text-body-small mt-1">
                {{ fdate(stage.date) }}
                <span v-if="stage.number">• {{ stage.number }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
  </v-card>

  <v-row class="mt-2" density="comfortable">
    <v-col cols="1/1" md="1/3" sm="1/2">
      <v-btn block color="primary" to="/pelanggan/pengaduan" variant="flat">
        Buat Pengaduan Baru
      </v-btn>
    </v-col>
    <v-col cols="1/1" md="1/3" sm="1/2">
      <v-btn block :to="`/pelanggan/pengaduan?tiket=${tiketId}`" variant="outlined">
        Muat Ulang Status
      </v-btn>
    </v-col>
  </v-row>
</template>

<style scoped>
  .timeline-row-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  @media (max-width: 599px) {
    .timeline-row-head {
      align-items: flex-start;
      flex-direction: column;
      gap: 6px;
    }
  }
</style>
