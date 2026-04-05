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
  <v-container>
    <h3 class="text-white text-center text-headline-small">
      Statistik Terakhir
    </h3>
    <v-divider />
    <v-row class="pt-4 justify-center">
      <v-col
        v-for="(s) of data"
        :key="s.id"
        cols="1/2"
        lg="1/4"
        sm="1/3"
        xl="auto"
      >
        <v-card min-width="120" rounded variant="text">
          <v-card-title class="text-center text-white text-label-small">
            {{ s.name }}

            <div class="font-weight-bold text-headline-medium">
              {{ formatValue(s.value) }}
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
