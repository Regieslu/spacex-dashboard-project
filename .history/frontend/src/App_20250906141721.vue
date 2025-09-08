<!-- <template>
  <main style="padding: 16px; max-width: 1100px; margin: 0 auto">
    <h1>SpaceX BFF</h1>
    <section>
      <h2>Launches by month</h2>
      <LaunchesByMonth />
    </section>
    <section style="margin-top: 24px">
      <h2>Sanity check (Starlink count)</h2>
      <button @click="loadStarlink">Load Starlink</button>
      <p v-if="loading">Loading...</p>
      <p v-else-if="error" style="color: red">Error: {{ error }}</p>
      <p v-else-if="count !== null">Starlink: {{ count }}</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getStarlink } from "./api";
import LaunchesByMonth from "./components/charts/LaunchesByMonth.vue";

const loading = ref(false);
const error = ref<string | null>(null);
const count = ref<number | null>(null);

async function loadStarlink() {
  loading.value = true;
  error.value = null;
  try {
    const data = await getStarlink();
    count.value = Array.isArray(data) ? data.length : 0;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Unknown error";
  } finally {
    loading.value = false;
  }
}
</script> -->
<template>
  <main style="padding: 16px; max-width: 1100px; margin: 0 auto">
    <h1>SpaceX Dashboard</h1>

    <section style="margin-top: 24px">
      <h2>Estado por año (barras apiladas)</h2>
      <LaunchesStackedStatus />
    </section>
  </main>
</template>

<script setup lang="ts">
import LaunchesStackedStatus from "./components/charts/LaunchesStackedStatus.vue";
</script>
