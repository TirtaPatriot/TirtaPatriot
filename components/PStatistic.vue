<script lang="ts" setup>
const { getItems } = useDirectusItems()

const { data } = await useAsyncData(
  'statistic',
  () => getItems<any>({
    collection: 'statistik',
  }),
)
</script>

<template>
  <v-container>
    <h3 class="text-white text-center text-h6">
      Statistik Terakhir
    </h3>
    <v-divider />
    <v-row justify="center">
      <v-col v-for="(s) of data" :key="s.id" cols="auto">
        <v-card min-width="120" rounded variant="text">
          <v-card-title class="text-center text-white text-overline">
            {{ s.name }}

            <div class="font-weight-bold text-h5">
              {{ s.value }}
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>

</style>
