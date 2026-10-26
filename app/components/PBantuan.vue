<template>
  <v-card
    class="bantuan mt-8"
    color="primary"
    rounded="xl"
    variant="tonal"
  >
    <div class="bantuan-info">
      <v-avatar color="green-darken-3" size="48">
        <v-icon color="white" icon="i-mdi:whatsapp" size="26" />
      </v-avatar>

      <div>
        <div class="text-title-medium font-weight-bold">
          Butuh Bantuan Langsung?
        </div>

        <div class="text-body-medium text-medium-emphasis">
          Hubungi Contact Center WhatsApp resmi atau kunjungi kantor pelayanan kami.
        </div>
      </div>
    </div>

    <div class="bantuan-actions">
      <v-btn
        class="text-none"
        color="green-darken-3"
        href="https://wa.me/6287875163845"
        prepend-icon="i-mdi:whatsapp"
        rel="noopener noreferrer"
        target="_blank"
        variant="flat"
      >
        WhatsApp
      </v-btn>

      <v-btn
        class="text-none"
        color="primary"
        prepend-icon="i-mdi:map-marker-outline"
        to="/perusahaan/kontak"
        variant="flat"
      >
        Kontak UPP
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
  .bantuan {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .bantuan-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .bantuan-info {
    flex: 1;
  }

  .bantuan-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  @media (width >= 600px) {
    .bantuan {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 24px;
    }

    .bantuan-actions {
      flex-shrink: 0;
      flex-wrap: nowrap;
    }
  }
</style>
