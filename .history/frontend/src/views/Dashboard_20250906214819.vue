<template>
  <main style="padding: 16px; max-width: 1100px; margin: 0 auto">
    <!-- Loading global -->
    <div v-if="spacexStore.isLoading" style="text-align: center; padding: 40px">
      <p>Cargando datos de SpaceX...</p>
    </div>

    <!-- Error global -->
    <div
      v-else-if="spacexStore.error"
      style="color: red; text-align: center; padding: 40px"
    >
      <p>Error: {{ spacexStore.error }}</p>
      <button @click="retryLoad">Reintentar</button>
    </div>
    <div v-else>
      <section>
        <h2>Launches by Month</h2>
        <LaunchesByMonth />
      </section>

      <section>
        <h2>Status by Year</h2>
        <LaunchesStackedStatus />
      </section>

      <section>
        <h2>Rockets Radar</h2>
        <RocketsRadar />
      </section>

      <section>
        <h2>Starlink Globe</h2>
        <StarLinkGlobe />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import LaunchesByMonth from "../components/charts/LaunchesByMonth.vue";
import LaunchesStackedStatus from "../components/charts/LaunchesStackedStatus.vue";
import RocketsRadar from "../components/charts/RocketsRadar.vue";
import StarLinkGlobe from "../components/starlink/StarLinkGlobe.vue";

const spacexStore = useSpacexStore();

onMounted(async () => {
  // Cargar todos los datos de una vez
  await spacexStore.fetchAllData();
});

const retryLoad = async () => {
  spacexStore.clearCache();
  await spacexStore.fetchAllData();
};
</script>
<style scoped>
.panel {
  padding: 16px;
  color: #e5e7eb;
}
h1 {
  font-size: 20px;
  margin-bottom: 8px;
}
</style>
