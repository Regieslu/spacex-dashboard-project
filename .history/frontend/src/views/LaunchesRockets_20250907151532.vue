<script setup lang="ts">
import LaunchesCombo from "../components/charts/LaunchesByMonth.vue";
import LaunchesStackedPretty from "../components/charts/LaunchesStackedStatus.vue";
import RocketsRadar from "../components/charts/RocketsRadar.vue";
import { useSpacexStore } from "../stores/useSpacexStore";
import { onMounted } from "vue";

const spacexStore = useSpacexStore();

onMounted(async () => {
  // Solo cargar los datos específicos que necesita esta vista
  await Promise.all([
    spacexStore.fetchLaunches(),
    spacexStore.fetchRockets()
  ]);
});

const retryLoad = async () => {
  spacexStore.clearCache();
  await Promise.all([
    spacexStore.fetchLaunches(),
    spacexStore.fetchRockets()
  ]);
};
</script>
<template>
  <section class="panel">
    <!-- Loading state -->
    <div v-if="spacexStore.isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando datos de SpaceX...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="spacexStore.error" class="error-state">
      <p>Error: {{ spacexStore.error }}</p>
      <button @click="retryLoad" class="retry-btn">Reintentar</button>
    </div>

    <!-- Content -->
    <div v-else class="grid">
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

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #eceff1;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #263238;
  border-top: 3px solid #ff58b0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.retry-btn {
  background: #ff58b0;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
}

.retry-btn:hover {
  background: #ff83c4;
}

@media (min-width: 900px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
