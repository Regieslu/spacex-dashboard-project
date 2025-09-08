<script setup lang="ts">
import LaunchesCombo from "../components/charts/LaunchesByMonth.vue";
import LaunchesStackedPretty from "../components/charts/LaunchesStackedStatus.vue";
import RocketsRadar from "../components/charts/RocketsRadar.vue";
import { useSpacexStore } from "../stores/useSpacexStore";
import { onMounted } from "vue";

const spacexStore = useSpacexStore();

onMounted(async () => {
  // Cargar todos los datos de una vez
  await spacexStore.fetchAllData();
});
</script>
<template>
  <section class="panel">
    <div class="grid">
      <div class="card"><LaunchesCombo /></div>
      <div class="card"><LaunchesStackedPretty /></div>
      <div class="card" style="grid-column: 1 / -1"><RocketsRadar /></div>
    </div>
  </section>
</template>
<style scoped>
.panel {
  padding: 16px;
  color: #e5e7eb;
}
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 900px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
