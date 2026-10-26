<script lang="ts" setup>
  const { getItems } = useDirectusItems()

  function formatValue (value: number | string | null | undefined) {
    return useNumberFormat(value) ?? value
  }

  const { data } = await useAsyncData(
    'statistic',
    () => getItems<any>({
      collection: 'statistik',
      params: {
        sort: ['sort', 'id'],
      },
    }),
  )
</script>

<template>
  <v-container max-width="1080">
    <h3 class="text-headline-small font-weight-bold text-center mb-6">
      Perumda Tirta Patriot dalam Angka
    </h3>

    <v-row justify="center">
      <v-col
        v-for="(s) of data"
        :key="s.id"
        cols="1/2"
        md="1/4"
      >
        <v-card
          class="text-center py-5 px-2 h-100 d-flex flex-column justify-center"
          color="primary"
          rounded="xl"
          variant="tonal"
        >
          <div class="text-headline-medium text-sm-headline-large font-weight-bold">
            {{ formatValue(s.value) }}
          </div>

          <div class="text-body-medium text-medium-emphasis mt-1">
            {{ s.name }}
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
